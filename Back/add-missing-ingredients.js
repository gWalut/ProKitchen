const db = require('./src/models/db-universal');

const missingIngredients = [
    // Рыба
    { name: 'Лосось (филе)', unit: 'г', price_per_unit: 1.20 },
    { name: 'Сёмга', unit: 'г', price_per_unit: 1.30 },

    // Морепродукты
    { name: 'Креветки', unit: 'г', price_per_unit: 1.50 },
    { name: 'Кальмары', unit: 'г', price_per_unit: 0.80 },

    // Орехи
    { name: 'Арахис', unit: 'г', price_per_unit: 0.60 },
    { name: 'Миндаль', unit: 'г', price_per_unit: 1.00 },
    { name: 'Грецкий орех', unit: 'г', price_per_unit: 0.90 }
];

async function addMissingIngredients() {
    try {
        console.log('🌱 Добавление недостающих ингредиентов...\n');

        let added = 0;
        let skipped = 0;

        for (const ingredient of missingIngredients) {
            try {
                const existing = await db.get('SELECT id FROM ingredients WHERE name = ?', [ingredient.name]);

                if (existing) {
                    console.log(`⏭️  Пропускаем "${ingredient.name}" - уже существует`);
                    skipped++;
                    continue;
                }

                await db.run(
                    'INSERT INTO ingredients (name, unit, price_per_unit, stock_quantity) VALUES (?, ?, ?, ?)',
                    [ingredient.name, ingredient.unit, ingredient.price_per_unit, 1000]
                );

                console.log(`✅ Добавлен: ${ingredient.name} - ${ingredient.price_per_unit} руб/${ingredient.unit}`);
                added++;
            } catch (err) {
                console.error(`❌ Ошибка при добавлении "${ingredient.name}":`, err.message);
            }
        }

        console.log('\n📊 Итоги:');
        console.log(`   ✅ Добавлено: ${added}`);
        console.log(`   ⏭️  Пропущено: ${skipped}`);

        const finalCount = await db.get('SELECT COUNT(*) as count FROM ingredients');
        console.log(`\n🎯 Всего ингредиентов в базе: ${finalCount.count}`);

        console.log('\n✨ Готово!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

addMissingIngredients();
