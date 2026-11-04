# ⚡ Performance & Multi-Worker Scaling

Doable is built on Bun and Hono, using the native `bun:sqlite` engine with WAL mode and in-memory caches.

---

## 🚀 Multi-Worker Clustering (`start:cluster`)

Bun supports kernel-level multi-core load balancing using Linux `SO_REUSEPORT`.

### Launching Cluster Mode
```bash
# Automatically scales to all available CPU cores
bun run start:cluster

# Or specify a custom number of worker processes
BUN_WORKERS=4 bun run start:cluster
```

Each worker process runs an independent event loop bound to the same port, providing linear throughput scaling across multiple CPU cores.

---

## 🏎️ Built-In Speed Optimizations

1. **In-Memory Template & Manifest Caching**: Production HTML and Vite asset manifests are cached in memory on startup, eliminating filesystem reads on every request.
2. **Immutable Static Asset Headers**: All compiled `/build/*` assets are served with `Cache-Control: public, max-age=31536000, immutable`, allowing browsers to serve assets directly from local cache.
3. **SQLite Engine Optimizations**:
   - `PRAGMA journal_mode = WAL` (Write-Ahead Logging for concurrent readers/writers)
   - `PRAGMA synchronous = NORMAL`
   - `PRAGMA cache_size = -64000` (64MB memory page cache)
   - `PRAGMA mmap_size = 268435456` (256MB memory-mapped I/O)
   - `PRAGMA busy_timeout = 5000` (zero lock failures under concurrent writes)
4. **Low Memory Footprint**: ~30-50MB RAM at idle per worker process.
