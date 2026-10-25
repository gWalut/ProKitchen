// Простой тест для проверки работы поиска блюд
const dishesModel = require('./src/models/dishesModel');

async function testSearch() {
    try {
        console.log('🔍 Тестирование поиска блюд...\n');

        // Тест 1: Поиск по точному имени
        console.log('1️⃣ Тест: Поиск "Омлет с сыром"');
        const omelet = await dishesModel.getByExactName('Омлет с сыром');
        console.log('Результат:', omelet ? `✅ Найдено: ${omelet.name}` : '❌ Не найдено');

        if (omelet) {
            // Получаем ингредиенты с аллергенами
            const ingredients = await dishesModel.getDishIngredients(omelet.id);
            console.log('Ингредиенты:', ingredients.length);

            // Собираем все аллергены
            const allergens = [];
            ingredients.forEach(ing => {
                if (ing.allergens) {
                    ing.allergens.forEach(a => {
                        if (!allergens.includes(a.name)) {
                            allergens.push(a.name);
                        }
                    });
                }
            });
            console.log('Аллергены:', allergens.join(', ') || 'Нет');
        }

        console.log('\n2️⃣ Тест: Список всех блюд');
        const allDishes = await dishesModel.list(100, 0);
        console.log(`Всего блюд в БД: ${allDishes.length}`);
        allDishes.forEach((dish, i) => {
            console.log(`   ${i + 1}. ${dish.name}`);
        });

        console.log('\n✨ Тест завершен!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

testSearch();
