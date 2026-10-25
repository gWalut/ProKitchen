const sqlite3 = require('sqlite3').verbose();
const config = require('../src/config/config');
const logger = require('../src/shared/utils/logger');

// Создаем подключение к базе данных
const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        logger.error('Error connecting to database:', err);
        process.exit(1);
    }
    logger.info('Connected to database');

    // Мигрируем существующие избранные блюда к общему user_id = 0
    // Это объединит все избранные блюда всех пользователей в общий список
    db.run(`
        UPDATE favorites 
        SET user_id = 0 
        WHERE user_id != 0
    `, (err) => {
        if (err) {
            logger.error('Migration of existing favorites failed:', err);
            process.exit(1);
        }

        // Проверяем, сколько записей было обновлено
        db.get('SELECT COUNT(*) as count FROM favorites WHERE user_id = 0', (err, row) => {
            if (err) {
                logger.error('Error counting favorites:', err);
            } else {
                logger.info(`Migrated existing favorites. Total shared favorites: ${row.count}`);
            }

            // Закрываем соединение
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
