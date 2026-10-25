const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/kitchen.sqlite');
const migrationPath = path.join(__dirname, '../migrations/001_create_tables_sqlite.sql');

console.log('Пересоздание базы данных...');

// Открываем существующую базу или создаем новую
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('✗ Ошибка открытия базы данных:', err);
        process.exit(1);
    }
    console.log('✓ База данных открыта');
});

// Читаем SQL файл
const sql = fs.readFileSync(migrationPath, 'utf8');

// Выполняем миграцию
db.exec(sql, (err) => {
    if (err) {
        console.error('✗ Ошибка выполнения миграции:', err);
        process.exit(1);
    }
    console.log('✓ Миграция выполнена успешно');

    db.close((err) => {
        if (err) {
            console.error('✗ Ошибка закрытия базы данных:', err);
            process.exit(1);
        }
        console.log('✓ База данных готова к работе');
        console.log('Теперь перезапустите Backend сервер');
    });
});
