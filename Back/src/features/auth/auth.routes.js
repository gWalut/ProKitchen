const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../shared/middleware/validate');
const authMiddleware = require('./auth.middleware');
const { authLimiter } = require('../../shared/middleware/rate-limiter');
const {
    loginSchema,
    registerSchema,
    refreshTokenSchema,
    changePasswordSchema
} = require('./auth.validators');

// POST /auth/register - Регистрация нового пользователя
router.post('/register',
    authLimiter,
    validate(registerSchema),
    authController.register
);

// POST /auth/login - Авторизация пользователя
router.post('/login',
    authLimiter,
    validate(loginSchema),
    authController.login
);

// POST /auth/refresh - Обновление токенов
router.post('/refresh',
    validate(refreshTokenSchema),
    authController.refresh
);

// POST /auth/logout - Выход из системы
router.post('/logout',
    authMiddleware(),
    authController.logout
);

// POST /auth/change-password - Смена пароля
router.post('/change-password',
    authMiddleware(),
    validate(changePasswordSchema),
    authController.changePassword
);

module.exports = router;