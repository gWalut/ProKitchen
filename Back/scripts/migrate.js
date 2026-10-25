const config = require('../src/config/config');
const { runMigrations } = require('../src/shared/database/migrations');

if (config.DB_TYPE !== 'sqlite') {
    console.error('This migration command supports SQLite only. See README for the PostgreSQL limitations.');
    process.exitCode = 1;
} else {
    runMigrations(config.DB_PATH)
        .then(applied => console.log(applied.length ? 'Applied: ' + applied.join(', ') : 'Database schema is up to date.'))
        .catch(error => { console.error('Migration failed: ' + error.message); process.exitCode = 1; });
}
