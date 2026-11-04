import { Hono } from 'hono';
import { db } from '../db';
import { authMiddleware } from '../session';

const preferences = new Hono();
preferences.use('*', authMiddleware);

const updateAccentStmt = db.prepare("UPDATE users SET accent = ? WHERE id = ?");
const updateTimezoneStmt = db.prepare("UPDATE users SET timezone = ? WHERE id = ?");
const updateThemeStmt = db.prepare("UPDATE users SET theme = ? WHERE id = ?");

preferences.patch('/accent', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (body.accent) {
        updateAccentStmt.run(body.accent, userId);
    }
    
    return c.redirect(c.req.header('referer') || '/settings/appearance', 303);
});

preferences.patch('/timezone', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (body.timezone) {
        updateTimezoneStmt.run(body.timezone, userId);
    }
    
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

preferences.patch('/theme', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (body.theme) {
        updateThemeStmt.run(body.theme, userId);
    }
    
    return c.redirect(c.req.header('referer') || '/settings/appearance', 303);
});

export default preferences;
