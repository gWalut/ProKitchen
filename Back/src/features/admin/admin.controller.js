const adminService = require('./admin.service');
const actionsService = require('../action-logs/actions.service');

class AdminController {
    /**
     * GET /api/v1/admin/users
     * Получение списка всех пользователей
     */
    async getAllUsers(req, res, next) {
        try {
            const users = await adminService.getAllUsers();

            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/admin/users/:id
     * Получение пользователя по ID
     */
    async getUserById(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            const user = await adminService.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Пользователь не найден'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/admin/users/:id/role
     * Изменение роли пользователя
     */
    async updateUserRole(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Роль обязательна для указания'
                });
            }

            // Запрещаем пользователю менять свою роль
            if (userId === req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Вы не можете изменить свою собственную роль'
                });
            }

            const user = await adminService.updateUserRole(userId, role);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Пользователь не найден'
                });
            }

            // Логируем действие
            try {
                await actionsService.log({
                    userId: req.user.id,
                    actionType: 'UPDATE_USER_ROLE',
                    entityType: 'USER',
                    entityId: userId,
                    details: `Changed role to ${role}`
                });
            } catch (logError) {
                console.warn('Failed to log role update action:', logError.message);
            }

            res.json({
                success: true,
                message: 'Роль пользователя успешно изменена',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/admin/users/:id/password
     * Изменение пароля пользователя админом
     */
    async updateUserPassword(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Новый пароль обязателен для указания'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Пароль должен содержать минимум 6 символов'
                });
            }

            const result = await adminService.updateUserPassword(userId, newPassword);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Пользователь не найден'
                });
            }

            // Логируем действие
            try {
                await actionsService.log({
                    userId: req.user.id,
                    actionType: 'ADMIN_CHANGE_PASSWORD',
                    entityType: 'USER',
                    entityId: userId,
                    details: 'Admin changed user password'
                });
            } catch (logError) {
                console.warn('Failed to log password change action:', logError.message);
            }

            res.json({
                success: true,
                message: 'Пароль пользователя успешно изменен'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/admin/users/:id
     * Изменение данных пользователя (имя и/или пароль)
     */
    async updateUserData(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            const { fullName, newPassword } = req.body;

            if (!fullName && !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Необходимо указать хотя бы одно поле для обновления'
                });
            }

            if (fullName !== undefined && fullName.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Имя пользователя не может быть пустым'
                });
            }

            if (fullName && fullName.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Имя пользователя слишком длинное (максимум 100 символов)'
                });
            }

            if (newPassword && newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Пароль должен содержать минимум 6 символов'
                });
            }

            const user = await adminService.updateUserData(userId, { fullName, newPassword });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Пользователь не найден'
                });
            }

            // Логируем действие
            try {
                const changes = [];
                if (fullName) changes.push('fullName');
                if (newPassword) changes.push('password');

                await actionsService.log({
                    userId: req.user.id,
                    actionType: 'UPDATE_USER_DATA',
                    entityType: 'USER',
                    entityId: userId,
                    details: `Updated: ${changes.join(', ')}`
                });
            } catch (logError) {
                console.warn('Failed to log user data update action:', logError.message);
            }

            res.json({
                success: true,
                message: 'Данные пользователя успешно обновлены',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/admin/users/:id
     * Удаление пользователя
     */
    async deleteUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            // Запрещаем пользователю удалить самого себя
            if (userId === req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Вы не можете удалить свою собственную учетную запись'
                });
            }

            const result = await adminService.deleteUser(userId);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Пользователь не найден'
                });
            }

            // Логируем действие
            try {
                await actionsService.log({
                    userId: req.user.id,
                    actionType: 'DELETE_USER',
                    entityType: 'USER',
                    entityId: userId
                });
            } catch (logError) {
                console.warn('Failed to log user deletion action:', logError.message);
            }

            res.json({
                success: true,
                message: 'Пользователь успешно удален'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/admin/stats/users
     * Получение статистики пользователей
     */
    async getUsersStats(req, res, next) {
        try {
            const stats = await adminService.getUsersStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
