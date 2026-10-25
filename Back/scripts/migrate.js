const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../src/config/config');
const logger = require('../src/shared/utils/logger');

// Создаем директорию для базы данных, если она не существует
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Создаем подключение к базе данных
const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        logger.error('Error connecting to database:', err);
        process.exit(1);
    }
    logger.info('Connected to database');

    // Включаем поддержку внешних ключей
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            logger.error('Error enabling foreign keys:', err);
            process.exit(1);
        }

        // Читаем SQL-файл миграции (SQLite версия)
        const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_tables_sqlite.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        // Выполняем миграцию
        db.exec(migration, (err) => {
            if (err) {
                logger.error('Migration failed:', err);
                process.exit(1);
            }
            logger.info('Migration completed successfully');

            // Закрываем соединение с базой данных
            db.close((err) => {
                if (err) {
                    logger.error('Error closing database:', err);
                    process.exit(1);
                }
            });
        });
    });
});