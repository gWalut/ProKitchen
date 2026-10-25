const fs = require('fs');
const os = require('os');
const path = require('path');

function removeTestDirectory(directory, prefix) {
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith(prefix)) {
        throw new Error('Refusing to remove a directory outside the named test temporary directory');
    }
    fs.rmSync(resolved, { recursive: true, force: true });
}
module.exports = { removeTestDirectory };
