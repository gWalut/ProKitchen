const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const children = [];
let stopping = false;
function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const child of children) if (child.exitCode === null) child.kill();
}
function start(folder, args) {
    const child = spawn(process.execPath, args, { cwd: path.join(root, folder), stdio: 'inherit', windowsHide: true });
    children.push(child);
    child.once('error', error => { console.error(error.message); stop(1); });
    child.once('exit', code => { if (!stopping) stop(code || 0); });
}
start('Back', ['src/server.js']);
start('Front', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--strictPort']);
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
