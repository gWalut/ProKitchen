// Isolated services for browser tests: never use the developer's working DB.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { runMigrations } = require('../Back/src/shared/database/migrations');
const root = path.resolve(__dirname, '..');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'prokitchen-browser-'));
const children = [];
let stopping = false;

async function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    await Promise.all(children.map(async child => {
        if (child.exitCode !== null || child.signalCode !== null) return;
        const exited = once(child, 'exit');
        child.kill('SIGTERM');
        const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
        await exited;
        clearTimeout(timer);
    }));
    fs.rmSync(directory, { recursive: true, force: true });
    process.exitCode = code;
}
function start(folder, args, env) {
    const child = spawn(process.execPath, args, { cwd: path.join(root, folder),
        stdio: 'inherit', env: { ...process.env, ...env } });
    children.push(child);
    child.once('error', error => { console.error(error.message); void stop(1); });
    child.once('exit', code => { if (!stopping) void stop(code || 1); });
}
process.once('SIGTERM', () => void stop());
process.once('SIGINT', () => void stop());
(async () => {
    const dbPath = path.join(directory, 'smoke.sqlite');
    await runMigrations(dbPath);
    await require('./smoke-fixtures.cjs')(dbPath);
    start('Back', ['src/server.js'], {
        NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '3001', DB_TYPE: 'sqlite', DB_PATH: dbPath,
        JWT_SECRET: crypto.randomBytes(32).toString('hex'),
        REFRESH_TOKEN_SECRET: crypto.randomBytes(32).toString('hex'),
        CORS_ORIGINS: 'http://127.0.0.1:5175'
    });
    start('Front', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], {
        VITE_API_TARGET: 'http://127.0.0.1:3001'
    });
})().catch(error => { console.error(error.message); void stop(1); });
