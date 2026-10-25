const db = require('../src/shared/database/db-universal');

/**
 * Добавляемые блюда:
 * 1. Омлет с сыром - Яйца, Молоко
 * 2. Лососевый стейк - Рыба
 * 3. Хлеб пшеничный - Злаки (глютен)
 * 4. Креветки в соусе - Ракообразные, Молоко
 * 5. Арахисовое печенье - Арахис, Злаки (глютен), Яйца, Молоко
 */

async function seed5DishesWithAllergens() {
    try {
        console.log('🌱 Начинаем добавление 5 блюд с аллергенами...\n');

        // Получаем первого пользователя (для created_by)
        const user = await db.get('SELECT id FROM users LIMIT 1');
        if (!user) {
            console.log('❌ Ошибка: В базе нет пользователей. Сначала зарегистрируйтесь в приложении.');
            process.exit(1);
        }

        // Получаем все ингредиенты
        const allIngredients = await db.all('SELECT id, name FROM ingredients');
        if (allIngredients.length === 0) {
            console.log('❌ Ошибка: В базе нет ингредиентов. Запустите seed-base-ingredients.js');
            process.exit(1);
        }

        // Получаем все аллергены
        const allAllergens = await db.all('SELECT id, name FROM allergens');
        if (allAllergens.length === 0) {
            console.log('❌ Ошибка: В базе нет аллергенов. Запустите seed_allergens.js');
            process.exit(1);
        }

        console.log(`✓ Найдено ${allIngredients.length} ингредиентов и ${allAllergens.length} аллергенов\n`);

        // Вспомогательная функция для поиска ингредиента
        const findIngredient = (keywords) => {
            for (const keyword of keywords) {
                const ingredient = allIngredients.find(i =>
                    i.name.toLowerCase().includes(keyword.toLowerCase())
                );
                if (ingredient) return ingredient;
            }
            return null;
        };

        // Вспомогательная функция для поиска аллергена
        const findAllergen = (keywords) => {
            for (const keyword of keywords) {
                const allergen = allAllergens.find(a =>
                    a.name.toLowerCase().includes(keyword.toLowerCase())
                );
                if (allergen) return allergen;
            }
            return null;
        };

        // Вспомогательная функция для добавления блюда
        const addDish = async (dishData) => {
            const { name, ingredients, allergenKeywords } = dishData;

            // Проверяем, существует ли блюдо
            const existing = await db.get('SELECT id FROM dishes WHERE name = ?', [name]);
            if (existing) {
                console.log(`⏭️  Пропускаем "${name}" - уже существует\n`);
                return false;
            }

            // Добавляем блюдо
            const result = await db.run(
                `INSERT INTO dishes (name, created_by, is_published, instructions, cooking_time, difficulty_level, portion_size)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, user.id, true, 'Инструкция по приготовлению', 30, 'Средний', 1]
            );

            const dishId = result.lastInsertRowid || result.lastID;

            // Добавляем ингредиенты
            for (const ing of ingredients) {
                const ingredient = findIngredient(ing.keywords);
                if (ingredient) {
                    await db.run(
                        'INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                        [dishId, ingredient.id, ing.quantity]
                    );

                    // Связываем ингредиент с его аллергенами
                    for (const allergenKeyword of ing.allergens || []) {
                        const allergen = findAllergen([allergenKeyword]);
                        if (allergen) {
                            // Проверяем, есть ли уже такая связь
                            const existingLink = await db.get(
                                'SELECT * FROM ingredient_allergens WHERE ingredient_id = ? AND allergen_id = ?',
                                [ingredient.id, allergen.id]
                            );
                            if (!existingLink) {
                                await db.run(
                                    'INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES (?, ?)',
                                    [ingredient.id, allergen.id]
                                );
                            }
                        }
                    }
                }
            }

            // Выводим информацию о добавленном блюде
            const foundAllergens = [];
            for (const keyword of allergenKeywords) {
                const allergen = findAllergen([keyword]);
                if (allergen) foundAllergens.push(allergen.name);
            }

            console.log(`✅ Добавлено блюдо: ${name}`);
            console.log(`   ⚠️  Аллергены: ${foundAllergens.join(', ')}`);
            console.log('');

            return true;
        };

        // ==================== БЛЮДО 1: Омлет с сыром ====================
        await addDish({
            name: 'Омлет с сыром',
            ingredients: [
                { keywords: ['Яйца куриные'], quantity: 4, allergens: ['Яйца'] },
                { keywords: ['Молоко'], quantity: 50, allergens: ['Молоко'] },
                { keywords: ['Сыр'], quantity: 80, allergens: ['Молоко'] },
                { keywords: ['Масло сливочное'], quantity: 20, allergens: ['Молоко'] },
                { keywords: ['Соль'], quantity: 2, allergens: [] }
            ],
            allergenKeywords: ['Яйца', 'Молоко']
        });

        // ==================== БЛЮДО 2: Лососевый стейк ====================
        await addDish({
            name: 'Лососевый стейк',
            ingredients: [
                { keywords: ['Лосось', 'Сёмга'], quantity: 400, allergens: ['Рыба'] },
                { keywords: ['Масло растительное'], quantity: 15, allergens: [] },
                { keywords: ['Соль'], quantity: 3, allergens: [] },
                { keywords: ['Перец черный'], quantity: 2, allergens: [] }
            ],
            allergenKeywords: ['Рыба']
        });

        // ==================== БЛЮДО 3: Хлеб пшеничный ====================
        await addDish({
            name: 'Хлеб пшеничный',
            ingredients: [
                { keywords: ['Мука пшеничная'], quantity: 500, allergens: ['Злаки', 'глютен'] },
                { keywords: ['Соль'], quantity: 10, allergens: [] },
                { keywords: ['Сахар'], quantity: 15, allergens: [] },
                { keywords: ['Масло растительное'], quantity: 30, allergens: [] }
            ],
            allergenKeywords: ['Злаки', 'глютен']
        });

        // ==================== БЛЮДО 4: Креветки в сливочном соусе ====================
        await addDish({
            name: 'Креветки в сливочном соусе',
            ingredients: [
                { keywords: ['Креветки'], quantity: 400, allergens: ['Ракообразные'] },
                { keywords: ['Сметана'], quantity: 200, allergens: ['Молоко'] },
                { keywords: ['Чеснок'], quantity: 15, allergens: [] },
                { keywords: ['Масло сливочное'], quantity: 30, allergens: ['Молоко'] },
                { keywords: ['Петрушка'], quantity: 20, allergens: [] },
                { keywords: ['Соль'], quantity: 3, allergens: [] }
            ],
            allergenKeywords: ['Ракообразные', 'Молоко']
        });

        // ==================== БЛЮДО 5: Арахисовое печенье ====================
        await addDish({
            name: 'Арахисовое печенье',
            ingredients: [
                { keywords: ['Арахис'], quantity: 150, allergens: ['Арахис'] },
                { keywords: ['Мука пшеничная'], quantity: 300, allergens: ['Злаки', 'глютен'] },
                { keywords: ['Яйца куриные'], quantity: 2, allergens: ['Яйца'] },
                { keywords: ['Масло сливочное'], quantity: 100, allergens: ['Молоко'] },
                { keywords: ['Сахар'], quantity: 150, allergens: [] }
            ],
            allergenKeywords: ['Арахис', 'Злаки', 'глютен', 'Яйца', 'Молоко']
        });

        console.log('═'.repeat(60));
        console.log('✨ Все блюда успешно добавлены!');
        console.log('═'.repeat(60));
        console.log('\n📋 Список добавленных блюд с аллергенами:\n');
        console.log('1️⃣  Омлет с сыром → Яйца, Молоко');
        console.log('2️⃣  Лососевый стейк → Рыба');
        console.log('3️⃣  Хлеб пшеничный → Злаки (глютен)');
        console.log('4️⃣  Креветки в сливочном соусе → Ракообразные, Молоко');
        console.log('5️⃣  Арахисовое печенье → Арахис, Злаки (глютен), Яйца, Молоко');
        console.log('\n💡 Теперь эти блюда можно искать на странице матрицы аллергенов!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

// Запуск скрипта
seed5DishesWithAllergens();
