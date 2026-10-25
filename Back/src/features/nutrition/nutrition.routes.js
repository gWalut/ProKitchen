const express = require('express');
const router = express.Router();
const nutritionService = require('./nutrition.service');

/**
 * GET /api/v1/nutrition/ingredient?name=<название>
 * Возвращает нутритивные данные ингредиента на 100 г.
 *
 * Ответ 200:
 *   { data: { id, name, calories, protein, fat, carbohydrates, fiber, sugar, unit, image } }
 *
 * Ответ 503 (API недоступен / нет ключа):
 *   { error: 'ServiceUnavailable', message: '...' }
 *
 * Ответ 404 (ингредиент не найден):
 *   { error: 'NotFound', message: '...' }
 */
router.get('/ingredient', async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({
                error: 'BadRequest',
                message: 'Параметр name обязателен и должен содержать минимум 2 символа',
            });
        }

        // Ключ не задан — сразу сообщаем об этом клиенту
        if (!process.env.SPOONACULAR_API_KEY) {
            return res.status(503).json({
                error: 'ServiceUnavailable',
                message: 'Сервис питательных данных временно недоступен',
                available: false,
            });
        }

        const nutrition = await nutritionService.getNutritionByName(name.trim());

        if (!nutrition) {
            return res.status(404).json({
                error: 'NotFound',
                message: `Нутритивные данные для «${name}» не найдены`,
                available: true,
            });
        }

        res.json({ data: nutrition });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/v1/nutrition/bulk
 * Тело: { names: string[] }  (макс. 10 ингредиентов за раз)
 * Возвращает массив нутритивных данных (null для ненайденных).
 */
router.post('/bulk', async (req, res, next) => {
    try {
        const { names } = req.body;

        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({
                error: 'BadRequest',
                message: 'Поле names должно быть непустым массивом строк',
            });
        }

        if (names.length > 10) {
            return res.status(400).json({
                error: 'BadRequest',
                message: 'Максимум 10 ингредиентов за один запрос',
            });
        }

        if (!process.env.SPOONACULAR_API_KEY) {
            return res.status(503).json({
                error: 'ServiceUnavailable',
                message: 'Сервис питательных данных временно недоступен',
                available: false,
                data: names.map(() => null),
            });
        }

        const results = await nutritionService.getBulkNutrition(names);

        res.json({
            data: results,
            available: true,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
