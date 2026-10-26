const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');

const migrationFiles = ['001_create_tables_sqlite.sql', '002_create_custom_dishes.sql', '003_shared_favorites.sql'];

async function runMigrations(dbPath) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = await new Promise((resolve, reject) => {
        const connection = new sqlite3.Database(dbPath, err => err ? reject(err) : resolve(connection));
    });
    const exec = sql => new Promise((resolve, reject) => db.exec(sql, err => err ? reject(err) : resolve()));
    const all = sql => new Promise((resolve, reject) => db.all(sql, (err, rows) => err ? reject(err) : resolve(rows)));
    const run = (sql, params) => new Promise((resolve, reject) => db.run(sql, params, err => err ? reject(err) : resolve()));
    const applied = [];
    let inTransaction = false;
    try {
        await exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; BEGIN IMMEDIATE;');
        inTransaction = true;
        await exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        const history = new Map((await all('SELECT name, checksum FROM schema_migrations')).map(row => [row.name, row.checksum]));
        for (const name of migrationFiles) {
            const sql = fs.readFileSync(path.resolve(__dirname, '../../..', 'migrations', name), 'utf8');
            const checksum = crypto.createHash('sha256').update(sql).digest('hex');
            if (history.has(name)) {
                if (history.get(name) !== checksum) throw new Error(`Applied migration was modified: ${name}`);
                continue;
            }
            await exec(sql);
            await run('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [name, checksum]);
            applied.push(name);
        }
        const violations = await all('PRAGMA foreign_key_check');
        if (violations.length) throw new Error('Migration would leave invalid foreign keys; changes rolled back');
        await exec('COMMIT');
        inTransaction = false;
        return applied;
    } catch (error) {
        if (inTransaction) await exec('ROLLBACK');
        throw error;
    } finally {
        await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
    }
}

module.exports = { runMigrations };
