const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

// Создаем директорию для базы данных, если она не существует
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Applying custom_dishes migration...');

// Создаем подключение к базе данных
const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');

    // Включаем поддержку внешних ключей
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            console.error('Error enabling foreign keys:', err);
            process.exit(1);
        }

        // Читаем SQL-файл миграции
        const migrationPath = path.join(__dirname, '..', 'migrations', '002_create_custom_dishes.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        // Выполняем миграцию
        db.exec(migration, (err) => {
            if (err) {
                console.error('Migration failed:', err);
                process.exit(1);
            }
            console.log('Migration completed successfully!');
            console.log('Table custom_dishes created.');

            // Закрываем соединение с базой данных
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    process.exit(1);
                }
                process.exit(0);
            });
        });
    });
});
