const db = require('../src/shared/database/db-universal');

const allergens = [
    { name: 'Злаки (глютен)', description: 'Пшеница, рожь, ячмень, овес и их гибридные сорта' },
    { name: 'Ракообразные', description: 'Крабы, креветки, лангусты, раки' },
    { name: 'Яйца', description: 'Куриные яйца и продукты их переработки' },
    { name: 'Рыба', description: 'Все виды рыбы и продукты их переработки' },
    { name: 'Арахис', description: 'Арахис и продукты его переработки' },
    { name: 'Соя', description: 'Соевые бобы и продукты их переработки' },
    { name: 'Молоко', description: 'Молоко и молочные продукты (включая лактозу)' },
    { name: 'Орехи', description: 'Миндаль, фундук, грецкий орех, кешью и др.' },
    { name: 'Сельдерей', description: 'Сельдерей и продукты его переработки' },
    { name: 'Горчица', description: 'Горчица и продукты ее переработки' },
    { name: 'Кунжут', description: 'Семена кунжута и продукты их переработки' },
    { name: 'Сульфиты', description: 'Диоксид серы и сульфиты' },
    { name: 'Люпин', description: 'Люпин и продукты его переработки' },
    { name: 'Моллюски', description: 'Моллюски и продукты их переработки' }
];

async function addAllergens() {
    try {
        console.log('🌱 Добавление аллергенов...\n');

        let added = 0;
        let skipped = 0;

        for (const allergen of allergens) {
            // Проверяем, существует ли уже
            const existing = await db.get(
                'SELECT id FROM allergens WHERE name = ?',
                [allergen.name]
            );

            if (existing) {
                console.log(`⏭️  Пропускаем "${allergen.name}" - уже существует`);
                skipped++;
                continue;
            }

            // Добавляем новый аллерген
            await db.run(
                'INSERT INTO allergens (name, description) VALUES (?, ?)',
                [allergen.name, allergen.description]
            );

            console.log(`✅ Добавлен: ${allergen.name}`);
            added++;
        }

        console.log(`\n📊 Итоги:`);
        console.log(`   ✅ Добавлено: ${added}`);
        console.log(`   ⏭️  Пропущено: ${skipped}`);

        const count = await db.get('SELECT COUNT(*) as count FROM allergens');
        console.log(`\n🎯 Всего аллергенов в базе: ${count.count}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

addAllergens();
