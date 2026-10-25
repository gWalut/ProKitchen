const Joi = require('joi');

// Общие схемы для ID и пагинации
const idSchema = Joi.number().integer().positive().required();

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});

// Схемы ингредиентов
const createIngredientSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow('', null),
    unit: Joi.string().valid('г', 'кг', 'мл', 'л', 'шт', 'уп').required(),
    price_per_unit: Joi.number().positive().required(),
    calories_per_unit: Joi.number().integer().min(0).allow(null),
    stock_quantity: Joi.number().min(0).default(0),
    minimum_stock_level: Joi.number().min(0).default(0),
    allergens: Joi.array().items(Joi.number().integer().positive())
});

const updateIngredientSchema = createIngredientSchema.fork(
    ['name', 'unit', 'price_per_unit'],
    (schema) => schema.optional()
);

const updateStockSchema = Joi.object({
    quantity: Joi.number().min(0).required()
});

module.exports = {
    idSchema,
    paginationSchema,
    createIngredientSchema,
    updateIngredientSchema,
    updateStockSchema
};