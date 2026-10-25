const { ValidationError } = require('../utils/errors');
const Joi = require('joi');

/**
 * Middleware для валидации данных запроса с помощью Joi/Zod схем
 * @param {Object} schema - Схема валидации
 * @param {string} source - Источник данных ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const data = req[source];

            if (!data) {
                throw new ValidationError(`Отсутствуют данные в ${source}`);
            }

            try {
                let validationSchema = schema;

                // Если передан обычный объект, конвертируем в Joi схему
                if (typeof schema === 'object' && !schema.validateAsync && !schema.parse) {
                    validationSchema = Joi.object(schema);
                }

                // Если используется Joi
                if (typeof validationSchema.validateAsync === 'function') {
                    const validated = await validationSchema.validateAsync(data, {
                        abortEarly: false,
                        stripUnknown: true
                    });
                    req[source] = validated;
                }
                // Если используется Zod
                else if (typeof validationSchema.parse === 'function') {
                    const validated = validationSchema.parse(data);
                    req[source] = validated;
                }
                // Если используется другая библиотека валидации
                else {
                    throw new Error('Неподдерживаемая схема валидации');
                }

                next();
            } catch (error) {
                // Обработка ошибок Joi
                if (error.details) {
                    const details = error.details.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }));
                    throw new ValidationError('Ошибка валидации', details);
                }
                // Обработка ошибок Zod
                else if (error.errors) {
                    const details = error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }));
                    throw new ValidationError('Ошибка валидации', details);
                }
                // Другие ошибки валидации
                throw new ValidationError('Ошибка валидации', error.message);
            }
        } catch (error) {
            next(error);
        }
    };
};

module.exports = validate;