import type { Database } from "bun:sqlite";

let migrated = false;

export function runMigrations(db: Database) {
    if (migrated) return;
    migrated = true;
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            email_verified_at DATETIME,
            password TEXT NOT NULL,
            remember_token TEXT,
            timezone TEXT DEFAULT 'UTC',
            accent TEXT DEFAULT 'blue',
            theme TEXT DEFAULT 'system',
            two_factor_secret TEXT,
            two_factor_recovery_codes TEXT,
            two_factor_confirmed_at DATETIME,
            stripe_id TEXT,
            pm_type TEXT,
            pm_last_four TEXT,
            trial_ends_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            notes TEXT,
            bucket TEXT DEFAULT 'important',
            status TEXT DEFAULT 'open',
            priority INTEGER DEFAULT 0,
            due_date DATE,
            position INTEGER DEFAULT 0,
            completed_at DATETIME,
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS tasks_user_bucket_status_idx ON tasks(user_id, bucket, status);`);
    db.run(`CREATE INDEX IF NOT EXISTS tasks_user_deleted_pos_idx ON tasks(user_id, deleted_at, position ASC, created_at DESC);`);

    db.run(`
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            cadence TEXT DEFAULT 'daily',
            target_per_period INTEGER DEFAULT 1,
            color TEXT DEFAULT '#f97316',
            icon TEXT,
            is_active BOOLEAN DEFAULT 1,
            position INTEGER DEFAULT 0,
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS habits_user_active_idx ON habits(user_id, is_active);`);
    db.run(`CREATE INDEX IF NOT EXISTS habits_user_deleted_active_pos_idx ON habits(user_id, deleted_at, is_active, position ASC);`);

    db.run(`
        CREATE TABLE IF NOT EXISTS habit_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            entry_date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );
    `);
    
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS habit_entries_habit_date_unique ON habit_entries(habit_id, entry_date);`);
    db.run(`CREATE INDEX IF NOT EXISTS habit_entries_habit_idx ON habit_entries(habit_id);`);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            data TEXT NOT NULL,
            expiry DATETIME NOT NULL
        );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expiry);`);

    db.run(`
        CREATE TABLE IF NOT EXISTS passkeys (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            credential_id TEXT NOT NULL UNIQUE,
            public_key TEXT NOT NULL,
            counter INTEGER NOT NULL,
            transports TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS passkeys_user_id_idx ON passkeys(user_id);`);


    console.log("Migrations applied successfully.");


  // Create demo user if it doesn't exist
  let demoUser = db.query('SELECT * FROM users WHERE email = ?').get('demo@doable.app') as any;
  if (!demoUser) {
    const passwordHash = Bun.password.hashSync('password');
    db.query(`INSERT INTO users (name, email, password, timezone, accent, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
      .run('Demo User', 'demo@doable.app', passwordHash, 'UTC', 'blue');
    demoUser = db.query('SELECT * FROM users WHERE email = ?').get('demo@doable.app') as any;
  }

  const { encrypt, decrypt } = require('./crypto');
  const sampleTask = db.query("SELECT title FROM tasks WHERE user_id = ? LIMIT 1").get(demoUser.id) as any;
  const isKeyCorrupted = sampleTask && sampleTask.title.includes(':') && decrypt(sampleTask.title) === sampleTask.title;

  if (isKeyCorrupted || db.query("SELECT count(*) as count FROM tasks WHERE user_id = ?").get(demoUser.id).count === 0) {
        db.query("DELETE FROM tasks WHERE user_id = ?").run(demoUser.id);
        db.query("DELETE FROM habits WHERE user_id = ?").run(demoUser.id);
        
        const userId = demoUser.id;
        
        // Seed Tasks
        db.query("INSERT INTO tasks (user_id, title, notes, bucket, status, priority, position) VALUES (?, ?, ?, ?, ?, ?, ?)").run(userId, encrypt('Read 10 pages of a book'), null, 'important', 'open', 2, 0);
        db.query("INSERT INTO tasks (user_id, title, notes, bucket, status, priority, position) VALUES (?, ?, ?, ?, ?, ?, ?)").run(userId, encrypt('Book dentist appointment'), null, 'important', 'open', 3, 1);
        db.query("INSERT INTO tasks (user_id, title, notes, bucket, status, priority, position) VALUES (?, ?, ?, ?, ?, ?, ?)").run(userId, encrypt('Organize desk'), null, 'eventual', 'open', 0, 2);
        
        // Seed Habits
        db.query("INSERT INTO habits (user_id, name, color, cadence, position) VALUES (?, ?, ?, ?, ?)").run(userId, encrypt('Morning Workout'), '#10b981', 'daily', 0);
        const h1 = db.query("SELECT last_insert_rowid() as id").get().id;
        db.query("INSERT INTO habits (user_id, name, color, cadence, position) VALUES (?, ?, ?, ?, ?)").run(userId, encrypt('Meditate'), '#6366f1', 'daily', 1);
        const h2 = db.query("SELECT last_insert_rowid() as id").get().id;
        db.query("INSERT INTO habits (user_id, name, color, cadence, position) VALUES (?, ?, ?, ?, ?)").run(userId, encrypt('Drink 2L Water'), '#0ea5e9', 'daily', 2);
        const h3 = db.query("SELECT last_insert_rowid() as id").get().id;
        
        const today = new Date();
        for (let i = 0; i < 150; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            if (Math.random() < 0.8) {
                db.query("INSERT INTO habit_entries (habit_id, entry_date) VALUES (?, ?)").run(h1, dateStr);
            }
            if (Math.random() < 0.5) {
                db.query("INSERT INTO habit_entries (habit_id, entry_date) VALUES (?, ?)").run(h2, dateStr);
            }
            if (Math.random() < 0.3) {
                db.query("INSERT INTO habit_entries (habit_id, entry_date) VALUES (?, ?)").run(h3, dateStr);
            }
        }
    }

    // Add avatar column to users table if missing
    try {
        db.run("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL");
    } catch (e) {
        // Column might already exist
    }

    // Add last_used_at column to passkeys table if missing
    try {
        db.run("ALTER TABLE passkeys ADD COLUMN last_used_at DATETIME DEFAULT NULL");
    } catch (e) {
        // Column might already exist
    }
}
