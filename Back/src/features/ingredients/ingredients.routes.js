const express = require('express');
const router = express.Router();
const ingredientsController = require('./ingredients.controller');
const authMiddleware = require('../auth/auth.middleware');
const { checkRole } = require('../../shared/middleware/rbac.middleware');
const validate = require('../../shared/middleware/validate');
const {
    createIngredientSchema,
    updateIngredientSchema,
    updateStockSchema,
    idSchema,
    paginationSchema
} = require('./ingredients.validators');

// GET /ingredients - Получение списка ингредиентов
router.get('/',
    authMiddleware(),
    validate(paginationSchema, 'query'),
    ingredientsController.list
);

// GET /ingredients/low-stock - Получение ингредиентов с низким запасом
router.get('/low-stock',
    authMiddleware(),
    ingredientsController.getLowStock
);

// GET /ingredients/search - Поиск ингредиентов
router.get('/search',
    authMiddleware(),
    ingredientsController.search
);

// GET /ingredients/:id - Получение ингредиента по ID
router.get('/:id',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    ingredientsController.getById
);

// POST /ingredients - Создание нового ингредиента
router.post('/',
    authMiddleware(),
    validate(createIngredientSchema),
    ingredientsController.create
);

// PUT /ingredients/:id - Обновление ингредиента
router.put('/:id',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    validate(updateIngredientSchema),
    ingredientsController.update
);

// PATCH /ingredients/:id/stock - Обновление количества на складе
router.patch('/:id/stock',
    authMiddleware(),
    validate({ id: idSchema }, 'params'),
    validate(updateStockSchema),
    ingredientsController.updateStock
);

// DELETE /ingredients/:id - Удаление ингредиента (только admin)
router.delete('/:id',
    authMiddleware(),
    checkRole(['admin']),
    validate({ id: idSchema }, 'params'),
    ingredientsController.delete
);

module.exports = router;