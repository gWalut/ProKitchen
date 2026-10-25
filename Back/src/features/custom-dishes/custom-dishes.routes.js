const express = require('express');
const router = express.Router();
const Joi = require('joi');
const customDishesController = require('./custom-dishes.controller');
const authMiddleware = require('../auth/auth.middleware');
const { checkOwnership } = require('../../shared/middleware/rbac.middleware');
const validate = require('../../shared/middleware/validate');
const customDishesModel = require('./custom-dishes.model');

// Функция для получения владельца custom dish
const getCustomDishOwnerId = async (req) => {
    const dishId = parseInt(req.params.id);
    return await customDishesModel.getOwnerId(dishId);
};

// Схемы валидации
const ingredientSchema = Joi.object({
    id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    weight: Joi.number().min(0).required(),
    unit: Joi.string().required(),
    pricePerUnit: Joi.number().min(0).required()
});

const createCustomDishSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().allow('').optional(),
    portions: Joi.number().integer().min(1).default(1),
    ingredients: Joi.array().items(ingredientSchema).min(1).required(),
    cost_per_portion: Joi.number().min(0).required(),
    total_cost: Joi.number().min(0).required()
});

const updateCustomDishSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().allow('').optional(),
    portions: Joi.number().integer().min(1).optional(),
    ingredients: Joi.array().items(ingredientSchema).min(1).optional(),
    cost_per_portion: Joi.number().min(0).optional(),
    total_cost: Joi.number().min(0).optional()
}).min(1);

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

const searchSchema = Joi.object({
    search: Joi.string().optional()
});

const labelQuerySchema = Joi.object({
    weight: Joi.number().integer().min(1).required(),
    manufactureDate: Joi.string().isoDate().required(),
    shelfLife: Joi.number().integer().min(1).required()
});

// GET /custom-dishes - Получение всех блюд пользователя
router.get('/',
    authMiddleware(),
    validate(searchSchema, 'query'),
    customDishesController.list
);

// GET /custom-dishes/:id - Получение блюда по ID
router.get('/:id',
    authMiddleware(),
    validate(idSchema, 'params'),
    customDishesController.getById
);

// GET /custom-dishes/:id/label - Генерация этикетки для блюда
router.get('/:id/label',
    authMiddleware(),
    validate(idSchema, 'params'),
    validate(labelQuerySchema, 'query'),
    customDishesController.generateLabel
);

// POST /custom-dishes - Создание нового блюда
router.post('/',
    authMiddleware(),
    validate(createCustomDishSchema),
    customDishesController.create
);

// PUT /custom-dishes/:id - Обновление блюда (только владелец или admin)
router.put('/:id',
    authMiddleware(),
    validate(idSchema, 'params'),
    validate(updateCustomDishSchema),
    checkOwnership(getCustomDishOwnerId),
    customDishesController.update
);

// DELETE /custom-dishes/:id - Удаление блюда (только владелец или admin)
router.delete('/:id',
    authMiddleware(),
    validate(idSchema, 'params'),
    checkOwnership(getCustomDishOwnerId),
    customDishesController.delete
);

module.exports = router;
