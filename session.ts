import { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { randomBytes } from 'crypto';
import { db } from './db';
import { decrypt } from './crypto';

const SESSION_COOKIE_NAME = 'doable_session';
const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type SessionData = {
    userId?: number;
    flash?: any;
    errors?: any;
    password_confirmed_at?: number;
    left_security_at?: number;
    intended_url?: string;
};

declare module 'hono' {
    interface ContextVariableMap {
        session: SessionData;
        sessionId: string;
        flash: any;
        errors: any;
        user?: any;
    }
}

const getSessionStmt = db.prepare("SELECT data, expiry FROM sessions WHERE id = ?");
const deleteSessionStmt = db.prepare("DELETE FROM sessions WHERE id = ?");
const updateSessionStmt = db.prepare("UPDATE sessions SET data = ?, expiry = ?, user_id = ? WHERE id = ?");
const insertSessionStmt = db.prepare("INSERT INTO sessions (id, user_id, data, expiry) VALUES (?, ?, ?, ?)");
const getUserStmt = db.prepare("SELECT id, name, email, timezone, accent, theme, avatar FROM users WHERE id = ?");

function generateSessionId() {
    return randomBytes(32).toString('hex');
}

export const sessionMiddleware = async (c: Context, next: Next) => {
    let sessionId = getCookie(c, SESSION_COOKIE_NAME);
    let sessionData: SessionData = {};
    let isNewSession = false;
    let initialSerialized = '{}';
    let sessionExpiry = 0;

    if (sessionId) {
        // Load from DB
        const row = getSessionStmt.get(sessionId) as any;
        if (row) {
            const exp = new Date(row.expiry).getTime();
            if (exp > Date.now()) {
                sessionData = JSON.parse(row.data);
                initialSerialized = row.data;
                sessionExpiry = exp;
            } else {
                // Expired
                deleteSessionStmt.run(sessionId);
                sessionId = undefined;
                sessionData = {};
            }
        } else {
            sessionId = undefined;
        }
    }

    if (!sessionId) {
        sessionId = generateSessionId();
        isNewSession = true;
        const isSecure = c.req.header('x-forwarded-proto') === 'https' || process.env.NODE_ENV === 'production';
        setCookie(c, SESSION_COOKIE_NAME, sessionId, {
            path: '/',
            httpOnly: true,
            secure: isSecure,
            maxAge: Math.floor(SESSION_EXPIRY_MS / 1000),
            sameSite: 'Lax',
        });
    }

    c.set('sessionId', sessionId);
    c.set('session', sessionData);

    // Flash data handling for Inertia
    const flash = sessionData.flash || {};
    const errors = sessionData.errors || {};
    c.set('flash', flash);
    c.set('errors', errors);

    const hadFlashOrErrors = Boolean(sessionData.flash || sessionData.errors);
    // Clear flash and errors for next request
    if (hadFlashOrErrors) {
        sessionData.flash = undefined;
        sessionData.errors = undefined;
    }

    await next();

    // Only save session back to DB if session data changed, is brand new, or is within 1 day of expiring
    const currentSerialized = JSON.stringify(c.get('session'));
    const isDirty = isNewSession || hadFlashOrErrors || (currentSerialized !== initialSerialized);
    const isNearExpiry = (sessionExpiry - Date.now()) < (1000 * 60 * 60 * 24);

    if (isDirty || isNearExpiry) {
        const expiryDate = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();
        if (isNewSession) {
            insertSessionStmt.run(
                sessionId,
                c.get('session').userId || null,
                currentSerialized,
                expiryDate
            );
        } else {
            updateSessionStmt.run(
                currentSerialized,
                expiryDate,
                c.get('session').userId || null,
                sessionId
            );
        }
    }
};

export function setFlash(c: Context, key: string, value: any) {
    const session = c.get('session');
    if (!session.flash) session.flash = {};
    session.flash[key] = value;
}

export function setErrors(c: Context, errors: Record<string, string>) {
    const session = c.get('session');
    session.errors = errors;
}

export const authMiddleware = async (c: Context, next: Next) => {
    const session = c.get('session');
    if (!session.userId) {
        return c.redirect('/login');
    }

    const user = getUserStmt.get(session.userId) as any;
    if (!user) {
        // Invalid user
        session.userId = undefined;
        return c.redirect('/login');
    }
    
    user.name = decrypt(user.name);

    c.set('user', user);
    await next();
};

export const guestMiddleware = async (c: Context, next: Next) => {
    const session = c.get('session');
    if (session.userId) {
        return c.redirect('/dashboard');
    }
    await next();
};
