import settingsRoute from './routes/settings';
import preferencesRoute from './routes/preferences';
import { registerOptions, registerVerify, loginOptions, loginVerify, confirmVerify } from './passkeys';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { inertia } from '@hono/inertia';
import { sessionMiddleware, authMiddleware, guestMiddleware, setFlash, setErrors } from './session';
import { db } from './db';
import { encrypt, decrypt } from './crypto';
import tasksRoute from './routes/tasks';
import habitsRoute from './routes/habits';

const findUserByEmailStmt = db.prepare("SELECT * FROM users WHERE email = ?");
const insertUserStmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id");
const deleteSessionByIdStmt = db.prepare("DELETE FROM sessions WHERE id = ?");
const getDashboardTasksStmt = db.prepare("SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL ORDER BY position ASC, created_at DESC");
const getDashboardHabitsStmt = db.prepare("SELECT * FROM habits WHERE user_id = ? AND deleted_at IS NULL AND is_active = 1 ORDER BY position ASC, created_at DESC");
const getDashboardHabitEntriesStmt = db.prepare("SELECT e.* FROM habit_entries e JOIN habits h ON e.habit_id = h.id WHERE h.user_id = ?");
const getUserPasswordStmt = db.prepare("SELECT password FROM users WHERE id = ?");
const getPasskeysForUserStmt = db.prepare("SELECT id, created_at, last_used_at FROM passkeys WHERE user_id = ? ORDER BY created_at DESC");
const deletePasskeyStmt = db.prepare("DELETE FROM passkeys WHERE id = ? AND user_id = ?");
const updateAccentPrefStmt = db.prepare("UPDATE users SET accent = ? WHERE id = ?");
const updateTimezonePrefStmt = db.prepare("UPDATE users SET timezone = ? WHERE id = ?");

function calculateStreaks(dates: string[], todayStr: string) {
    if (!dates || dates.length === 0) return { current: 0, longest: 0 };
    const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
    
    let current = 0;
    let longest = 0;
    
    const days = sorted.map(d => {
        const dt = new Date(d + 'T00:00:00');
        return Math.floor(dt.getTime() / 86400000);
    });
    
    const todayDay = Math.floor(new Date(todayStr + 'T00:00:00').getTime() / 86400000);
    
    let expectedDay = todayDay;
    if (days[0] === todayDay) {
        current = 1;
        expectedDay = todayDay - 1;
        for (let i = 1; i < days.length; i++) {
            if (days[i] === expectedDay) {
                current++;
                expectedDay--;
            } else break;
        }
    } else if (days[0] === todayDay - 1) {
        current = 1;
        expectedDay = todayDay - 2;
        for (let i = 1; i < days.length; i++) {
            if (days[i] === expectedDay) {
                current++;
                expectedDay--;
            } else break;
        }
    }
    
    if (days.length > 0) {
        let tempStreak = 1;
        longest = 1;
        for (let i = 1; i < days.length; i++) {
            if (days[i] === days[i-1] - 1) {
                tempStreak++;
                if (tempStreak > longest) longest = tempStreak;
            } else {
                tempStreak = 1;
            }
        }
    }
    return { current, longest };
}

const app = new Hono();

// Cache template and production assets in memory
let cachedRootHtml: string | null = null;
let cachedViteInject: string | null = null;

async function getViteInject(): Promise<string> {
    if (process.env.NODE_ENV === 'production' && cachedViteInject) {
        return cachedViteInject;
    }
    
    if (process.env.NODE_ENV === 'production') {
        const manifestStr = await Bun.file('./public/build/.vite/manifest.json').text().catch(() => '{}');
        const manifest = JSON.parse(manifestStr);
        let viteInject = '';
        
        const cssFiles = new Set<string>();
        for (const key of Object.keys(manifest)) {
            const item = manifest[key];
            if (item.css && Array.isArray(item.css)) {
                item.css.forEach((c: string) => cssFiles.add(c));
            }
            if (item.file && item.file.endsWith('.css')) {
                cssFiles.add(item.file);
            }
        }
        
        cssFiles.forEach((css) => {
            viteInject += `<link rel="stylesheet" href="/build/${css}">\n`;
        });

        if (manifest['resources/js/app.ts']) {
            const entry = manifest['resources/js/app.ts'];
            viteInject += `<script type="module" src="/build/${entry.file}"></script>`;
        }
        cachedViteInject = viteInject;
        return viteInject;
    }

    return `
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <script type="module" src="http://localhost:5173/resources/js/app.ts"></script>
    `;
}

async function getRootHtml(): Promise<string> {
    if (process.env.NODE_ENV === 'production' && cachedRootHtml) {
        return cachedRootHtml;
    }
    const html = await Bun.file('./resources/views/root.html').text();
    if (process.env.NODE_ENV === 'production') {
        cachedRootHtml = html;
    }
    return html;
}

app.use('*', async (c, next) => {
    const start = performance.now();
    await next();
    const duration = (performance.now() - start).toFixed(2);
    c.res.headers.set('Server-Timing', `app;dur=${duration}`);
});

// Static asset caching middleware
app.use('/build/*', async (c, next) => {
    await next();
    if (c.res.status === 200) {
        c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
});

app.use('/build/*', serveStatic({ root: './public' }));
app.use('/avatars/*', serveStatic({ root: './public' }));
app.use('/favicon.svg', serveStatic({ path: './public/favicon.svg' }));
app.use('/favicon.png', serveStatic({ path: './public/favicon.png' }));
app.use('/favicon.ico', serveStatic({ path: './public/favicon.png' }));
app.use('/apple-touch-icon.png', serveStatic({ path: './public/apple-touch-icon.png' }));
app.use('/og-image.png', serveStatic({ path: './public/og-image.png' }));
app.use('/logo.png', serveStatic({ path: './public/apple-touch-icon.png' }));
app.use('/robots.txt', serveStatic({ path: './public/robots.txt' }));

app.use('*', sessionMiddleware);
const securityLockMiddleware = async (c, next) => {
    const session = c.get('session');
    if (!session) return next();

    const url = new URL(c.req.url);
    const path = url.pathname;
    
    // Ignore static assets, api routes
    if (path.startsWith('/build') || path.startsWith('/avatars')) return next();

    const isSecurityPage = path === '/settings/security' || path.startsWith('/user/confirm-password') || path.startsWith('/passkeys/confirm');

    const isHtmlOrInertia = c.req.header('x-inertia') === 'true' || c.req.header('accept')?.includes('text/html');
    if (c.req.method === 'GET' && isHtmlOrInertia && !c.req.header('x-inertia-partial-data')) {
        if (!isSecurityPage) {
            if (!session.left_security_at) {
                session.left_security_at = Date.now();
            }
        } else {
            if (session.left_security_at) {
                if (Date.now() - session.left_security_at > 15000) {
                    session.password_confirmed_at = undefined;
                }
                session.left_security_at = undefined;
            }
        }
    }
    
    await next();
};

app.use('*', securityLockMiddleware);

// Passkeys
app.get('/api/passkeys/register', authMiddleware, registerOptions);
app.post('/api/passkeys/register', authMiddleware, registerVerify);
app.get('/api/passkeys/login', loginOptions);
app.post('/api/passkeys/login', loginVerify);
app.get('/passkeys/confirm/options', authMiddleware, loginOptions);
app.post('/passkeys/confirm', authMiddleware, confirmVerify);

app.use('*', inertia({
    rootView: async (page, c) => {
        const [html, viteInject] = await Promise.all([getRootHtml(), getViteInject()]);

        const appHtml = html
            .replace('<!-- vite-inject -->', viteInject)
            .replace('<!-- inertia -->', `<div id="app"></div>\n<script type="application/json" data-page="app">${JSON.stringify(page).replace(/</g, '\\u003c')}</script>`);
        
        return appHtml;
    },
    share: (c) => ({
        auth: { user: c.get('user') || null },
        flash: c.get('flash') || {},
        errors: c.get('errors') || {},
    })
}));

app.route('/tasks', tasksRoute);
app.route('/habits', habitsRoute);

app.route('/settings', settingsRoute);
app.route('/preferences', preferencesRoute);


app.get('/', (c) => {
    if (c.get('session').userId) return c.redirect('/dashboard', 303);
    return c.render('Welcome', {
        canLogin: true,
        canRegister: true,
    });
});

app.get('/login', guestMiddleware, (c) => c.render('auth/Login', { canResetPassword: true }));
app.post('/login', guestMiddleware, async (c) => {
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    const user = findUserByEmailStmt.get(body.email as string) as any;
    if (user && await Bun.password.verify(body.password as string, user.password)) {
        delete c.get('session').password_confirmed_at;
        delete c.get('session').left_security_at;
        c.get('session').userId = user.id;
        return c.redirect('/dashboard', 303);
    }
    setErrors(c, { email: 'These credentials do not match our records.' });
    return c.redirect('/login', 303);
});

app.get('/register', guestMiddleware, (c) => c.render('auth/Register'));
app.post('/register', guestMiddleware, async (c) => {
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (!body.password || (body.password as string).length < 8) {
        setErrors(c, { password: 'Password must be at least 8 characters long.' });
        return c.redirect('/register', 303);
    }
    const hash = await Bun.password.hash(body.password as string, { algorithm: "bcrypt" });
    const name = encrypt(body.name as string);
    try {
        const result = insertUserStmt.get(name, body.email, hash) as any;
        delete c.get('session').password_confirmed_at;
        delete c.get('session').left_security_at;
        c.get('session').userId = result.id;
        return c.redirect('/dashboard', 303);
    } catch(e: any) {
        console.error("Registration error:", e);
        setErrors(c, { email: 'Email already taken' });
        return c.redirect('/register', 303);
    }
});

app.post('/logout', authMiddleware, (c) => {
    const session = c.get('session');
    for (const key of Object.keys(session)) {
        delete session[key];
    }
    const sessionId = c.get('sessionId');
    if (sessionId) {
        deleteSessionByIdStmt.run(sessionId);
    }
    return c.redirect('/', 303);
});

app.get('/dashboard', authMiddleware, (c) => {
    const userId = c.get('user').id;
    
    const tasksRaw = getDashboardTasksStmt.all(userId) as any[];
    const tasksRawProcessed = tasksRaw.map(r => {
        r.title = decrypt(r.title);
        r.notes = decrypt(r.notes);
        return r;
    });

    const habitsRaw = getDashboardHabitsStmt.all(userId) as any[];
    const habitEntriesRaw = getDashboardHabitEntriesStmt.all(userId) as any[];

    const today = new Date().toISOString().split('T')[0];

    const habits = habitsRaw.map(h => {
        h.name = decrypt(h.name);
        const entries = habitEntriesRaw.filter(e => e.habit_id === h.id);
        const doneToday = entries.some(e => e.entry_date === today);
        return {
            ...h,
            done_today: doneToday,
            current_streak: calculateStreaks(entries.map(e => e.entry_date), today).current,
            longest_streak: calculateStreaks(entries.map(e => e.entry_date), today).longest,
            entries: entries.map(e => e.entry_date)
        };
    });

    const important_open = tasksRawProcessed.filter(t => t.status === 'open' && t.bucket === 'important').length;
    const habits_done_today = habits.filter(h => h.done_today).length;
    const habits_total = habits.length;
    
    // Sort focus tasks by priority DESC, then due_date ASC
    const focus = tasksRawProcessed
        .filter(t => t.status === 'open' && t.bucket === 'important')
        .sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
            if (a.due_date) return -1;
            if (b.due_date) return 1;
            return 0;
        })
        .slice(0, 5); // Limit to top 5

    return c.render('Dashboard', {
        today,
        greetingName: c.get('user').name,
        insights: [],
        focus,
        habits,
        stats: {
            important_open,
            habits_done_today,
            habits_total
        }
    });
});

// Password Confirmation
app.get('/user/confirm-password', authMiddleware, (c) => c.render('auth/ConfirmPassword'));
app.post('/user/confirm-password', authMiddleware, async (c) => {
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    const user = getUserPasswordStmt.get(c.get('user').id) as any;
    if (await Bun.password.verify(body.password, user.password)) {
        c.get('session').password_confirmed_at = Date.now();
        return c.redirect(c.get('session').intended_url || '/dashboard', 303);
    } else {
        setErrors(c, { password: 'Password is incorrect.' });
        return c.redirect('/user/confirm-password', 303);
    }
});


const passwordConfirmMiddleware = async (c, next) => {
    const session = c.get('session');
    // Confirm password valid for 3 hours
    if (session.password_confirmed_at && Date.now() - session.password_confirmed_at < 3 * 60 * 60 * 1000) {
        return next();
    }
    session.intended_url = new URL(c.req.url).pathname;
    return c.redirect('/user/confirm-password', 303);
};

function timeAgo(date: string | Date | null | undefined): string {
    if (!date) return 'never';
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const formattedStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const d = new Date(formattedStr);
    const now = Date.now();
    const diffSec = Math.floor((now - d.getTime()) / 1000);

    if (isNaN(diffSec) || diffSec < 30) return 'just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffDays / 365);
    if (diffYears === 1) return '1 year ago';
    return `${diffYears} years ago`;
}

app.get('/settings/profile', authMiddleware, (c) => c.render('settings/Profile'));
app.get('/settings/security', authMiddleware, passwordConfirmMiddleware, (c) => {
    const passkeys = (getPasskeysForUserStmt.all(c.get('user').id) as any[]).map((p: any) => ({
        id: p.id,
        name: 'Passkey',
        last_used_at: p.last_used_at || p.created_at,
        created_at: p.created_at,
        created_at_diff: timeAgo(p.created_at),
        last_used_at_diff: timeAgo(p.last_used_at || p.created_at)
    }));
    return c.render('settings/Security', { canManagePasskeys: true, passkeys });
});

app.delete('/user/passkeys/:id', authMiddleware, (c) => {
    deletePasskeyStmt.run(c.req.param('id'), c.get('user').id);
    return c.redirect('/settings/security', 303);
});

app.get('/settings/appearance', authMiddleware, (c) => c.render('settings/Appearance'));

app.notFound((c) => {
    if (c.get('session')?.userId) {
        return c.redirect('/dashboard', 303);
    }
    return c.redirect('/', 303);
});

const PORT = Number(process.env.PORT || process.env.DOABLE_PORT || 8000);
export default { 
    port: PORT, 
    reusePort: true, 
    fetch(req: Request, env: any) {
        if (req.method === 'POST') {
            const url = new URL(req.url);
            const override = url.searchParams.get('_method') || req.headers.get('x-http-method-override');
            if (override) {
                const upper = override.toUpperCase();
                if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(upper)) {
                    const newReq = new Request(req.url, {
                        method: upper,
                        headers: req.headers,
                        body: req.body,
                        duplex: 'half'
                    } as any);
                    return app.fetch(newReq, env);
                }
            }
        }
        return app.fetch(req, env);
    }
};
