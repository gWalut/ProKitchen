/**
 * RBAC Middleware - Role-Based Access Control
 * Проверка прав доступа на основе ролей пользователей
 */

/**
 * Middleware для проверки роли пользователя
 * @param {string[]} allowedRoles - Массив разрешенных ролей ['admin', 'user']
 * @returns {Function} Express middleware
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Проверяем наличие пользователя (должен быть установлен authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Требуется аутентификация'
                });
            }

            const userRole = req.user.role || 'user';

            // Проверяем, есть ли роль пользователя в списке разрешенных
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Недостаточно прав для выполнения этого действия',
                    details: {
                        requiredRole: allowedRoles,
                        currentRole: userRole
                    }
                });
            }

            // Роль подходит, продолжаем
            next();
        } catch (error) {
            console.error('Error in checkRole middleware:', error);
            return res.status(500).json({
                success: false,
                error: 'InternalServerError',
                message: 'Ошибка при проверке прав доступа'
            });
        }
    };
};

/**
 * Middleware для проверки владения ресурсом
 * Проверяет, что пользователь является владельцем ресурса или админом
 * @param {Function} getResourceOwnerId - Функция для получения ID владельца ресурса
 * @returns {Function} Express middleware
 */
const checkOwnership = (getResourceOwnerId) => {
    return async (req, res, next) => {
        try {
            // Проверяем наличие пользователя
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Требуется аутентификация'
                });
            }

            const userId = req.user.id;
            const userRole = req.user.role || 'user';

            // Админы имеют доступ ко всем ресурсам
            if (userRole === 'admin') {
                return next();
            }

            // Получаем ID владельца ресурса
            const resourceOwnerId = await getResourceOwnerId(req);

            // Если ресурс не найден
            if (resourceOwnerId === null || resourceOwnerId === undefined) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Ресурс не найден'
                });
            }

            // Проверяем владение
            if (resourceOwnerId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'У вас нет доступа к этому ресурсу'
                });
            }

            // Пользователь является владельцем
            next();
        } catch (error) {
            console.error('Error in checkOwnership middleware:', error);
            return res.status(500).json({
                success: false,
                error: 'InternalServerError',
                message: 'Ошибка при проверке владения ресурсом'
            });
        }
    };
};

/**
 * Константы для ролей
 */
const ROLES = {
    GUEST: 'guest',
    USER: 'user',
    ADMIN: 'admin'
};

/**
 * Хелпер для проверки, является ли пользователь админом
 */
const isAdmin = (user) => {
    return user && user.role === ROLES.ADMIN;
};

/**
 * Хелпер для проверки, является ли пользователь владельцем ресурса или админом
 */
const isOwnerOrAdmin = (user, resourceOwnerId) => {
    return isAdmin(user) || (user && user.id === resourceOwnerId);
};

module.exports = {
    checkRole,
    checkOwnership,
    ROLES,
    isAdmin,
    isOwnerOrAdmin
};
