import fs from 'fs';
import { Hono } from 'hono';
import { db } from '../db';
import { authMiddleware, setFlash, setErrors } from '../session';
import { encrypt } from '../crypto';

const settings = new Hono();
settings.use('*', authMiddleware);

const updateUserProfileStmt = db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
const getUserPasswordStmt = db.prepare("SELECT password FROM users WHERE id = ?");
const updateUserPasswordStmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");
const updateUserAvatarStmt = db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
const removeUserAvatarStmt = db.prepare("UPDATE users SET avatar = NULL WHERE id = ?");
const deleteUserStmt = db.prepare("DELETE FROM users WHERE id = ?");

settings.on(['PATCH', 'POST', 'PUT'], '/profile', async (c) => {
    const methodOverride = c.req.query('_method')?.toUpperCase() || c.req.header('x-http-method-override')?.toUpperCase();
    if (methodOverride === 'DELETE' || c.req.method === 'DELETE') {
        return handleDeleteProfile(c);
    }
    return handleUpdateProfile(c);
});

async function handleUpdateProfile(c: any) {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (!body.name || !body.email) {
        setErrors(c, { name: 'Name is required', email: 'Email is required' });
        return c.redirect(c.req.header('referer') || '/settings/profile', 303);
    }

    try {
        updateUserProfileStmt.run(encrypt(body.name), body.email, userId);
        setFlash(c, 'success', 'Profile updated.');
    } catch (e) {
        setErrors(c, { email: 'Email already taken' });
    }
    
    return c.redirect(c.req.header('referer') || '/settings/profile', 303);
}

settings.on(['PUT', 'POST', 'PATCH'], '/password', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }

    if (!body.current_password) {
        setErrors(c, { current_password: 'Current password is required.' });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }

    const user = getUserPasswordStmt.get(userId) as any;
    
    if (!user || !user.password || !(await Bun.password.verify(body.current_password, user.password))) {
        setErrors(c, { current_password: 'Password is incorrect.' });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }

    if (!body.password || body.password.length < 8) {
        setErrors(c, { password: 'Password must be at least 8 characters long.' });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }

    if (body.password === body.current_password) {
        setErrors(c, { password: 'New password must be different from current password.' });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }
    
    if (body.password !== body.password_confirmation) {
        setErrors(c, { 
            password: 'Passwords do not match.',
            password_confirmation: 'Passwords do not match.' 
        });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }

    const hash = await Bun.password.hash(body.password, { algorithm: 'bcrypt' });
    updateUserPasswordStmt.run(hash, userId);
    
    // Refresh security confirmation session
    const session = c.get('session');
    if (session) {
        session.password_confirmed_at = Date.now();
    }
    
    setFlash(c, 'success', 'Password updated successfully.');
    return c.redirect(c.req.header('referer') || '/settings/security', 303);
});

settings.post('/avatar', async (c) => {
    const userId = c.get('user').id;
    const body = await c.req.parseBody();
    
    if (body.avatar) {
        const file = body.avatar; // File object
        if (file && (file as any).size > 0) {
            const buffer = await (file as any).arrayBuffer();
            // generate random name
            const ext = (file as any).name?.split('.').pop() || 'png';
            const filename = crypto.randomUUID() + '.' + ext;
            fs.mkdirSync('public/avatars', { recursive: true });
            fs.writeFileSync('public/avatars/' + filename, Buffer.from(buffer));
            
            updateUserAvatarStmt.run('/avatars/' + filename, userId);
            setFlash(c, 'success', 'Avatar updated.');
        }
    }
    
    return c.redirect(c.req.header('referer') || '/settings/profile', 303);
});

settings.on(['DELETE', 'POST'], '/avatar', async (c) => {
    const userId = c.get('user').id;
    removeUserAvatarStmt.run(userId);
    setFlash(c, 'success', 'Avatar removed.');
    return c.redirect(c.req.header('referer') || '/settings/profile', 303);
});

async function handleDeleteProfile(c: any) {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }

    const user = getUserPasswordStmt.get(userId) as any;
    if (!body.password || !user || !(await Bun.password.verify(body.password, user.password))) {
        setErrors(c, { password: 'Password is incorrect.' });
        return c.redirect(c.req.header('referer') || '/settings/security', 303);
    }

    // Delete user (cascade will handle the rest)
    deleteUserStmt.run(userId);
    c.get('session').userId = undefined;
    
    return c.redirect('/', 303);
}

settings.delete('/profile', handleDeleteProfile);

export default settings;
