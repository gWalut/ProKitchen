const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const logger = require('../src/utils/logger');

function seedAllergens() {
    // Проверяем существование директории базы данных
    const dbDir = path.dirname(config.DB_PATH);
    if (!fs.existsSync(dbDir)) {
        logger.error('Database directory does not exist. Please run migrations first.');
        process.exit(1);
    }

    // Проверяем существование базы данных
    if (!fs.existsSync(config.DB_PATH)) {
        logger.error('Database file does not exist. Please run migrations first.');
        process.exit(1);
    }

    // Инициализация базы данных
    const db = new Database(config.DB_PATH, { verbose: logger.debug });

    try {
        // Проверяем существование таблицы allergens
        const tableExists = db.prepare(`
            SELECT name 
            FROM sqlite_master 
            WHERE type='table' AND name='allergens'
        `).get();

        if (!tableExists) {
            logger.error('Table allergens does not exist. Please run migrations first.');
            process.exit(1);
        }

        // Получаем путь к файлу с сидами
        const seedPath = path.join(__dirname, '../seeds/seed_allergens.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // Выполняем сид в транзакции
        db.transaction(() => {
            logger.info('Starting allergens seed...');

            // Выполняем SQL из файла
            db.exec(seedSql);

            // Проверяем количество добавленных записей
            const count = db.prepare('SELECT COUNT(*) as count FROM allergens').get();
            logger.info(`Successfully seeded ${count.count} allergens`);
        })();

        logger.info('Allergens seeding completed successfully');
    } catch (error) {
        logger.error('Error during seeding allergens:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Запуск сида
seedAllergens();