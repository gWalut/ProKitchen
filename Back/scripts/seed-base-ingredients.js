const db = require('../src/shared/database/db-universal');

const baseIngredients = [
    // Мясо и птица
    { name: 'Курица (филе)', unit: 'г', price_per_unit: 0.45 },
    { name: 'Свинина', unit: 'г', price_per_unit: 0.55 },
    { name: 'Говядина', unit: 'г', price_per_unit: 0.70 },
    { name: 'Фарш говяжий', unit: 'г', price_per_unit: 0.50 },

    // Овощи
    { name: 'Картофель', unit: 'г', price_per_unit: 0.05 },
    { name: 'Морковь', unit: 'г', price_per_unit: 0.04 },
    { name: 'Лук репчатый', unit: 'г', price_per_unit: 0.03 },
    { name: 'Помидоры', unit: 'г', price_per_unit: 0.15 },
    { name: 'Огурцы', unit: 'г', price_per_unit: 0.12 },
    { name: 'Капуста белокочанная', unit: 'г', price_per_unit: 0.03 },
    { name: 'Перец болгарский', unit: 'г', price_per_unit: 0.20 },

    // Крупы и макароны
    { name: 'Рис', unit: 'г', price_per_unit: 0.10 },
    { name: 'Гречка', unit: 'г', price_per_unit: 0.12 },
    { name: 'Макароны', unit: 'г', price_per_unit: 0.08 },
    { name: 'Мука пшеничная', unit: 'г', price_per_unit: 0.05 },

    // Молочные продукты
    { name: 'Молоко', unit: 'мл', price_per_unit: 0.08 },
    { name: 'Сметана', unit: 'г', price_per_unit: 0.25 },
    { name: 'Сыр твёрдый', unit: 'г', price_per_unit: 0.70 },
    { name: 'Масло сливочное', unit: 'г', price_per_unit: 0.90 },
    { name: 'Творог', unit: 'г', price_per_unit: 0.35 },

    // Яйца и масло
    { name: 'Яйца куриные', unit: 'шт', price_per_unit: 12.0 },
    { name: 'Масло растительное', unit: 'мл', price_per_unit: 0.15 },

    // Специи и приправы
    { name: 'Соль', unit: 'г', price_per_unit: 0.01 },
    { name: 'Сахар', unit: 'г', price_per_unit: 0.06 },
    { name: 'Перец черный молотый', unit: 'г', price_per_unit: 2.0 },

    // Зелень
    { name: 'Укроп', unit: 'г', price_per_unit: 0.50 },
    { name: 'Петрушка', unit: 'г', price_per_unit: 0.50 },
    { name: 'Зелёный лук', unit: 'г', price_per_unit: 0.40 },

    // Дополнительно
    { name: 'Чеснок', unit: 'г', price_per_unit: 0.35 },
    { name: 'Майонез', unit: 'г', price_per_unit: 0.20 },

    // Морепродукты и рыба
    { name: 'Лосось (филе)', unit: 'г', price_per_unit: 1.20 },
    { name: 'Креветки', unit: 'г', price_per_unit: 1.50 },

    // Орехи и семена
    { name: 'Арахис', unit: 'г', price_per_unit: 0.80 }
]; async function seedBaseIngredients() {
    try {
        console.log('🌱 Начинаем добавление базовых ингредиентов...');

        // Проверяем, есть ли уже ингредиенты
        const existingCount = await db.get('SELECT COUNT(*) as count FROM ingredients');

        if (existingCount.count > 0) {
            console.log(`⚠️  В базе уже есть ${existingCount.count} ингредиентов`);
            console.log('Продолжаем и добавляем недостающие ингредиенты...');
        }

        let added = 0;
        let skipped = 0;

        for (const ingredient of baseIngredients) {
            try {
                // Проверяем, существует ли уже такой ингредиент
                const existing = await db.get(
                    'SELECT id FROM ingredients WHERE name = ?',
                    [ingredient.name]
                );

                if (existing) {
                    console.log(`⏭️  Пропускаем "${ingredient.name}" - уже существует`);
                    skipped++;
                    continue;
                }

                // Добавляем новый ингредиент
                await db.run(
                    `INSERT INTO ingredients (name, unit, price_per_unit, stock_quantity)
                     VALUES (?, ?, ?, ?)`,
                    [
                        ingredient.name,
                        ingredient.unit,
                        ingredient.price_per_unit,
                        1000 // Достаточное количество на складе
                    ]
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
        console.log(`   📦 Всего базовых ингредиентов: ${baseIngredients.length}`);

        // Показываем итоговое количество в базе
        const finalCount = await db.get('SELECT COUNT(*) as count FROM ingredients');
        console.log(`\n🎯 Всего ингредиентов в базе: ${finalCount.count}`);

    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

// Запуск
seedBaseIngredients()
    .then(() => {
        console.log('\n✨ Готово!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('💥 Неожиданная ошибка:', err);
        process.exit(1);
    });
