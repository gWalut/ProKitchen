const db = require('./src/models/db-universal');

async function testDishIngredients() {
    try {
        console.log('🔍 Тестирование получения ингредиентов блюда...\n');

        // Находим блюдо
        const dish = await db.get('SELECT * FROM dishes WHERE name = ?', ['Омлет с сыром']);
        console.log('Блюдо:', dish);
        console.log('ID блюда:', dish.id);

        // Пробуем получить связи
        const links = await db.all('SELECT * FROM dish_ingredients WHERE dish_id = ?', [dish.id]);
        console.log(`\nСвязей в dish_ingredients: ${links.length}`);
        links.forEach(l => console.log(`   - dish_id: ${l.dish_id}, ingredient_id: ${l.ingredient_id}, quantity: ${l.quantity}`));

        // Пробуем JOIN
        const ingredients = await db.all(`
            SELECT i.*, di.quantity
            FROM ingredients i
            JOIN dish_ingredients di ON i.id = di.ingredient_id
            WHERE di.dish_id = ?
        `, [dish.id]);

        console.log(`\nИнгредиентов через JOIN: ${ingredients.length}`);
        ingredients.forEach(ing => {
            console.log(`   - ${ing.name} (${ing.quantity} ${ing.unit})`);
        });

        // Проверяем аллергены для каждого ингредиента
        for (const ingredient of ingredients) {
            const allergens = await db.all(`
                SELECT a.id, a.name, a.description
                FROM allergens a
                JOIN ingredient_allergens ia ON a.id = ia.allergen_id
                WHERE ia.ingredient_id = ?
            `, [ingredient.id]);

            if (allergens.length > 0) {
                console.log(`\n   Аллергены для "${ingredient.name}":`);
                allergens.forEach(a => console.log(`      • ${a.name}`));
            }
        }

        console.log('\n✨ Тест завершен!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

testDishIngredients();
