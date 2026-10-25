const Joi = require('joi');

// Схемы аутентификации
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email должен быть корректным',
        'any.required': 'Email обязателен'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Пароль обязателен'
    })
});

const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email должен быть корректным',
        'any.required': 'Email обязателен'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Пароль должен быть не менее {#limit} символов',
        'any.required': 'Пароль обязателен'
    }),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Пароли не совпадают',
        'any.required': 'Подтверждение пароля обязательно'
    }),
    acceptPrivacyPolicy: Joi.boolean().valid(true).required().messages({
        'any.only': 'Необходимо принять политику конфиденциальности',
        'any.required': 'Необходимо принять политику конфиденциальности'
    })
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token обязателен'
    })
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Текущий пароль обязателен'
    }),
    newPassword: Joi.string().min(8).required().messages({
        'string.min': 'Новый пароль должен быть не менее {#limit} символов',
        'any.required': 'Новый пароль обязателен'
    })
});

module.exports = {
    loginSchema,
    registerSchema,
    refreshTokenSchema,
    changePasswordSchema
};