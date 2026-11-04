import { Database } from "bun:sqlite";
import { runMigrations } from "./migrations";

export const db = new Database("doable.db", { create: true });
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");
db.exec("PRAGMA cache_size = -64000"); // 64MB memory cache
db.exec("PRAGMA temp_store = MEMORY");
db.exec("PRAGMA mmap_size = 268435456"); // 256MB memory-mapped I/O
db.exec("PRAGMA busy_timeout = 5000"); // Avoid locks during concurrent worker writes
db.exec("PRAGMA foreign_keys = ON");

runMigrations(db);

