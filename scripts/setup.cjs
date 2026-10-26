const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

const [major, minor] = process.versions.node.split('.').map(Number);
if (major !== 22 || minor < 20) throw new Error('Use Node.js 22.20.0 (see .nvmrc).');
if (!process.env.npm_execpath) throw new Error('Run this command using npm run setup.');

function npm(args, cwd) {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
        cwd, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' }, windowsHide: true
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
}

for (const folder of ['Back', 'Front']) npm(['ci', '--no-audit', '--no-fund'], path.join(root, folder));
const envFile = path.join(root, 'Back', '.env');
if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, `NODE_ENV=development\nHOST=127.0.0.1\nPORT=3000\nDB_TYPE=sqlite\nJWT_SECRET=${crypto.randomBytes(32).toString('hex')}\nREFRESH_TOKEN_SECRET=${crypto.randomBytes(32).toString('hex')}\n`, { flag: 'wx' });
}
npm(['run', 'migrate'], path.join(root, 'Back'));
console.log('Ready. Run npm run dev, then open http://127.0.0.1:5173');
