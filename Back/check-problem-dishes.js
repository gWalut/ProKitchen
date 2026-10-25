const db = require('./src/models/db-universal');

async function checkSpecificDishes() {
    try {
        console.log('🔍 Проверка блюд "Лососевый стейк" и "Креветки в сливочном соусе"...\n');

        // Проверяем Лососевый стейк
        const salmon = await db.get('SELECT * FROM dishes WHERE name = ?', ['Лососевый стейк']);
        if (salmon) {
            console.log(`✅ Найдено блюдо: ${salmon.name} (ID: ${salmon.id})\n`);

            // Получаем ингредиенты
            const ingredients = await db.all(
                'SELECT i.*, di.quantity FROM ingredients i JOIN dish_ingredients di ON i.id = di.ingredient_id WHERE di.dish_id = ?',
                [salmon.id]
            );

            console.log(`Ингредиенты (${ingredients.length}):`);
            for (const ing of ingredients) {
                console.log(`  - ${ing.name} (${ing.quantity} ${ing.unit})`);

                // Проверяем аллергены этого ингредиента
                const allergens = await db.all(
                    'SELECT a.* FROM allergens a JOIN ingredient_allergens ia ON a.id = ia.allergen_id WHERE ia.ingredient_id = ?',
                    [ing.id]
                );

                if (allergens.length > 0) {
                    allergens.forEach(a => console.log(`      ⚠️  ${a.name}`));
                } else {
                    console.log(`      ✓ Нет аллергенов`);
                }
            }
        } else {
            console.log('❌ Блюдо "Лососевый стейк" не найдено');
        }

        console.log('\n' + '='.repeat(60) + '\n');

        // Проверяем Креветки
        const shrimp = await db.get('SELECT * FROM dishes WHERE name = ?', ['Креветки в сливочном соусе']);
        if (shrimp) {
            console.log(`✅ Найдено блюдо: ${shrimp.name} (ID: ${shrimp.id})\n`);

            const ingredients = await db.all(
                'SELECT i.*, di.quantity FROM ingredients i JOIN dish_ingredients di ON i.id = di.ingredient_id WHERE di.dish_id = ?',
                [shrimp.id]
            );

            console.log(`Ингредиенты (${ingredients.length}):`);
            for (const ing of ingredients) {
                console.log(`  - ${ing.name} (${ing.quantity} ${ing.unit})`);

                const allergens = await db.all(
                    'SELECT a.* FROM allergens a JOIN ingredient_allergens ia ON a.id = ia.allergen_id WHERE ia.ingredient_id = ?',
                    [ing.id]
                );

                if (allergens.length > 0) {
                    allergens.forEach(a => console.log(`      ⚠️  ${a.name}`));
                } else {
                    console.log(`      ✓ Нет аллергенов`);
                }
            }
        } else {
            console.log('❌ Блюдо "Креветки в сливочном соусе" не найдено');
        }

        console.log('\n✨ Проверка завершена!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

checkSpecificDishes();
