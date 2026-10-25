const { AuthenticationError } = require('../../shared/utils/errors');
const authService = require('./auth.service');
const logger = require('../../shared/utils/logger');

/**
 * Middleware для проверки JWT токена и добавления информации о пользователе в запрос
 */
const authMiddleware = (options = { optional: false }) => {
    return (req, res, next) => {
        try {
            // Получаем заголовок авторизации
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                if (options.optional) {
                    return next();
                }
                throw new AuthenticationError('Отсутствует токен авторизации');
            }

            // Проверяем формат токена
            const [type, token] = authHeader.split(' ');
            if (type !== 'Bearer' || !token) {
                throw new AuthenticationError('Неверный формат токена');
            }

            try {
                // Верифицируем токен
                const decoded = authService.verifyAccessToken(token);

                // Добавляем информацию о пользователе в запрос
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                    role: decoded.role
                };

                next();
            } catch (error) {
                logger.debug('Token verification failed:', error);
                throw new AuthenticationError('Недействительный токен');
            }
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authMiddleware;