const db = require('./src/models/db-universal');

async function linkIngredientsToAllergens() {
    try {
        console.log('🔗 Связывание ингредиентов с аллергенами...\n');

        // Получаем ID аллергенов
        const allergenFish = await db.get('SELECT id FROM allergens WHERE name LIKE "%Рыба%"');
        const allergenCrustaceans = await db.get('SELECT id FROM allergens WHERE name LIKE "%Ракообразные%"');
        const allergenPeanuts = await db.get('SELECT id FROM allergens WHERE name LIKE "%Арахис%"');
        const allergenNuts = await db.get('SELECT id FROM allergens WHERE name LIKE "%Орехи%"');

        console.log('Найденные аллергены:');
        console.log(`  - Рыба: ${allergenFish?.id}`);
        console.log(`  - Ракообразные: ${allergenCrustaceans?.id}`);
        console.log(`  - Арахис: ${allergenPeanuts?.id}`);
        console.log(`  - Орехи: ${allergenNuts?.id}\n`);

        // Связываем ингредиенты с аллергенами
        const links = [
            // Рыба
            { ingredientName: 'Лосось (филе)', allergenId: allergenFish?.id },
            { ingredientName: 'Сёмга', allergenId: allergenFish?.id },

            // Ракообразные
            { ingredientName: 'Креветки', allergenId: allergenCrustaceans?.id },
            { ingredientName: 'Кальмары', allergenId: allergenCrustaceans?.id },

            // Арахис
            { ingredientName: 'Арахис', allergenId: allergenPeanuts?.id },

            // Орехи
            { ingredientName: 'Миндаль', allergenId: allergenNuts?.id },
            { ingredientName: 'Грецкий орех', allergenId: allergenNuts?.id }
        ];

        let added = 0;
        for (const link of links) {
            if (!link.allergenId) continue;

            const ingredient = await db.get('SELECT id FROM ingredients WHERE name = ?', [link.ingredientName]);
            if (!ingredient) {
                console.log(`⚠️  Ингредиент "${link.ingredientName}" не найден`);
                continue;
            }

            // Проверяем, есть ли уже такая связь
            const existing = await db.get(
                'SELECT * FROM ingredient_allergens WHERE ingredient_id = ? AND allergen_id = ?',
                [ingredient.id, link.allergenId]
            );

            if (existing) {
                console.log(`⏭️  Связь "${link.ingredientName}" уже существует`);
                continue;
            }

            await db.run(
                'INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES (?, ?)',
                [ingredient.id, link.allergenId]
            );

            console.log(`✅ Связан: ${link.ingredientName}`);
            added++;
        }

        console.log(`\n📊 Добавлено связей: ${added}`);
        console.log('\n✨ Готово!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

linkIngredientsToAllergens();
