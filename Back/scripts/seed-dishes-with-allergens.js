const db = require('../src/models/db');

async function seedDishesWithAllergens() {
    try {
        console.log('🌱 Добавление тестовых блюд с аллергенами...');

        // Получаем ID ингредиентов
        const ingredients = await db.all('SELECT id, name FROM ingredients LIMIT 20');

        if (ingredients.length === 0) {
            console.log('❌ Сначала добавьте ингредиенты через seed-ingredients.js');
            process.exit(1);
        }

        // Получаем ID пользователя (первый пользователь)
        const user = await db.get('SELECT id FROM users LIMIT 1');

        if (!user) {
            console.log('❌ Нет пользователей в базе');
            process.exit(1);
        }

        // Блюдо 1: Омлет (содержит яйца, молоко)
        const omeletId = await db.run(`
            INSERT INTO dishes (name, created_by)
            VALUES (?, ?)
        `, [
            'Омлет классический',
            user.id
        ]);

        // Находим яйца и молоко
        const eggs = ingredients.find(i => i.name.toLowerCase().includes('яйц'));
        const milk = ingredients.find(i => i.name.toLowerCase().includes('молок'));

        if (eggs) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [omeletId.lastID, eggs.id, 3]);
        }
        if (milk) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [omeletId.lastID, milk.id, 50]);
        }

        console.log('✅ Добавлено блюдо: Омлет классический (яйца, молоко)');

        // Блюдо 2: Рыбный суп (содержит рыбу, морепродукты)
        const fishSoupId = await db.run(`
            INSERT INTO dishes (name, created_by)
            VALUES (?, ?)
        `, [
            'Рыбный суп',
            user.id
        ]);

        const fish = ingredients.find(i => i.name.toLowerCase().includes('рыб') || i.name.toLowerCase().includes('сёмг') || i.name.toLowerCase().includes('лосос'));
        const potato = ingredients.find(i => i.name.toLowerCase().includes('картоф'));

        if (fish) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [fishSoupId.lastID, fish.id, 300]);
        }
        if (potato) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [fishSoupId.lastID, potato.id, 200]);
        }

        console.log('✅ Добавлено блюдо: Рыбный суп (рыба)');

        // Блюдо 3: Пшеничный хлеб (содержит пшеницу/глютен)
        const breadId = await db.run(`
            INSERT INTO dishes (name, created_by)
            VALUES (?, ?)
        `, [
            'Пшеничный хлеб',
            user.id
        ]);

        const flour = ingredients.find(i => i.name.toLowerCase().includes('мук'));
        const water = ingredients.find(i => i.name.toLowerCase().includes('вод'));

        if (flour) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [breadId.lastID, flour.id, 500]);
        }
        if (water) {
            await db.run('INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [breadId.lastID, water.id, 300]);
        }

        console.log('✅ Добавлено блюдо: Пшеничный хлеб (пшеница/глютен)');

        console.log('\n✨ Тестовые блюда с аллергенами успешно добавлены!');
        console.log('\nДобавленные блюда:');
        console.log('1. Омлет классический - содержит аллергены: Яйца, Молоко');
        console.log('2. Рыбный суп - содержит аллергены: Рыба');
        console.log('3. Пшеничный хлеб - содержит аллергены: Пшеница (глютен)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

seedDishesWithAllergens();
