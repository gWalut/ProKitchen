const db = require('./src/models/db-universal');

async function checkDatabase() {
    try {
        console.log('🔍 Проверка базы данных...\n');

        // Проверка блюд
        const dishes = await db.all('SELECT * FROM dishes');
        console.log(`📦 Блюд в БД: ${dishes.length}`);
        dishes.forEach(d => console.log(`   - ${d.name}`));

        // Проверка ингредиентов
        const ingredients = await db.all('SELECT * FROM ingredients');
        console.log(`\n🥕 Ингредиентов в БД: ${ingredients.length}`);

        // Проверка связей блюдо-ингредиент
        const dishIngredients = await db.all('SELECT * FROM dish_ingredients');
        console.log(`\n🔗 Связей блюдо-ингредиент: ${dishIngredients.length}`);

        if (dishIngredients.length > 0) {
            console.log('\nПримеры связей:');
            for (const di of dishIngredients.slice(0, 5)) {
                const dish = await db.get('SELECT name FROM dishes WHERE id = ?', [di.dish_id]);
                const ing = await db.get('SELECT name FROM ingredients WHERE id = ?', [di.ingredient_id]);
                console.log(`   - ${dish?.name || '?'} → ${ing?.name || '?'} (${di.quantity})`);
            }
        }

        // Проверка аллергенов
        const allergens = await db.all('SELECT * FROM allergens');
        console.log(`\n⚠️  Аллергенов в БД: ${allergens.length}`);

        // Проверка связей ингредиент-аллерген
        const ingAllergens = await db.all('SELECT * FROM ingredient_allergens');
        console.log(`\n🔗 Связей ингредиент-аллерген: ${ingAllergens.length}`);

        if (ingAllergens.length > 0) {
            console.log('\nПримеры связей:');
            for (const ia of ingAllergens.slice(0, 5)) {
                const ing = await db.get('SELECT name FROM ingredients WHERE id = ?', [ia.ingredient_id]);
                const all = await db.get('SELECT name FROM allergens WHERE id = ?', [ia.allergen_id]);
                console.log(`   - ${ing?.name || '?'} → ${all?.name || '?'}`);
            }
        }

        console.log('\n✨ Проверка завершена!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

checkDatabase();
