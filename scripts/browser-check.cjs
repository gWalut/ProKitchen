const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
// Each device gets a fresh server/DB and its own normal rate-limit window.
// Do not disable the application's rate limiters for browser tests.
for (const project of ['desktop', 'mobile']) {
    const result = spawnSync(process.execPath, [
        path.join(root, 'Front/node_modules/playwright/cli.js'), 'test',
        '--config', 'playwright.smoke.config.ts', '--project', project, ...process.argv.slice(2)
    ], { cwd: path.join(root, 'Front'), stdio: 'inherit', env: process.env });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
}
