const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../src/config/config');
const logger = require('../src/shared/utils/logger');

// Создаем подключение к базе данных
const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        logger.error('Error connecting to database:', err);
        process.exit(1);
    }
    logger.info('Connected to database');

    // Включаем поддержку внешних ключей
    db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) {
            logger.error('Error disabling foreign keys:', err);
            process.exit(1);
        }

        // Читаем SQL-файл миграции
        const migrationPath = path.join(__dirname, '..', 'migrations', '003_shared_favorites.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        // Выполняем миграцию
        db.exec(migration, (err) => {
            if (err) {
                logger.error('Migration failed:', err);
                process.exit(1);
            }
            logger.info('Shared favorites migration completed successfully');

            // Включаем обратно поддержку внешних ключей
            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) {
                    logger.error('Error enabling foreign keys:', err);
                }

                // Закрываем соединение с базой данных
                db.close((err) => {
                    if (err) {
                        logger.error('Error closing database:', err);
                        process.exit(1);
                    }
                    logger.info('Database connection closed');
                });
            });
        });
    });
});
