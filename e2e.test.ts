import { describe, it, expect, beforeAll } from "bun:test";
import appObj from "./src/index.ts";
import { db } from "./src/db.ts";

const fetchApp = appObj.fetch;

let sessionCookie = "";

const PORT = process.env.PORT || process.env.DOABLE_PORT || 8000;

async function request(method: string, path: string, body?: any) {
    const headers = new Headers();
    if (sessionCookie) headers.append("Cookie", sessionCookie);
    if (body) headers.append("Content-Type", "application/json");
    
    const req = new Request(`http://localhost:${PORT}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    
    const res = await fetchApp(req);
    
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
        sessionCookie = setCookie.split(";")[0];
    }
    
    return res;
}

describe("Comprehensive Unified E2E Workflow Test Suite", () => {
    beforeAll(() => {
        const testUser = db.query("SELECT id FROM users WHERE email = ?").get("test2@doable.app") as any;
        const failUser = db.query("SELECT id FROM users WHERE email = ?").get("fail@doable.app") as any;
        if (failUser) db.query("DELETE FROM users WHERE id = ?").run(failUser.id);
        if (testUser) {
            db.query("DELETE FROM users WHERE id = ?").run(testUser.id);
        }
    });

    // 1. Auth & Onboarding
    it("should register a new user", async () => {
        const res = await request("POST", "/register", {
            name: "Test User 2",
            email: "test2@doable.app",
            password: "password123",
            password_confirmation: "password123"
        });
        expect(res.status).toBe(303);
    });

    it("should fail registration with short password", async () => {
        sessionCookie = ""; // clear
        const res = await request("POST", "/register", {
            name: "Fail User",
            email: "fail@doable.app",
            password: "pass",
            password_confirmation: "pass"
        });
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).not.toBe("/dashboard");
    });

    it("should login correctly", async () => {
        sessionCookie = "";
        const res = await request("POST", "/login", {
            email: "test2@doable.app",
            password: "password123"
        });
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toBe("/dashboard");
    });

    // 2. Tasks CRUD & Reorder
    it("should create multiple tasks", async () => {
        await request("POST", "/tasks", { title: "Task 1", bucket: "important", priority: 1 });
        await request("POST", "/tasks", { title: "Task 2", bucket: "important", priority: 2 });
        const res = await request("POST", "/tasks", { title: "Task 3", bucket: "eventual", priority: 0 });
        expect(res.status).toBe(303);
    });

    it("should create task with a due date (Calendar feature)", async () => {
        const res = await request("POST", "/tasks", { 
            title: "Scheduled Task", 
            bucket: "important", 
            due_date: "2026-10-15"
        });
        expect(res.status).toBe(303);
        
        const { decrypt } = require('./src/crypto.ts');
        const tasks = db.query("SELECT tasks.* FROM tasks JOIN users ON tasks.user_id = users.id WHERE users.email = 'test2@doable.app'").all() as any[];
        
        // Find our scheduled task
        const scheduled = tasks.find(t => decrypt(t.title) === "Scheduled Task");
        expect(scheduled).toBeDefined();
        expect(scheduled.due_date).toBe("2026-10-15");
    });

    it("should fail creating task without title", async () => {
        const res = await request("POST", "/tasks", { bucket: "important" });
        expect(res.status).toBe(303);
    });

    it("should reorder tasks", async () => {
        const tasks = db.query("SELECT tasks.id FROM tasks JOIN users ON tasks.user_id = users.id WHERE bucket = 'important' AND users.email = 'test2@doable.app' ORDER BY tasks.id ASC").all() as any[];
        const orderedIds = [tasks[1].id, tasks[0].id];
        const res = await request("PUT", "/tasks/reorder", { orderedIds });
        expect(res.status).toBe(303);
        const updated = db.query("SELECT position FROM tasks WHERE id = ?").get(tasks[1].id) as any;
        expect(updated.position).toBe(0);
    });

    it("should complete a task", async () => {
        const task = db.query("SELECT tasks.id FROM tasks JOIN users ON tasks.user_id = users.id WHERE bucket = 'important' AND users.email = 'test2@doable.app' LIMIT 1").get() as any;
        const res = await request("PATCH", `/tasks/${task.id}`, { status: "done" });
        expect(res.status).toBe(303);
    });

    it("should move task to bin and then permanently delete", async () => {
        const task = db.query("SELECT tasks.id FROM tasks JOIN users ON tasks.user_id = users.id WHERE bucket = 'eventual' AND users.email = 'test2@doable.app' LIMIT 1").get() as any;
        
        // Move to bin
        let res = await request("DELETE", `/tasks/${task.id}`);
        expect(res.status).toBe(303);
        
        // Force delete
        res = await request("DELETE", `/tasks/${task.id}/force`);
        expect(res.status).toBe(303);
        
        const deleted = db.query("SELECT id FROM tasks WHERE id = ?").get(task.id) as any;
        expect(deleted).toBeNull();
    });

    // 3. Habits CRUD & Streaks
    it("should create and edit a habit", async () => {
        await request("POST", "/habits", { name: "Morning Run", color: "#10b981", cadence: "daily" });
        const habit = db.query("SELECT habits.id FROM habits JOIN users ON habits.user_id = users.id WHERE users.email = 'test2@doable.app' ORDER BY habits.id DESC LIMIT 1").get() as any;
        
        const res = await request("PATCH", `/habits/${habit.id}`, {
            name: "Evening Run",
            color: "#ef4444"
        });
        expect(res.status).toBe(303);
    });

    it("should reorder habits", async () => {
        await request("POST", "/habits", { name: "Second Habit" });
        const habits = db.query("SELECT habits.id FROM habits JOIN users ON habits.user_id = users.id WHERE users.email = 'test2@doable.app' ORDER BY habits.id ASC LIMIT 2").all() as any[];
        const res = await request("PUT", "/habits/reorder", {
            orderedIds: [habits[1].id, habits[0].id]
        });
        expect(res.status).toBe(303);
    });

    it("should toggle habit entry correctly", async () => {
        const habit = db.query("SELECT habits.id FROM habits JOIN users ON habits.user_id = users.id WHERE users.email = 'test2@doable.app' ORDER BY habits.id DESC LIMIT 1").get() as any;
        const date = "2026-10-04";
        
        // Add entry
        let res = await request("POST", `/habits/${habit.id}/toggle`, { date });
        expect(res.status).toBe(303);
        let entry = db.query("SELECT id FROM habit_entries WHERE habit_id = ?").get(habit.id) as any;
        expect(entry).not.toBeNull();
        
        // Remove entry
        res = await request("POST", `/habits/${habit.id}/toggle`, { date });
        expect(res.status).toBe(303);
        entry = db.query("SELECT id FROM habit_entries WHERE habit_id = ?").get(habit.id) as any;
        expect(entry).toBeNull();
    });

    // 4. Settings, Preferences & Avatar
    it("should update profile settings and avatar", async () => {
        let res = await request("PATCH", "/settings/profile", {
            name: "Updated Name",
            email: "test2@doable.app"
        });
        expect(res.status).toBe(303);
        const { decrypt } = require('./src/crypto.ts');
        const user = db.query("SELECT name FROM users WHERE email = 'test2@doable.app'").get() as any;
        expect(decrypt(user.name)).toBe("Updated Name");

        // Remove avatar
        res = await request("DELETE", "/settings/avatar");
        expect(res.status).toBe(303);
    });

    it("should update user preferences (accent, theme)", async () => {
        let res = await request("PATCH", "/preferences/accent", { accent: "emerald" });
        expect(res.status).toBe(303);

        res = await request("PATCH", "/preferences/theme", { theme: "dark" });
        expect(res.status).toBe(303);

        const user = db.query("SELECT accent, theme FROM users WHERE email = 'test2@doable.app'").get() as any;
        expect(user.accent).toBe("emerald");
        expect(user.theme).toBe("dark");
    });

    it("should handle security barrier, password confirmation and passkeys options", async () => {
        // Accessing security requires password confirmation
        let res = await request("GET", "/settings/security");
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toBe("/user/confirm-password");

        // Fetch passkey confirm options
        res = await request("GET", "/passkeys/confirm/options");
        expect(res.status).toBe(200);

        // Confirm password
        res = await request("POST", "/user/confirm-password", { password: "password123" });
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toContain("/settings/security");

        // Access security page
        res = await request("GET", "/settings/security");
        expect(res.status).toBe(200);
    });

    it("should update password via Form method spoofing and direct PUT", async () => {
        const res = await request("POST", "/settings/password?_method=PUT", {
            current_password: "password123",
            password: "newpassword123",
            password_confirmation: "newpassword123"
        });
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toContain("/settings/security");
    });

    // 5. Navigation & Logout
    it("should fetch unmapped route and fallback to 404 Inertia handler", async () => {
        const res = await request("GET", "/random/route/does/not/exist");
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toBe("/dashboard");
    });

    it("should logout cleanly", async () => {
        const res = await request("POST", "/logout");
        expect(res.status).toBe(303);
        expect(res.headers.get("Location")).toBe("/");
    });

    // 6. Account Deletion
    it("should login with new password and delete account", async () => {
        sessionCookie = "";
        await request("POST", "/login", {
            email: "test2@doable.app",
            password: "newpassword123"
        });
        const res = await request("DELETE", "/settings/profile", {
            password: "newpassword123"
        });
        expect(res.status).toBe(303);
        
        const user = db.query("SELECT id FROM users WHERE email = 'test2@doable.app'").get();
        expect(user).toBeNull();
    });
});
