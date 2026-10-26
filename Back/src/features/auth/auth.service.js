const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../../config/config');
const { AuthenticationError } = require('../../shared/utils/errors');
const usersModel = require('./users.model');
const refreshTokensModel = require('./refresh-tokens.model');
const actionsService = require('../action-logs/actions.service');

class AuthService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    // Генерация токенов
    async generateTokens(user) {
        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            config.JWT_SECRET,
            { expiresIn: config.ACCESS_TOKEN_TTL }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней для refresh токена

        // Сохраняем refresh токен
        await refreshTokensModel.create({
            user_id: user.id,
            token: refreshToken,
            expires_at: expiresAt.toISOString()
        });

        return {
            accessToken,
            refreshToken,
            expiresAt
        };
    }

    // Регистрация нового пользователя
    async register(userData) {
        const existingUser = await usersModel.getByEmail(userData.email);
        if (existingUser) {
            throw new AuthenticationError('Пользователь с таким email уже существует');
        }

        // Хешируем пароль
        const passwordHash = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

        // Создаем пользователя
        const fullName = userData.email.split('@')[0];
        const userId = await usersModel.create({
            email: userData.email,
            password_hash: passwordHash,
            full_name: fullName,
            role: 'user'
        });
        const user = {
            id: userId,
            email: userData.email,
            full_name: fullName,
            role: 'user'
        };

        try {
            await actionsService.log({
                userId,
                actionType: 'REGISTER',
                entityType: 'USER',
                entityId: userId
            });
        } catch (logError) {
            console.warn('Failed to log registration action:', logError.message);
        }

        // Генерируем токены и возвращаем с информацией о пользователе
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name, role: user.role
            }
        };
    }

    // Аутентификация пользователя
    async login(email, password) {
        const user = await usersModel.getByEmail(email);
        if (!user) {
            throw new AuthenticationError('Неверный email или пароль');
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new AuthenticationError('Неверный email или пароль');
        }

        // Логируем успешный вход (не критично, если не получится)
        try {
            await actionsService.log({
                userId: user.id,
                actionType: 'LOGIN',
                entityType: 'USER',
                entityId: user.id
            });
        } catch (logError) {
            console.warn('Failed to log login action:', logError.message);
        }

        // Генерируем токены и возвращаем с информацией о пользователе
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name, role: user.role
            }
        };
    }

    // Обновление токенов (rotation)
    async refresh(oldRefreshToken) {
        // Находим и проверяем refresh токен
        const tokenData = await refreshTokensModel.findValidToken(oldRefreshToken);
        if (!tokenData) {
            throw new AuthenticationError('Invalid refresh token');
        }

        // Удаляем использованный refresh токен
        await refreshTokensModel.deleteToken(oldRefreshToken);

        // Генерируем новые токены
        const user = await usersModel.getById(tokenData.user_id);
        const tokens = await this.generateTokens(user); return { ...tokens, user: { id: user.id, email: user.email, name: user.full_name, role: user.role } };
    }

    // Отзыв refresh токена
    async revokeRefresh(token) {
        const result = await refreshTokensModel.deleteToken(token);
        return result.changes > 0;
    }

    // Отзыв всех refresh токенов пользователя
    async revokeAllUserTokens(userId) {
        return refreshTokensModel.deleteUserTokens(userId);
    }

    // Верификация access токена
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, config.JWT_SECRET);
        } catch (error) {
            throw new AuthenticationError('Invalid access token');
        }
    }

    // Смена пароля
    async changePassword(userId, currentPassword, newPassword) {
        // Получаем пользователя
        const user = await usersModel.getById(userId);
        if (!user) {
            throw new AuthenticationError('Пользователь не найден');
        }

        // Проверяем текущий пароль
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new AuthenticationError('Неверный текущий пароль');
        }

        // Хешируем новый пароль
        const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

        // Обновляем пароль
        await usersModel.updatePassword(userId, newPasswordHash);

        // Логируем действие (не критично, если не получится)
        try {
            await actionsService.log({
                userId,
                actionType: 'CHANGE_PASSWORD',
                entityType: 'USER',
                entityId: userId
            });
        } catch (logError) {
            console.warn('Failed to log password change action:', logError.message);
        }

        // Отзываем все refresh токены пользователя для безопасности
        await this.revokeAllUserTokens(userId);

        return { success: true };
    }
}

module.exports = new AuthService();
