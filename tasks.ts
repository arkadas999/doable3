import { Hono } from 'hono';
import { db } from '../db';
import { authMiddleware, setFlash, setErrors } from '../session';
import { encrypt, decrypt } from '../crypto';

const tasks = new Hono();
tasks.use('*', authMiddleware);

const getTasksForUserStmt = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY position ASC, created_at DESC");
const insertTaskStmt = db.prepare("INSERT INTO tasks (user_id, title, notes, bucket, due_date, priority) VALUES (?, ?, ?, ?, ?, ?)");
const getTaskByIdAndUserStmt = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
const updateTaskStmt = db.prepare("UPDATE tasks SET title = ?, notes = ?, bucket = ?, status = ?, completed_at = ?, due_date = ?, priority = ? WHERE id = ?");
const softDeleteTaskStmt = db.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ? AND user_id = ?");
const restoreTaskStmt = db.prepare("UPDATE tasks SET deleted_at = NULL WHERE id = ? AND user_id = ?");
const forceDeleteTaskStmt = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
const reorderTaskStmt = db.prepare("UPDATE tasks SET position = ? WHERE id = ? AND user_id = ?");

tasks.get('/', (c) => {
    const userId = c.get('user').id;
    // We need deleted_at tasks for the 'bin'
    const rows = getTasksForUserStmt.all(userId) as any[];
    
    rows.forEach(r => {
        r.title = decrypt(r.title);
        r.notes = decrypt(r.notes);
    });

    const important = rows.filter(t => !t.deleted_at && t.status === 'open' && t.bucket === 'important');
    const eventual = rows.filter(t => !t.deleted_at && t.status === 'open' && t.bucket === 'eventual');
    const completed = rows.filter(t => !t.deleted_at && t.status === 'done');
    const bin = rows.filter(t => t.deleted_at);
    const today = new Date().toISOString().split('T')[0];

    return c.render('Tasks', { today, important, eventual, completed, bin });
});

tasks.post('/', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (!body.title) {
        setErrors(c, { title: 'Title is required' });
        return c.redirect('back', 303);
    }

    const title = encrypt(body.title as string);
    const notes = encrypt((body.notes as string) || null);
    const bucket = body.bucket || 'important';
    const due_date = body.due_date || null;
    const priority = body.priority !== undefined ? parseInt(body.priority) : 0;

    insertTaskStmt.run(userId, title, notes, bucket, due_date, priority);

    setFlash(c, 'success', 'Task created successfully.');
    const referer = c.req.header('referer') || '/dashboard';
    return c.redirect(referer, 303);
});

tasks.patch('/:id', async (c) => {
    const userId = c.get('user').id;
    const taskId = c.req.param('id');
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    const task = getTaskByIdAndUserStmt.get(taskId, userId) as any;
    if (!task) return c.notFound();

    let title = task.title;
    let notes = task.notes;
    let bucket = task.bucket;
    let status = task.status;
    let completed_at = task.completed_at;
    let due_date = task.due_date;
    let priority = task.priority;

    if (body.title) title = encrypt(body.title as string);
    if (body.notes !== undefined) notes = body.notes ? encrypt(body.notes as string) : null;
    if (body.bucket) bucket = body.bucket;
    if (body.due_date !== undefined) due_date = body.due_date || null;
    if (body.priority !== undefined) priority = parseInt(body.priority);
    if (body.status) {
        status = body.status;
        completed_at = status === 'done' ? new Date().toISOString() : null;
    }

    updateTaskStmt.run(title, notes, bucket, status, completed_at, due_date, priority, taskId);

    setFlash(c, 'success', 'Task updated.');
    const referer = c.req.header('referer') || '/dashboard';
    return c.redirect(referer, 303);
});

tasks.delete('/:id', async (c) => {
    const userId = c.get('user').id;
    const taskId = c.req.param('id');
    
    softDeleteTaskStmt.run(new Date().toISOString(), taskId, userId);

    setFlash(c, 'success', 'Task deleted.');
    const referer = c.req.header('referer') || '/dashboard';
    return c.redirect(referer, 303);
});

tasks.post('/:id/restore', async (c) => {
    const userId = c.get('user').id;
    const taskId = c.req.param('id');
    
    restoreTaskStmt.run(taskId, userId);
    setFlash(c, 'success', 'Task restored.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

tasks.delete('/:id/force', async (c) => {
    const userId = c.get('user').id;
    const taskId = c.req.param('id');
    forceDeleteTaskStmt.run(taskId, userId);
    return c.redirect('/dashboard', 303);
});

const reorderTx = db.transaction((ids: number[], userId: number) => {
    ids.forEach((id, index) => {
        reorderTaskStmt.run(index, id, userId);
    });
});

tasks.put('/reorder', async (c) => {
    const userId = c.get('user').id;
    const body = await c.req.json().catch(() => c.req.parseBody());
    if (body.orderedIds && Array.isArray(body.orderedIds)) {
        reorderTx(body.orderedIds, userId);
    }
    return c.redirect('/tasks', 303);
});

export default tasks;
