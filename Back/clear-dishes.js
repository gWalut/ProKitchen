const db = require('./src/models/db-universal');

async function clearDishes() {
    try {
        console.log('🗑️  Удаление всех блюд...\n');

        // Удаляем связи блюдо-ингредиент
        const deleted1 = await db.run('DELETE FROM dish_ingredients');
        console.log(`Удалено связей блюдо-ингредиент: ${deleted1.changes}`);

        // Удаляем блюда
        const deleted2 = await db.run('DELETE FROM dishes');
        console.log(`Удалено блюд: ${deleted2.changes}`);

        console.log('\n✨ Готово!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

clearDishes();
