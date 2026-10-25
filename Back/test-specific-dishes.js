const dishesModel = require('./src/models/dishesModel');

async function testSpecificDishes() {
    try {
        console.log('🔍 Тестирование конкретных блюд...\n');

        // Тест 1: Лососевый стейк
        console.log('1️⃣ Тест: Поиск "Лососевый стейк"');
        const salmon = await dishesModel.getByExactName('Лососевый стейк');
        if (salmon) {
            const ingredients = await dishesModel.getDishIngredients(salmon.id);
            const allergens = [];
            ingredients.forEach(ing => {
                if (ing.allergens) {
                    ing.allergens.forEach(a => {
                        if (!allergens.includes(a.name)) allergens.push(a.name);
                    });
                }
            });
            console.log(`✅ Найдено: ${salmon.name}`);
            console.log(`   Ингредиенты: ${ingredients.length}`);
            console.log(`   Аллергены: ${allergens.join(', ') || 'Нет'}`);
        }

        console.log('\n2️⃣ Тест: Поиск "Креветки в сливочном соусе"');
        const shrimp = await dishesModel.getByExactName('Креветки в сливочном соусе');
        if (shrimp) {
            const ingredients = await dishesModel.getDishIngredients(shrimp.id);
            const allergens = [];
            ingredients.forEach(ing => {
                if (ing.allergens) {
                    ing.allergens.forEach(a => {
                        if (!allergens.includes(a.name)) allergens.push(a.name);
                    });
                }
            });
            console.log(`✅ Найдено: ${shrimp.name}`);
            console.log(`   Ингредиенты: ${ingredients.length}`);
            console.log(`   Аллергены: ${allergens.join(', ') || 'Нет'}`);
        }

        console.log('\n✨ Тест завершен!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

testSpecificDishes();
