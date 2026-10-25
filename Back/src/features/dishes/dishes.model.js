const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db-universal');

class DishesModel extends BaseModel {
    constructor() {
        super('dishes', ['name', 'description']);
    }

    async create(dishData) {
        const result = await db.run(
            `INSERT INTO dishes (
                name, description, instructions, cooking_time,
                difficulty_level, portion_size, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dishData.name,
                dishData.description || null,
                dishData.instructions || null,
                dishData.cooking_time || null,
                dishData.difficulty_level || null,
                dishData.portion_size || null,
                dishData.created_by
            ]
        );

        const dishId = result.lastInsertRowid;

        if (dishData.ingredients && dishData.ingredients.length > 0) {
            for (const ingredient of dishData.ingredients) {
                await db.run(
                    `INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
                    VALUES (?, ?, ?)`,
                    [dishId, ingredient.id, ingredient.quantity]
                );
            }
        }

        return dishId;
    }

    async list(limit = 20, offset = 0) {
        return await db.all(
            `SELECT * FROM dishes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
    }

    async count() {
        const result = await db.get('SELECT COUNT(*) as count FROM dishes');
        return result.count;
    }

    async update(id, dishData) {
        const fields = [];
        const values = [];

        if (dishData.name !== undefined) { fields.push('name = ?'); values.push(dishData.name); }
        if (dishData.description !== undefined) { fields.push('description = ?'); values.push(dishData.description); }
        if (dishData.instructions !== undefined) { fields.push('instructions = ?'); values.push(dishData.instructions); }
        if (dishData.cooking_time !== undefined) { fields.push('cooking_time = ?'); values.push(dishData.cooking_time); }
        if (dishData.difficulty_level !== undefined) { fields.push('difficulty_level = ?'); values.push(dishData.difficulty_level); }
        if (dishData.portion_size !== undefined) { fields.push('portion_size = ?'); values.push(dishData.portion_size); }
        if (dishData.is_published !== undefined) { fields.push('is_published = ?'); values.push(dishData.is_published ? 1 : 0); }
        if (dishData.cost_per_portion !== undefined) { fields.push('cost_per_portion = ?'); values.push(dishData.cost_per_portion); }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const result = await db.run(
            `UPDATE dishes SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        if (result.changes === 0) {
            throw new Error(`Dish with id ${id} not found`);
        }

        if (dishData.ingredients) {
            // Удаляем старые ингредиенты
            await db.run('DELETE FROM dish_ingredients WHERE dish_id = ?', [id]);

            // Добавляем новые
            for (const ingredient of dishData.ingredients) {
                await db.run(
                    `INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
                    VALUES (?, ?, ?)`,
                    [id, ingredient.id, ingredient.quantity]
                );
            }
        }

        return result;
    }

    async getDishIngredients(dishId) {
        const ingredients = await db.all(
            `SELECT i.*, di.quantity
            FROM ingredients i
            JOIN dish_ingredients di ON i.id = di.ingredient_id
            WHERE di.dish_id = ?`,
            [dishId]
        );

        // Для каждого ингредиента получаем его аллергены
        for (const ingredient of ingredients) {
            ingredient.allergens = await db.all(
                `SELECT a.id, a.name, a.description
                FROM allergens a
                JOIN ingredient_allergens ia ON a.id = ia.allergen_id
                WHERE ia.ingredient_id = ?`,
                [ingredient.id]
            );
        }

        return ingredients;
    }

    async getByCreatedUser(userId) {
        return await db.all(
            `SELECT * FROM dishes WHERE created_by = ? ORDER BY created_at DESC`,
            [userId]
        );
    }

    async searchByName(query) {
        return await db.all(
            `SELECT * FROM dishes WHERE LOWER(name) LIKE LOWER(?) ORDER BY name`,
            [`%${query}%`]
        );
    }

    async getByExactName(name) {
        return await db.get(
            `SELECT * FROM dishes WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))`,
            [name]
        );
    }

    async getOwnerId(dishId) {
        const dish = await db.get(
            `SELECT created_by FROM dishes WHERE id = ?`,
            [dishId]
        );
        return dish ? dish.created_by : null;
    }
}

module.exports = new DishesModel();