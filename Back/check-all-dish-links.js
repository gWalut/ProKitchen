const db = require('./src/models/db-universal');

async function checkAllDishIngredients() {
    try {
        console.log('🔍 Проверка связей блюд и ингредиентов...\n');

        const dishes = await db.all('SELECT id, name FROM dishes');

        for (const dish of dishes) {
            const ingredients = await db.all(
                'SELECT * FROM dish_ingredients WHERE dish_id = ?',
                [dish.id]
            );
            console.log(`${dish.id}. "${dish.name}" → ${ingredients.length} ингредиентов`);

            if (ingredients.length > 0) {
                for (const ing of ingredients) {
                    const ingData = await db.get('SELECT name FROM ingredients WHERE id = ?', [ing.ingredient_id]);
                    console.log(`   - ${ingData?.name || 'unknown'} (quantity: ${ing.quantity})`);
                }
            }
        }

        console.log('\n---\nВсе связи в dish_ingredients:');
        const allLinks = await db.all('SELECT * FROM dish_ingredients');
        console.log(`Всего: ${allLinks.length}`);
        allLinks.forEach(l => {
            console.log(`   dish_id=${l.dish_id}, ingredient_id=${l.ingredient_id}, qty=${l.quantity}`);
        });

        console.log('\n✨ Проверка завершена!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

checkAllDishIngredients();
