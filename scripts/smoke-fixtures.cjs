// Known credentials below belong only to the disposable browser-test database.
const path = require('node:path');
const sqlite3 = require('../Back/node_modules/sqlite3');
const bcrypt = require('../Back/node_modules/bcryptjs');

module.exports = async function seedSmokeFixtures(dbPath) {
    if (!path.basename(path.dirname(dbPath)).startsWith('prokitchen-browser-')) {
        throw new Error('Smoke fixtures require a disposable browser-test database');
    }
    const db = new sqlite3.Database(dbPath);
    const run = (sql, values = []) => new Promise((resolve, reject) => {
        db.run(sql, values, function (error) { if (error) reject(error); else resolve(this.lastID); });
    });
    try {
        const hash = await bcrypt.hash('Smoke-fixture-9274!', 10);
        const admin = await run('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            ['smoke-admin@example.com', hash, 'Тестовый администратор', 'admin']);
        for (const project of ['desktop', 'mobile']) {
            await run('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
                [`smoke-member-${project}@example.com`, hash, 'Тестовый пользователь', 'user']);
        }
        const milk = await run('INSERT INTO allergens (name) VALUES (?)', ['Молоко']);
        await run('INSERT INTO allergens (name) VALUES (?)', ['Рыба']);
        const ingredient = await run('INSERT INTO ingredients (name, unit, price_per_unit) VALUES (?, ?, ?)', ['Молоко', 'мл', 0.09]);
        await run('INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES (?, ?)', [ingredient, milk]);
        const dish = await run(`INSERT INTO dishes (name, instructions, cooking_time, difficulty_level, portion_size, created_by)
            VALUES (?, ?, ?, ?, ?, ?)`, ['Омлет тестовый', 'Приготовить', 5, 'easy', 200, admin]);
        await run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)', [dish, ingredient, 100]);
    } finally {
        await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
    }
};
