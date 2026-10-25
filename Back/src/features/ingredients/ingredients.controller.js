const ingredientsModel = require('./ingredients.model');
const allergensModel = require('../allergens/allergens.model');
const actionsService = require('../action-logs/actions.service');
const { NotFoundError } = require('../../shared/utils/errors');

class IngredientsController {
    async list(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const ingredients = await ingredientsModel.list(limit, offset);
            const total = await ingredientsModel.count();

            res.json({
                data: ingredients,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const ingredient = await ingredientsModel.getById(id);

            // Получаем связанные аллергены
            const allergens = await allergensModel.getIngredientAllergens(id);
            ingredient.allergens = allergens;

            res.json({ data: ingredient });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const ingredientData = req.body;
            const { allergens, ...data } = ingredientData;

            // Создаем ингредиент
            const id = await ingredientsModel.create(data);

            // Добавляем аллергены если есть
            if (allergens && allergens.length > 0) {
                for (const allergenId of allergens) {
                    await allergensModel.addIngredientAllergen(id, allergenId);
                }
            }

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'CREATE',
                entityType: 'INGREDIENT',
                entityId: id,
                details: data
            });

            res.status(201).json({
                message: 'Ингредиент создан',
                data: { id }
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            await ingredientsModel.update(id, updateData);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'UPDATE',
                entityType: 'INGREDIENT',
                entityId: id,
                details: updateData
            });

            res.json({
                message: 'Ингредиент обновлен'
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await ingredientsModel.delete(id);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'DELETE',
                entityType: 'INGREDIENT',
                entityId: id
            });

            res.json({
                message: 'Ингредиент удален'
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStock(req, res, next) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            await ingredientsModel.updateStockQuantity(id, quantity);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'UPDATE_STOCK',
                entityType: 'INGREDIENT',
                entityId: id,
                details: { quantity }
            });

            res.json({
                message: 'Количество обновлено'
            });
        } catch (error) {
            next(error);
        }
    }

    async getLowStock(req, res, next) {
        try {
            const ingredients = await ingredientsModel.getLowStockIngredients();
            res.json({ data: ingredients });
        } catch (error) {
            next(error);
        }
    }

    async search(req, res, next) {
        try {
            const { query = '', limit = 20 } = req.query;

            if (!query || query.length < 2) {
                return res.json({
                    data: { items: [], total: 0 },
                    message: 'Запрос должен содержать минимум 2 символа'
                });
            }

            const ingredients = await ingredientsModel.search(query, limit);

            res.json({
                data: {
                    items: ingredients,
                    total: ingredients.length
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new IngredientsController();