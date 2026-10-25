const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { fork } = require('node:child_process');
const { once } = require('node:events');
const { runMigrations } = require('../Back/src/shared/database/migrations');

async function main() {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'prokitchen-smoke-'));
    const dbPath = path.join(directory, 'smoke.sqlite');
    let child;
    try {
        await runMigrations(dbPath);
        assert.deepEqual(await runMigrations(dbPath), []);
        child = fork(path.resolve(__dirname, '../Back/src/server.js'), [], {
            cwd: path.resolve(__dirname, '../Back'), silent: true,
            env: { ...process.env, NODE_ENV: 'test', DB_TYPE: 'sqlite', DB_PATH: dbPath, PORT: '0', HOST: '127.0.0.1',
                JWT_SECRET: crypto.randomBytes(32).toString('hex'), REFRESH_TOKEN_SECRET: crypto.randomBytes(32).toString('hex') }
        });
        let output = '';
        child.stdout.on('data', chunk => { output += chunk; });
        child.stderr.on('data', chunk => { output += chunk; });
        const address = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Server startup timed out: ' + output)), 10000);
            child.once('message', message => { clearTimeout(timer); resolve(message); });
            child.once('exit', code => { clearTimeout(timer); reject(new Error('Server exited: ' + code + '\n' + output)); });
            child.once('error', error => { clearTimeout(timer); reject(error); });
        });
        const base = `http://127.0.0.1:${address.port}/api/v1`;
        async function request(endpoint, expected, options = {}) {
            const response = await fetch(base + endpoint, { ...options, signal: AbortSignal.timeout(10000) });
            assert.equal(response.status, expected, `${endpoint}: ${await response.clone().text()}`);
            return response;
        }
        const health = await (await request('/health', 200)).json();
        assert.equal(health.database, 'ok');
        await request('/custom-dishes', 401);
        const email = `smoke-${Date.now()}@example.com`;
        const password = crypto.randomBytes(16).toString('hex');
        const post = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        await request('/auth/register', 201, post({ email, password, passwordConfirm: password, acceptPrivacyPolicy: true }));
        const login = await (await request('/auth/login', 200, post({ email, password }))).json();
        const headers = { Authorization: 'Bearer ' + login.data.accessToken, 'Content-Type': 'application/json' };
        await request('/ingredients', 200, { headers });
        await request('/admin/users', 403, { headers });
        const created = await (await request('/custom-dishes', 201, { method: 'POST', headers, body: JSON.stringify({
            name: 'Smoke dish', portions: 2,
            ingredients: [{ name: 'Potato', weight: 200, unit: 'г', pricePerUnit: 0.05 }],
            cost_per_portion: 5, total_cost: 10
        }) })).json();
        const dish = await (await request('/custom-dishes/' + created.data.id, 200, { headers })).json();
        assert.equal(Number(dish.data.total_cost), 10);
        assert.equal(Number(dish.data.cost_per_portion), 5);
        const pdf = await request(`/custom-dishes/${created.data.id}/label?weight=200&manufactureDate=2026-10-25&shelfLife=24`, 200, { headers });
        assert.match(pdf.headers.get('content-type'), /application\/pdf/);
        assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
        console.log('PASS: fresh database, repeat migration, health, registration, login, access rules, saved dish and PDF.');
    } finally {
        if (child && child.exitCode === null) {
            const exited = once(child, 'exit');
            const timer = setTimeout(() => child.kill(), 5000);
            if (child.connected) child.send('shutdown');
            else child.kill();
            await exited;
            clearTimeout(timer);
        }
        const resolved = path.resolve(directory);
        if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('prokitchen-smoke-')) {
            throw new Error('Refusing to remove a directory outside the smoke test temporary directory');
        }
        fs.rmSync(resolved, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
