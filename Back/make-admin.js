/**
 * Скрипт для назначения роли admin пользователю
 * 
 * Использование:
 * node make-admin.js your-email@example.com
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Получаем email из аргументов командной строки
const email = process.argv[2];

if (!email) {
    console.error('❌ Ошибка: Укажите email пользователя');
    console.log('📝 Использование: node make-admin.js your-email@example.com');
    process.exit(1);
}

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'kitchen.sqlite');

// Открываем соединение с базой данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
        process.exit(1);
    }
    console.log('✅ Подключено к базе данных');
});

// Обновляем роль пользователя
db.run(
    'UPDATE users SET role = ? WHERE email = ?',
    ['admin', email],
    function (err) {
        if (err) {
            console.error('❌ Ошибка при обновлении роли:', err.message);
            db.close();
            process.exit(1);
        }

        if (this.changes === 0) {
            console.log(`⚠️  Пользователь с email "${email}" не найден`);
            console.log('💡 Убедитесь, что пользователь зарегистрирован в системе');
        } else {
            console.log(`✅ Роль admin успешно назначена пользователю "${email}"`);
            console.log('🔄 Перезайдите в систему, чтобы изменения вступили в силу');
        }

        // Показываем информацию о пользователе
        db.get(
            'SELECT id, email, full_name, role, created_at FROM users WHERE email = ?',
            [email],
            (err, row) => {
                if (err) {
                    console.error('❌ Ошибка при получении данных:', err.message);
                } else if (row) {
                    console.log('\n📋 Информация о пользователе:');
                    console.log('   ID:', row.id);
                    console.log('   Email:', row.email);
                    console.log('   Имя:', row.full_name);
                    console.log('   Роль:', row.role);
                    console.log('   Дата регистрации:', row.created_at);
                }

                db.close((err) => {
                    if (err) {
                        console.error('❌ Ошибка при закрытии базы данных:', err.message);
                    }
                });
            }
        );
    }
);
