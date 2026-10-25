const fs = require('fs');
const path = require('path');
const db = require('../src/shared/database/db-universal');

async function seedAllergens() {
    try {
        console.log('🌱 Начинаем добавление аллергенов...');

        // Читаем SQL-файл
        const seedPath = path.join(__dirname, '../seeds/seed_allergens.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // Разбиваем на отдельные команды
        const statements = seedSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        // Выполняем каждую команду
        for (const statement of statements) {
            try {
                await db.run(statement);
            } catch (err) {
                if (!err.message.includes('UNIQUE constraint')) {
                    console.warn('⚠️ Предупреждение при выполнении SQL:', err.message);
                }
            }
        }

        // Проверяем количество добавленных аллергенов
        const count = await db.get('SELECT COUNT(*) as count FROM allergens');
        console.log(`\n✅ Всего аллергенов в базе: ${count.count}`);

        // Показываем список
        const allergens = await db.all('SELECT id, name FROM allergens ORDER BY name');
        console.log('\n📋 Список аллергенов:');
        allergens.forEach((a) => {
            console.log(`   ${a.id}. ${a.name}`);
        });

        console.log('\n✨ Готово!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

seedAllergens();
