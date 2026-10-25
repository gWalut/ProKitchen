const db = require('../src/models/db');

const ingredients = [
    { name: 'Мука пшеничная', description: 'Высший сорт', unit: 'г', price_per_unit: 0.05, calories_per_unit: 3.64, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Сахар', description: 'Белый сахар-песок', unit: 'г', price_per_unit: 0.07, calories_per_unit: 3.87, stock_quantity: 3000, minimum_stock_level: 500 },
    { name: 'Соль', description: 'Поваренная соль', unit: 'г', price_per_unit: 0.02, calories_per_unit: 0, stock_quantity: 2000, minimum_stock_level: 500 },
    { name: 'Яйца', description: 'Куриные яйца С1', unit: 'шт', price_per_unit: 10, calories_per_unit: 157, stock_quantity: 100, minimum_stock_level: 20 },
    { name: 'Молоко', description: 'Молоко 3.2%', unit: 'мл', price_per_unit: 0.06, calories_per_unit: 0.59, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Сливочное масло', description: '82.5% жирность', unit: 'г', price_per_unit: 0.9, calories_per_unit: 7.17, stock_quantity: 1000, minimum_stock_level: 200 },
    { name: 'Подсолнечное масло', description: 'Рафинированное', unit: 'мл', price_per_unit: 0.12, calories_per_unit: 8.99, stock_quantity: 3000, minimum_stock_level: 500 },
    { name: 'Картофель', description: 'Свежий картофель', unit: 'г', price_per_unit: 0.04, calories_per_unit: 0.77, stock_quantity: 10000, minimum_stock_level: 2000 },
    { name: 'Морковь', description: 'Свежая морковь', unit: 'г', price_per_unit: 0.05, calories_per_unit: 0.41, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Лук репчатый', description: 'Свежий лук', unit: 'г', price_per_unit: 0.03, calories_per_unit: 0.42, stock_quantity: 4000, minimum_stock_level: 1000 },
    { name: 'Чеснок', description: 'Свежий чеснок', unit: 'г', price_per_unit: 0.4, calories_per_unit: 1.49, stock_quantity: 500, minimum_stock_level: 100 },
    { name: 'Томаты', description: 'Свежие помидоры', unit: 'г', price_per_unit: 0.15, calories_per_unit: 0.18, stock_quantity: 3000, minimum_stock_level: 500 },
    { name: 'Огурцы', description: 'Свежие огурцы', unit: 'г', price_per_unit: 0.12, calories_per_unit: 0.15, stock_quantity: 2000, minimum_stock_level: 500 },
    { name: 'Куриное филе', description: 'Грудка', unit: 'г', price_per_unit: 0.35, calories_per_unit: 1.65, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Говядина', description: 'Вырезка', unit: 'г', price_per_unit: 0.6, calories_per_unit: 2.50, stock_quantity: 3000, minimum_stock_level: 500 },
    { name: 'Свинина', description: 'Вырезка', unit: 'г', price_per_unit: 0.45, calories_per_unit: 2.42, stock_quantity: 3000, minimum_stock_level: 500 },
    { name: 'Рис', description: 'Круглозерный', unit: 'г', price_per_unit: 0.08, calories_per_unit: 3.44, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Гречка', description: 'Ядрица', unit: 'г', price_per_unit: 0.09, calories_per_unit: 3.43, stock_quantity: 4000, minimum_stock_level: 1000 },
    { name: 'Макароны', description: 'Высший сорт', unit: 'г', price_per_unit: 0.07, calories_per_unit: 3.44, stock_quantity: 5000, minimum_stock_level: 1000 },
    { name: 'Сметана', description: '20% жирность', unit: 'г', price_per_unit: 0.25, calories_per_unit: 2.06, stock_quantity: 2000, minimum_stock_level: 500 },
    { name: 'Сыр твердый', description: 'Российский', unit: 'г', price_per_unit: 0.6, calories_per_unit: 3.63, stock_quantity: 2000, minimum_stock_level: 300 },
    { name: 'Дрожжи сухие', description: 'Хлебопекарные', unit: 'г', price_per_unit: 2, calories_per_unit: 3.25, stock_quantity: 200, minimum_stock_level: 50 },
    { name: 'Разрыхлитель', description: 'Для теста', unit: 'г', price_per_unit: 1.5, calories_per_unit: 0, stock_quantity: 300, minimum_stock_level: 50 },
    { name: 'Ванильный сахар', description: 'Ванилин', unit: 'г', price_per_unit: 3, calories_per_unit: 3.87, stock_quantity: 200, minimum_stock_level: 50 },
    { name: 'Какао-порошок', description: 'Натуральный', unit: 'г', price_per_unit: 1.2, calories_per_unit: 2.89, stock_quantity: 500, minimum_stock_level: 100 },
];

(async () => {
    console.log('Заполнение базы данных ингредиентами...');

    try {
        let inserted = 0;
        for (const ingredient of ingredients) {
            const result = await db.run(
                `INSERT INTO ingredients (
                name, description, unit, price_per_unit, 
                calories_per_unit, stock_quantity, minimum_stock_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    ingredient.name,
                    ingredient.description,
                    ingredient.unit,
                    ingredient.price_per_unit,
                    ingredient.calories_per_unit,
                    ingredient.stock_quantity,
                    ingredient.minimum_stock_level
                ]
            );
            inserted++;
        }
        console.log(`✓ Успешно добавлено ${inserted} ингредиентов`);

        // Проверяем результат
        const count = await db.get('SELECT COUNT(*) as count FROM ingredients');
        console.log(`✓ Всего ингредиентов в базе: ${count.count}`);
    } catch (error) {
        console.error('✗ Ошибка при заполнении базы:', error.message);
        process.exit(1);
    }
})();