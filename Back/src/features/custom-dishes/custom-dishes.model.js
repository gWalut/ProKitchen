const BaseModel = require('../../shared/models/base.model');
const { ValidationError, NotFoundError } = require('../../shared/utils/errors');

/**
 * Модель для управления пользовательскими блюдами из калькулятора себестоимости
 */
class CustomDishesModel extends BaseModel {
    constructor() {
        super('custom_dishes', ['name', 'description']);
    }

    /**
     * Создать новое пользовательское блюдо
     * @param {Object} data - Данные блюда
     * @param {number} data.user_id - ID пользователя
     * @param {string} data.name - Название блюда
     * @param {string} data.description - Описание
     * @param {number} data.portions - Количество порций
     * @param {Array} data.ingredients - Массив ингредиентов [{name, weight, unit, pricePerUnit}]
     * @param {number} data.cost_per_portion - Стоимость за порцию
     * @param {number} data.total_cost - Общая стоимость
     */
    async create(data) {
        const { user_id, name, description, portions, ingredients, cost_per_portion, total_cost } = data;

        // Валидация
        if (!user_id || !name || !ingredients || ingredients.length === 0) {
            throw new ValidationError('Missing required fields: user_id, name, ingredients');
        }

        if (!cost_per_portion || !total_cost) {
            throw new ValidationError('Missing required fields: cost_per_portion, total_cost');
        }

        // Преобразуем массив ингредиентов в JSON строку
        const ingredientsJson = JSON.stringify(ingredients);

        const result = await this.db.run(
            `INSERT INTO custom_dishes (user_id, name, description, portions, ingredients_json, cost_per_portion, total_cost)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, description || '', portions || 1, ingredientsJson, cost_per_portion, total_cost]
        );

        return await this.getById(result.lastInsertRowid);
    }

    /**
     * Получить блюдо по ID с распарсенными ингредиентами
     */
    async getById(id) {
        const dish = await super.getById(id);

        // Парсим JSON с ингредиентами
        if (dish.ingredients_json) {
            try {
                dish.ingredients = JSON.parse(dish.ingredients_json);
            } catch (e) {
                dish.ingredients = [];
            }
        } else {
            dish.ingredients = [];
        }

        return dish;
    }

    /**
     * Получить все блюда пользователя
     * @param {number} userId - ID пользователя
     */
    async getByUserId(userId) {
        const dishes = await this.db.all(
            `SELECT * FROM custom_dishes WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        // Парсим ингредиенты для каждого блюда
        return dishes.map(dish => {
            try {
                dish.ingredients = dish.ingredients_json ? JSON.parse(dish.ingredients_json) : [];
            } catch (e) {
                dish.ingredients = [];
            }
            return dish;
        });
    }

    /**
     * Обновить блюдо
     * @param {number} id - ID блюда
     * @param {Object} data - Данные для обновления
     */
    async update(id, data) {
        // Проверяем существование
        await this.getById(id);

        const { name, description, portions, ingredients, cost_per_portion, total_cost } = data;

        // Формируем запрос на обновление только переданных полей
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (portions !== undefined) {
            updates.push('portions = ?');
            values.push(portions);
        }
        if (ingredients !== undefined) {
            updates.push('ingredients_json = ?');
            values.push(JSON.stringify(ingredients));
        }
        if (cost_per_portion !== undefined) {
            updates.push('cost_per_portion = ?');
            values.push(cost_per_portion);
        }
        if (total_cost !== undefined) {
            updates.push('total_cost = ?');
            values.push(total_cost);
        }

        if (updates.length === 0) {
            throw new ValidationError('No fields to update');
        }

        // Добавляем updated_at
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await this.db.run(
            `UPDATE custom_dishes SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return await this.getById(id);
    }

    /**
     * Удалить блюдо пользователя
     * @param {number} id - ID блюда
     * @param {number} userId - ID пользователя (для проверки владельца)
     */
    async deleteByUser(id, userId) {
        const result = await this.db.run(
            `DELETE FROM custom_dishes WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        if (result.changes === 0) {
            throw new NotFoundError(`Custom dish with id ${id} not found or access denied`);
        }

        return result;
    }

    /**
     * Поиск блюд пользователя по запросу
     * @param {number} userId - ID пользователя
     * @param {string} query - Поисковый запрос
     */
    async searchByUser(userId, query) {
        const searchPattern = `%${query}%`;

        const dishes = await this.db.all(
            `SELECT * FROM custom_dishes 
             WHERE user_id = ? AND (name LIKE ? OR description LIKE ?)
             ORDER BY created_at DESC`,
            [userId, searchPattern, searchPattern]
        );

        // Парсим ингредиенты для каждого блюда
        return dishes.map(dish => {
            try {
                dish.ingredients = dish.ingredients_json ? JSON.parse(dish.ingredients_json) : [];
            } catch (e) {
                dish.ingredients = [];
            }
            return dish;
        });
    }

    /**
     * Получить ID владельца блюда
     * @param {number} dishId - ID блюда
     * @returns {number|null} - ID владельца или null если не найдено
     */
    async getOwnerId(dishId) {
        const dish = await this.db.get(
            `SELECT user_id FROM custom_dishes WHERE id = ?`,
            [dishId]
        );
        return dish ? dish.user_id : null;
    }
}

module.exports = new CustomDishesModel();
