const path = require('path');
const { runMigrations } = require('../src/shared/database/migrations');
const { removeTestDirectory } = require('./temp-files');

beforeAll(async () => { await runMigrations(process.env.DB_PATH); });
afterAll(async () => {
    const databases = [...new Set([
        require('../src/shared/database/db'), require('../src/shared/database/db-universal')
    ])];
    await Promise.all(databases.map(db => db.close()));
    removeTestDirectory(path.dirname(process.env.DB_PATH), 'prokitchen-test-');
});
