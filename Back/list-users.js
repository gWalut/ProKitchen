/**
 * Скрипт для просмотра всех пользователей
 * 
 * Использование:
 * node list-users.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'kitchen.sqlite');

// Открываем соединение с базой данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
        process.exit(1);
    }
    console.log('✅ Подключено к базе данных\n');
});

// Получаем всех пользователей
db.all(
    'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, rows) => {
        if (err) {
            console.error('❌ Ошибка при получении пользователей:', err.message);
            db.close();
            process.exit(1);
        }

        if (rows.length === 0) {
            console.log('⚠️  В базе данных нет пользователей');
            console.log('💡 Зарегистрируйтесь в приложении, чтобы создать пользователя');
        } else {
            console.log('👥 Список всех пользователей:\n');
            console.log('═'.repeat(100));

            rows.forEach((row, index) => {
                const roleIcon = row.role === 'admin' ? '👑' : '👤';
                const roleColor = row.role === 'admin' ? '[ADMIN]' : '[USER]';

                console.log(`${index + 1}. ${roleIcon} ${roleColor}`);
                console.log(`   ID: ${row.id}`);
                console.log(`   Email: ${row.email}`);
                console.log(`   Имя: ${row.full_name}`);
                console.log(`   Роль: ${row.role}`);
                console.log(`   Дата регистрации: ${row.created_at}`);
                console.log('─'.repeat(100));
            });

            console.log(`\n📊 Всего пользователей: ${rows.length}`);

            const admins = rows.filter(r => r.role === 'admin').length;
            const users = rows.filter(r => r.role === 'user').length;

            console.log(`   👑 Администраторов: ${admins}`);
            console.log(`   👤 Пользователей: ${users}`);

            console.log('\n💡 Чтобы сделать пользователя админом:');
            console.log('   node make-admin.js EMAIL');
        }

        db.close((err) => {
            if (err) {
                console.error('❌ Ошибка при закрытии базы данных:', err.message);
            }
        });
    }
);
