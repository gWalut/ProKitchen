const customDishesModel = require('./custom-dishes.model');
const pdfService = require('../../shared/services/pdf.service');
const { ValidationError } = require('../../shared/utils/errors');

/**
 * Контроллер для управления пользовательскими блюдами из калькулятора себестоимости
 */
class CustomDishesController {
    /**
     * Получить все блюда текущего пользователя
     */
    async list(req, res, next) {
        try {
            const userId = req.user.id;
            const { search } = req.query;

            let dishes;
            if (search) {
                dishes = await customDishesModel.searchByUser(userId, search);
            } else {
                dishes = await customDishesModel.getByUserId(userId);
            }

            res.json({
                success: true,
                data: dishes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Получить блюдо по ID
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const dish = await customDishesModel.getById(id);

            // Проверяем, что блюдо принадлежит текущему пользователю
            if (dish.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: dish
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Создать новое блюдо
     */
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, description, portions, ingredients, cost_per_portion, total_cost } = req.body;

            // Валидация
            if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                throw new ValidationError('Name and ingredients are required');
            }

            if (!cost_per_portion || !total_cost) {
                throw new ValidationError('Cost per portion and total cost are required');
            }

            // Создаем блюдо
            const dish = await customDishesModel.create({
                user_id: userId,
                name,
                description: description || '',
                portions: portions || 1,
                ingredients,
                cost_per_portion,
                total_cost
            });

            res.status(201).json({
                success: true,
                data: dish,
                message: 'Dish created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Обновить блюдо
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { name, description, portions, ingredients, cost_per_portion, total_cost } = req.body;

            // Проверяем существование и владельца
            const existingDish = await customDishesModel.getById(id);
            if (existingDish.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Обновляем
            const updatedDish = await customDishesModel.update(id, {
                name,
                description,
                portions,
                ingredients,
                cost_per_portion,
                total_cost
            });

            res.json({
                success: true,
                data: updatedDish,
                message: 'Dish updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Удалить блюдо
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await customDishesModel.deleteByUser(id, userId);

            res.json({
                success: true,
                message: 'Dish deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Сгенерировать этикетку для блюда
     */
    async generateLabel(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { weight, manufactureDate, shelfLife } = req.query;

            // Получаем блюдо
            const dish = await customDishesModel.getById(id);

            // Проверяем владельца
            if (dish.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Валидация параметров
            if (!weight || !manufactureDate || !shelfLife) {
                throw new ValidationError('Weight, manufacture date and shelf life are required');
            }

            // Преобразуем ингредиенты в нужный формат
            const ingredients = dish.ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.weight,
                unit: ing.unit
            }));

            // Вычисляем дату истечения
            const prodDate = new Date(manufactureDate);
            const expiryDate = new Date(prodDate);
            expiryDate.setDate(expiryDate.getDate() + parseInt(shelfLife));

            // Данные для этикетки
            const labelData = {
                dishName: dish.name,
                portions: dish.portions,
                portionWeight: Math.round(parseInt(weight) / dish.portions), // Вес одной порции
                cookingTime: 0, // Для пользовательских блюд время не задано
                ingredients: ingredients,
                weight: parseInt(weight),
                prepDate: manufactureDate,
                expiryDate: expiryDate.toISOString().split('T')[0],
                nutrition: {
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0
                },
                allergens: [],
                storageConditions: 'Хранить при температуре 2-6°C'
            };

            // Генерируем PDF
            const pdfBuffer = await pdfService.generateLabel(labelData);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="custom-dish-${id}-label.pdf"`
            });

            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CustomDishesController();
