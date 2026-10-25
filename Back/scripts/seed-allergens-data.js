const db = require('../src/models/db-universal');

const allergens = [
    { name: 'Злаки (глютен)', description: 'Пшеница, рожь, ячмень, овес и их гибридные сорта, а также продукты их переработки' },
    { name: 'Ракообразные', description: 'Крабы, креветки, лангусты, раки и продукты их переработки' },
    { name: 'Яйца', description: 'Куриные яйца и продукты их переработки' },
    { name: 'Рыба', description: 'Все виды рыбы и продукты их переработки' },
    { name: 'Арахис', description: 'Арахис и продукты его переработки' },
    { name: 'Соя', description: 'Соевые бобы и продукты их переработки' },
    { name: 'Молоко', description: 'Молоко и молочные продукты (включая лактозу)' },
    { name: 'Орехи', description: 'Миндаль, фундук, грецкий орех, кешью, пекан, бразильский орех, фисташки, макадамия и продукты их переработки' },
    { name: 'Сельдерей', description: 'Сельдерей и продукты его переработки' },
    { name: 'Горчица', description: 'Горчица и продукты ее переработки' },
    { name: 'Кунжут', description: 'Семена кунжута и продукты их переработки' },
    { name: 'Сульфиты', description: 'Диоксид серы и сульфиты в концентрации более 10 мг/кг' },
    { name: 'Люпин', description: 'Люпин и продукты его переработки' },
    { name: 'Моллюски', description: 'Моллюски и продукты их переработки' }
];

async function seedAllergens() {
    try {
        console.log('🌱 Начинаем добавление аллергенов...\n');

        let added = 0;
        let skipped = 0;

        for (const allergen of allergens) {
            try {
                // Проверяем, существует ли уже такой аллерген
                const existing = await db.get('SELECT id FROM allergens WHERE name = ?', [allergen.name]);

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
            } catch (err) {
                console.error(`❌ Ошибка при добавлении "${allergen.name}":`, err.message);
            }
        }

        console.log('\n📊 Итоги:');
        console.log(`   ✅ Добавлено: ${added}`);
        console.log(`   ⏭️  Пропущено: ${skipped}`);
        console.log(`   📦 Всего аллергенов: ${allergens.length}`);

        // Показываем итоговое количество в базе
        const finalCount = await db.get('SELECT COUNT(*) as count FROM allergens');
        console.log(`\n🎯 Всего аллергенов в базе: ${finalCount.count}`);

        console.log('\n✨ Готово!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

seedAllergens();
