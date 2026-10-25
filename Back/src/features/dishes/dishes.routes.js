const express = require('express');
const router = express.Router();
const Joi = require('joi');
const dishesController = require('./dishes.controller');
const authMiddleware = require('../auth/auth.middleware');
const { checkRole, checkOwnership } = require('../../shared/middleware/rbac.middleware');
const validate = require('../../shared/middleware/validate');
const {
    createDishSchema,
    updateDishSchema,
    searchDishesSchema
} = require('./dishes.validators');
const { idSchema } = require('../ingredients/ingredients.validators');
const dishesModel = require('./dishes.model');

// Функция для получения владельца блюда
const getDishOwnerId = async (req) => {
    const dishId = parseInt(req.params.id);
    return await dishesModel.getOwnerId(dishId);
};

// GET /dishes/favorites - Получение избранных блюд (должно быть ПЕРЕД /dishes/:id)
router.get('/favorites',
    authMiddleware({ optional: false }),
    dishesController.getFavorites
);

// GET /dishes/search/by-name - Поиск блюда по точному названию
router.get('/search/by-name',
    authMiddleware({ optional: true }),
    dishesController.searchByName
);

// GET /dishes - Получение списка блюд
router.get('/',
    authMiddleware({ optional: true }),
    validate(searchDishesSchema, 'query'),
    dishesController.list
);

// GET /dishes/:id - Получение блюда по ID
router.get('/:id',
    authMiddleware({ optional: true }),
    validate({ id: idSchema }, 'params'),
    dishesController.getById
);

// POST /dishes - Создание нового блюда
router.post('/',
    authMiddleware(),
    validate(createDishSchema),
    dishesController.create
);

// PUT /dishes/:id - Обновление блюда (владелец или admin)
router.put('/:id',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    validate(updateDishSchema),
    checkOwnership(getDishOwnerId),
    dishesController.update
);

// DELETE /dishes/:id - Удаление блюда (владелец или admin)
router.delete('/:id',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    checkOwnership(getDishOwnerId),
    dishesController.delete
);

// GET /dishes/:id/cost - Расчет стоимости блюда
router.get('/:id/cost',
    authMiddleware({ optional: true }),
    validate({ id: idSchema }, 'params'),
    validate({ portions: Joi.number().integer().min(1).required() }, 'query'),
    dishesController.calculateCost
);

// GET /dishes/:id/label - Генерация этикетки
router.get('/:id/label',
    authMiddleware({ optional: true }),
    validate({ id: idSchema }, 'params'),
    dishesController.generateLabel
);

// POST /dishes/:id/favorite - Добавить в избранное
router.post('/:id/favorite',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    dishesController.addToFavorites
);

// DELETE /dishes/:id/favorite - Удалить из избранного
router.delete('/:id/favorite',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    dishesController.removeFromFavorites
);

module.exports = router;