const authService = require('./auth.service');
const actionsService = require('../action-logs/actions.service');
const { ValidationError } = require('../../shared/utils/errors');

class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);

            res.status(201).json({
                message: 'Регистрация успешна',
                data: { user: result.user,
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.json({
                message: 'Вход выполнен успешно',
                data: { user: result.user,
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refresh(refreshToken);

            res.json({
                message: 'Токены обновлены',
                data: { user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new ValidationError('Refresh token обязателен');
            }

            await authService.revokeRefresh(refreshToken);
            await actionsService.log({
                userId: req.user.id,
                actionType: 'LOGOUT',
                entityType: 'USER',
                entityId: req.user.id
            });

            res.json({
                message: 'Выход выполнен успешно'
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const result = await authService.changePassword(userId, currentPassword, newPassword);

            res.json({
                message: 'Пароль успешно изменен',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
