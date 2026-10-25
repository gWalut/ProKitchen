const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../auth/auth.middleware');
const { checkRole } = require('../../shared/middleware/rbac.middleware');
const validate = require('../../shared/middleware/validate');
const Joi = require('joi');

// Все роуты требуют аутентификации и роли admin
router.use(authMiddleware());
router.use(checkRole(['admin']));

// Схемы валидации
const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

const updateRoleSchema = Joi.object({
    role: Joi.string().valid('user', 'admin').required()
});

const updatePasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required()
});

const updateUserDataSchema = Joi.object({
    fullName: Joi.string().min(1).max(100),
    newPassword: Joi.string().min(6)
}).or('fullName', 'newPassword'); // Хотя бы одно поле должно быть

// GET /admin/users - Получение списка всех пользователей
router.get('/users',
    adminController.getAllUsers
);

// GET /admin/users/:id - Получение пользователя по ID
router.get('/users/:id',
    validate(idSchema, 'params'),
    adminController.getUserById
);

// PATCH /admin/users/:id/role - Изменение роли пользователя
router.patch('/users/:id/role',
    validate(idSchema, 'params'),
    validate(updateRoleSchema),
    adminController.updateUserRole
);

// PATCH /admin/users/:id/password - Изменение пароля пользователя админом
router.patch('/users/:id/password',
    validate(idSchema, 'params'),
    validate(updatePasswordSchema),
    adminController.updateUserPassword
);

// PATCH /admin/users/:id - Изменение данных пользователя (имя и/или пароль)
router.patch('/users/:id',
    validate(idSchema, 'params'),
    validate(updateUserDataSchema),
    adminController.updateUserData
);

// DELETE /admin/users/:id - Удаление пользователя
router.delete('/users/:id',
    validate(idSchema, 'params'),
    adminController.deleteUser
);

// GET /admin/stats/users - Статистика пользователей
router.get('/stats/users',
    adminController.getUsersStats
);

module.exports = router;
