const dishesModel = require('./dishes.model');
const calcService = require('../../shared/services/calc.service');
const pdfService = require('../../shared/services/pdf.service');
const actionsService = require('../action-logs/actions.service');

class DishesController {
    async list(req, res, next) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const offset = (page - 1) * limit;

            let dishes;
            let total;

            if (search) {
                // Если есть поисковый запрос
                dishes = await dishesModel.searchByName(search);
                total = dishes.length;
                // Применяем пагинацию к результатам поиска
                dishes = dishes.slice(offset, offset + parseInt(limit));
            } else {
                // Обычный список
                dishes = await dishesModel.list(limit, offset);
                total = await dishesModel.count();
            }

            res.json({
                data: dishes,
                items: dishes, // для совместимости
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
            const dish = await dishesModel.getById(id);

            // Получаем ингредиенты
            dish.ingredients = await dishesModel.getDishIngredients(id);

            res.json({ data: dish });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const dishData = {
                ...req.body,
                created_by: req.user.id
            };

            const id = await dishesModel.create(dishData);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'CREATE',
                entityType: 'DISH',
                entityId: id,
                details: dishData
            });

            res.status(201).json({
                message: 'Блюдо создано',
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

            await dishesModel.update(id, updateData);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'UPDATE',
                entityType: 'DISH',
                entityId: id,
                details: updateData
            });

            res.json({
                message: 'Блюдо обновлено'
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await dishesModel.delete(id);

            // Логируем действие
            await actionsService.log({
                userId: req.user.id,
                actionType: 'DELETE',
                entityType: 'DISH',
                entityId: id
            });

            res.json({
                message: 'Блюдо удалено'
            });
        } catch (error) {
            next(error);
        }
    }

    async calculateCost(req, res, next) {
        try {
            const { id } = req.params;
            const { portions } = req.query;

            const dish = await dishesModel.getById(id);
            dish.ingredients = await dishesModel.getDishIngredients(id);

            const calculation = calcService.calculateCost(dish, portions);

            res.json({ data: calculation });
        } catch (error) {
            next(error);
        }
    }

    async generateLabel(req, res, next) {
        try {
            const { id } = req.params;
            const dish = await dishesModel.getById(id);
            dish.ingredients = await dishesModel.getDishIngredients(id);

            const labelData = {
                dishName: dish.name,
                portions: dish.portion_size || 1,
                weight: dish.weight || 0,
                portionWeight: dish.portion_size > 0 ? Math.round((dish.weight || 0) / dish.portion_size) : 0,
                ingredients: dish.ingredients,
                // Дополнительные данные для этикетки
                prepDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // +24 часа
            };

            const pdfBuffer = await pdfService.generateLabel(labelData);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="dish-${id}-label.pdf"`
            });

            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    async addToFavorites(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const favoritesModel = require('../favorites/favorites.model');
            await favoritesModel.addFavorite(userId, id, userRole);

            res.json({ message: 'Блюдо добавлено в избранное' });
        } catch (error) {
            next(error);
        }
    }

    async removeFromFavorites(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const favoritesModel = require('../favorites/favorites.model');
            await favoritesModel.removeFavorite(userId, id, userRole);

            res.json({ message: 'Блюдо удалено из избранного' });
        } catch (error) {
            next(error);
        }
    }

    async getFavorites(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const favoritesModel = require('../favorites/favorites.model');

            const dishes = await favoritesModel.getByUser(userId, userRole);

            // Получаем ингредиенты для каждого блюда
            for (const dish of dishes) {
                dish.ingredients = await dishesModel.getDishIngredients(dish.id);
                dish.isFavorite = true;
            }

            res.json({ data: dishes });
        } catch (error) {
            next(error);
        }
    }

    async searchByName(req, res, next) {
        try {
            const { name } = req.query;

            if (!name) {
                return res.status(400).json({
                    message: 'Параметр name обязателен'
                });
            }

            // Ищем блюдо по точному совпадению
            const dish = await dishesModel.getByExactName(name);

            if (!dish) {
                return res.status(404).json({
                    message: `Блюдо "${name}" не найдено`,
                    data: null
                });
            }

            // Получаем ингредиенты с аллергенами
            dish.ingredients = await dishesModel.getDishIngredients(dish.id);

            res.json({ data: dish });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DishesController();