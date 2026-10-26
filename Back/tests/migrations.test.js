const fs = require('fs');
const os = require('os');
const path = require('path');
const sqlite3 = require('sqlite3');
const { runMigrations } = require('../src/shared/database/migrations');
const { removeTestDirectory } = require('./temp-files');

let directory;
let db;
const exec = sql => new Promise((resolve, reject) => db.exec(sql, err => err ? reject(err) : resolve()));
const all = sql => new Promise((resolve, reject) => db.all(sql, (err, rows) => err ? reject(err) : resolve(rows)));
const open = file => new Promise((resolve, reject) => {
    db = new sqlite3.Database(file, err => err ? reject(err) : resolve());
});
const close = () => new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));

beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'prokitchen-migration-')); });
afterEach(() => { removeTestDirectory(directory, 'prokitchen-migration-'); });

test('a fresh database contains custom dishes and accepts shared favorites', async () => {
    const file = path.join(directory, 'fresh.sqlite');
    expect(await runMigrations(file)).toHaveLength(3);
    await open(file);
    try {
        expect(await all("SELECT name FROM sqlite_master WHERE name='custom_dishes'")).toHaveLength(1);
        const keys = await all('PRAGMA foreign_key_list(favorites)');
        expect(keys.map(key => key.table)).toEqual(['dishes']);
    } finally { await close(); }
});

test('adopting an existing schema and repeating migrations preserve user data', async () => {
    const file = path.join(directory, 'existing.sqlite');
    await open(file);
    try {
        await exec(fs.readFileSync(path.join(__dirname, '../migrations/001_create_tables_sqlite.sql'), 'utf8'));
        await exec(`INSERT INTO users (id, email, password_hash, full_name) VALUES (1, 'existing@example.com', 'hash', 'Existing');
            INSERT INTO dishes (id, name, instructions, cooking_time, difficulty_level, portion_size, created_by)
            VALUES (1, 'Existing dish', 'Keep', 10, 'easy', 1, 1);
            INSERT INTO favorites (user_id, dish_id) VALUES (1, 1);`);
    } finally { await close(); }
    expect(await runMigrations(file)).toHaveLength(3);
    expect(await runMigrations(file)).toEqual([]);
    await open(file);
    try {
        expect((await all('SELECT email FROM users'))[0].email).toBe('existing@example.com');
        expect((await all('SELECT name FROM dishes'))[0].name).toBe('Existing dish');
        expect(await all('SELECT user_id, dish_id FROM favorites')).toEqual([{ user_id: 1, dish_id: 1 }]);
    } finally { await close(); }
});

test('a migration history mismatch fails without changing migration history', async () => {
    const file = path.join(directory, 'history.sqlite');
    await runMigrations(file);
    await open(file);
    try { await exec("UPDATE schema_migrations SET checksum='unexpected' WHERE name='001_create_tables_sqlite.sql'"); }
    finally { await close(); }
    await expect(runMigrations(file)).rejects.toThrow('Applied migration was modified');
    await open(file);
    try { expect(await all('SELECT name FROM schema_migrations')).toHaveLength(3); }
    finally { await close(); }
});

test('an invalid legacy schema rolls back all pending migrations', async () => {
    const file = path.join(directory, 'invalid.sqlite');
    await open(file);
    try {
        await exec(fs.readFileSync(path.join(__dirname, '../migrations/001_create_tables_sqlite.sql'), 'utf8'));
        await exec(`INSERT INTO users (email, password_hash, full_name) VALUES ('keep@example.com', 'hash', 'Keep');
            ALTER TABLE favorites RENAME COLUMN created_at TO legacy_timestamp;`);
    } finally { await close(); }
    await expect(runMigrations(file)).rejects.toThrow();
    await open(file);
    try {
        expect((await all('SELECT email FROM users'))[0].email).toBe('keep@example.com');
        expect(await all("SELECT name FROM sqlite_master WHERE name IN ('schema_migrations', 'custom_dishes')")).toEqual([]);
    } finally { await close(); }
});
