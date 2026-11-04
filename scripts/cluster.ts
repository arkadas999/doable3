import { cpus } from 'os';

const numWorkers = Math.max(1, Number(process.env.BUN_WORKERS || process.env.WEB_CONCURRENCY || cpus().length || 2));

console.log(`🚀 Starting Doable cluster with ${numWorkers} worker processes on port ${process.env.PORT || 8000}...`);

const workers: any[] = [];

for (let i = 0; i < numWorkers; i++) {
    const worker = Bun.spawn(['bun', 'src/index.ts'], {
        stdio: ['inherit', 'inherit', 'inherit'],
        env: {
            ...process.env,
            NODE_ENV: process.env.NODE_ENV || 'production',
            WORKER_ID: String(i + 1),
        },
    });
    workers.push(worker);
}

process.on('SIGINT', () => {
    workers.forEach(w => w.kill());
    process.exit(0);
});

process.on('SIGTERM', () => {
    workers.forEach(w => w.kill());
    process.exit(0);
});
