import { Context } from 'hono';
import { db } from './db';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// Relying Party configuration
const RP_NAME = 'Doable';

function getOrigin(c: Context) {
    const proto = c.req.header('x-forwarded-proto') || 'http';
    const host = c.req.header('x-forwarded-host') || c.req.header('host') || new URL(c.req.url).host;
    return `${proto}://${host}`;
}

function getRpId(c: Context) {
    const origin = getOrigin(c);
    return new URL(origin).hostname;
}

function getExpectedOrigin(c: Context) {
    return getOrigin(c);
}

export const registerOptions = async (c: Context) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userPasskeys = db.query('SELECT credential_id FROM passkeys WHERE user_id = ?').all(user.id) as any[];

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: getRpId(c),
        userID: new Uint8Array(Buffer.from(user.id.toString())),
        userName: user.email,
        attestationType: 'none',
        excludeCredentials: userPasskeys.map(pk => ({
            id: pk.credential_id, // simplewebauthn expects base64url strings for id
            type: 'public-key',
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    // Save challenge to session
    const session = c.get('session');
    session.challenge = options.challenge;

    return c.json(options);
};

export const registerVerify = async (c: Context) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json() as RegistrationResponseJSON;
    const session = c.get('session');
    const expectedChallenge = session.challenge;

    if (!expectedChallenge) {
        return c.json({ error: 'Challenge not found in session' }, 400);
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: getExpectedOrigin(c),
            expectedRPID: getRpId(c),
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;

            // Clear challenge
            session.challenge = undefined;

            db.query(`INSERT INTO passkeys (id, user_id, credential_id, public_key, counter, transports) 
                      VALUES (?, ?, ?, ?, ?, ?)`)
              .run(
                  crypto.randomUUID(),
                  user.id,
                  credential.id,
                  Buffer.from(credential.publicKey).toString('base64'),
                  credential.counter,
                  JSON.stringify(credential.transports || [])
              );

            return c.json({ verified: true });
        }
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }

    return c.json({ verified: false }, 400);
};

export const loginOptions = async (c: Context) => {
    const options = await generateAuthenticationOptions({
        rpID: getRpId(c),
        userVerification: 'preferred',
    });

    const session = c.get('session');
    session.challenge = options.challenge;

    return c.json(options);
};

export const loginVerify = async (c: Context) => {
    const body = await c.req.json() as AuthenticationResponseJSON;
    const session = c.get('session');
    const expectedChallenge = session.challenge;

    if (!expectedChallenge) {
        return c.json({ error: 'Challenge not found in session' }, 400);
    }

    // Find passkey in DB
    const passkey = db.query('SELECT * FROM passkeys WHERE credential_id = ?').get(body.id) as any;
    
    if (!passkey) {
        return c.json({ error: 'Passkey not found' }, 400);
    }

    try {
        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: getExpectedOrigin(c),
            expectedRPID: getRpId(c),
            credential: {
                id: passkey.credential_id,
                publicKey: new Uint8Array(Buffer.from(passkey.public_key, 'base64')),
                counter: passkey.counter,
                transports: JSON.parse(passkey.transports || '[]'),
            },
        });

        if (verification.verified && verification.authenticationInfo) {
            // Clear challenge
            session.challenge = undefined;

            // Update counter and last_used_at
            db.query('UPDATE passkeys SET counter = ?, last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(
                verification.authenticationInfo.newCounter,
                passkey.id
            );

            // Log user in
            delete session.password_confirmed_at;
            delete session.left_security_at;
            session.userId = passkey.user_id;

            return c.json({ verified: true, redirect: '/dashboard' });
        }
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }

    return c.json({ verified: false }, 400);
};

export const confirmVerify = async (c: Context) => {
    const user = c.get('user');
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }

    const session = c.get('session');
    const expectedChallenge = session.challenge;
    if (!expectedChallenge) return c.json({ error: 'No challenge found' }, 400);

    const passkey = db.query("SELECT * FROM passkeys WHERE credential_id = ? AND user_id = ?").get(body.id, Number(user.id)) as any;
    if (!passkey) return c.json({ error: 'Passkey not found for this user' }, 404);

    try {
        let transports: string[] = [];
        try {
            transports = JSON.parse(passkey.transports || '[]');
        } catch {
            transports = passkey.transports ? passkey.transports.split(',') : [];
        }

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: getExpectedOrigin(c),
            expectedRPID: getRpId(c),
            credential: {
                id: passkey.credential_id,
                publicKey: new Uint8Array(Buffer.from(passkey.public_key, 'base64')),
                counter: passkey.counter,
                transports,
            },
        });

        if (verification.verified && verification.authenticationInfo) {
            session.challenge = undefined;
            db.query("UPDATE passkeys SET counter = ?, last_used_at = CURRENT_TIMESTAMP WHERE id = ?").run(verification.authenticationInfo.newCounter, passkey.id);
            session.password_confirmed_at = Date.now();
            session.left_security_at = undefined;
            return c.json({ verified: true, ok: true, redirect: session.intended_url || '/dashboard' });
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
    return c.json({ error: 'Verification failed' }, 400);
};
