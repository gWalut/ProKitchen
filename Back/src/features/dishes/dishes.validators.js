const Joi = require('joi');
const { idSchema, paginationSchema } = require('../ingredients/ingredients.validators');

// Схемы для блюд
const dishIngredientSchema = Joi.object({
    id: idSchema,
    quantity: Joi.number().positive().required()
});

const createDishSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow('', null).optional(),
    instructions: Joi.string().allow('', null).optional(),
    cooking_time: Joi.number().integer().min(1).optional(),
    difficulty_level: Joi.string().valid('easy', 'medium', 'hard').optional(),
    portion_size: Joi.number().integer().min(1).optional(),
    ingredients: Joi.array().items(dishIngredientSchema).min(1).required(),
    labels: Joi.array().items(idSchema)
});

const updateDishSchema = createDishSchema.fork(
    ['name', 'ingredients'],
    (schema) => schema.optional()
).keys({
    is_published: Joi.boolean()
});

// Схемы для поиска и фильтрации
const searchDishesSchema = paginationSchema.keys({
    query: Joi.string().min(2),
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    cooking_time_max: Joi.number().integer().min(1),
    labels: Joi.array().items(idSchema),
    sort: Joi.string().valid('name', 'cooking_time', 'created_at')
});

module.exports = {
    createDishSchema,
    updateDishSchema,
    searchDishesSchema
};