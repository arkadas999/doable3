import { Hono } from 'hono';
import { db } from '../db';
import { authMiddleware, setFlash, setErrors } from '../session';
import { encrypt, decrypt } from '../crypto';

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

const habits = new Hono();
habits.use('*', authMiddleware);

const getHabitsForUserStmt = db.prepare("SELECT * FROM habits WHERE user_id = ? ORDER BY position ASC, created_at DESC");
const getHabitEntriesForUserStmt = db.prepare("SELECT e.* FROM habit_entries e JOIN habits h ON e.habit_id = h.id WHERE h.user_id = ?");
const insertHabitStmt = db.prepare("INSERT INTO habits (user_id, name, cadence, target_per_period, color, icon) VALUES (?, ?, ?, ?, ?, ?)");
const getHabitByIdAndUserStmt = db.prepare("SELECT * FROM habits WHERE id = ? AND user_id = ?");
const updateHabitStmt = db.prepare("UPDATE habits SET name = ?, cadence = ?, target_per_period = ?, color = ?, icon = ?, is_active = ? WHERE id = ?");
const getHabitEntryStmt = db.prepare("SELECT id FROM habit_entries WHERE habit_id = ? AND entry_date = ?");
const deleteHabitEntryStmt = db.prepare("DELETE FROM habit_entries WHERE id = ?");
const insertHabitEntryStmt = db.prepare("INSERT INTO habit_entries (habit_id, entry_date) VALUES (?, ?)");
const softDeleteHabitStmt = db.prepare("UPDATE habits SET deleted_at = ? WHERE id = ? AND user_id = ?");
const restoreHabitStmt = db.prepare("UPDATE habits SET deleted_at = NULL WHERE id = ? AND user_id = ?");
const forceDeleteHabitStmt = db.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?");
const reorderHabitStmt = db.prepare("UPDATE habits SET position = ? WHERE id = ? AND user_id = ?");

const reorderHabitsTx = db.transaction((ids: number[], userId: number) => {
    ids.forEach((id: number, index: number) => {
        reorderHabitStmt.run(index, id, userId);
    });
});

habits.get('/', (c) => {
    const userId = c.get('user').id;
    const habitsRaw = getHabitsForUserStmt.all(userId) as any[];
    const habitEntriesRaw = getHabitEntriesForUserStmt.all(userId) as any[];

    const today = new Date().toISOString().split('T')[0];

    const activeHabits = habitsRaw.filter(h => !h.deleted_at).map(h => {
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
    
    const bin = habitsRaw.filter(h => h.deleted_at).map(h => {
        h.name = decrypt(h.name);
        return h;
    });

    return c.render('Habits', {
        today,
        habits: activeHabits,
        bin
    });
});

habits.post('/', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    if (!body.name) {
        setErrors(c, { name: 'Name is required' });
        return c.redirect(c.req.header('referer') || '/dashboard', 303);
    }

    const name = encrypt(body.name as string);
    const cadence = body.cadence || 'daily';
    const target_per_period = parseInt((body.target_per_period as string) || '1');
    const color = body.color || '#f97316';
    const icon = body.icon || null;

    insertHabitStmt.run(userId, name, cadence, target_per_period, color, icon);

    setFlash(c, 'success', 'Habit created successfully.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.patch('/:id', async (c) => {
    const userId = c.get('user').id;
    const habitId = c.req.param('id');
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    
    const habit = getHabitByIdAndUserStmt.get(habitId, userId) as any;
    if (!habit) return c.notFound();

    let name = habit.name;
    let cadence = habit.cadence;
    let target = habit.target_per_period;
    let color = habit.color;
    let icon = habit.icon;
    let is_active = habit.is_active;

    if (body.name) name = encrypt(body.name as string);
    if (body.cadence) cadence = body.cadence;
    if (body.target_per_period) target = parseInt(body.target_per_period as string);
    if (body.color) color = body.color;
    if (body.icon !== undefined) icon = body.icon;
    if (body.is_active !== undefined) is_active = body.is_active ? 1 : 0;

    updateHabitStmt.run(name, cadence, target, color, icon, is_active, habitId);

    setFlash(c, 'success', 'Habit updated.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.post('/:id/toggle', async (c) => {
    const userId = c.get('user').id;
    const habitId = c.req.param('id');
    const body = await c.req.json().catch(()=>({}));
    
    // verify ownership
    const habit = getHabitByIdAndUserStmt.get(habitId, userId);
    if (!habit) return c.notFound();

    const date = body.date || new Date().toISOString().split('T')[0];
    const existing = getHabitEntryStmt.get(habitId, date) as any;
    
    if (existing) {
        deleteHabitEntryStmt.run(existing.id);
    } else {
        insertHabitEntryStmt.run(habitId, date);
    }

    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.delete('/:id', async (c) => {
    const userId = c.get('user').id;
    const habitId = c.req.param('id');
    
    softDeleteHabitStmt.run(new Date().toISOString(), habitId, userId);

    setFlash(c, 'success', 'Habit deleted.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.post('/:id/restore', async (c) => {
    const userId = c.get('user').id;
    const habitId = c.req.param('id');
    
    restoreHabitStmt.run(habitId, userId);
    setFlash(c, 'success', 'Habit restored.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.delete('/:id/force', async (c) => {
    const userId = c.get('user').id;
    const habitId = c.req.param('id');
    forceDeleteHabitStmt.run(habitId, userId);
    setFlash(c, 'success', 'Habit permanently deleted.');
    return c.redirect(c.req.header('referer') || '/dashboard', 303);
});

habits.put('/reorder', async (c) => {
    const userId = c.get('user').id;
    let body: any;
    if (c.req.header('content-type')?.includes('application/json')) {
        body = await c.req.json();
    } else {
        body = await c.req.parseBody();
    }
    if (body.orderedIds && Array.isArray(body.orderedIds)) {
        reorderHabitsTx(body.orderedIds, userId);
    }
    return c.redirect(c.req.header('referer') || '/habits', 303);
});

export default habits;
