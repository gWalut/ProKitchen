const usersModel = require('../auth/users.model');
const { ValidationError } = require('../../shared/utils/errors');

class AdminService {
    /**
     * Получение списка всех пользователей
     */
    async getAllUsers() {
        const users = await usersModel.getAll();

        // Убираем пароли из ответа
        return users.map(user => ({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        }));
    }

    /**
     * Получение пользователя по ID
     */
    async getUserById(userId) {
        const user = await usersModel.getById(userId);

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }

    /**
     * Изменение роли пользователя
     */
    async updateUserRole(userId, newRole) {
        // Проверяем, существует ли роль
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(newRole)) {
            throw new ValidationError(`Недопустимая роль. Разрешенные роли: ${validRoles.join(', ')}`);
        }

        const user = await usersModel.getById(userId);
        if (!user) {
            return null;
        }

        await usersModel.updateRole(userId, newRole);

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: newRole
        };
    }

    /**
     * Изменение пароля пользователя админом
     */
    async updateUserPassword(userId, newPassword) {
        const user = await usersModel.getById(userId);
        if (!user) {
            return null;
        }

        // Хешируем новый пароль
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль
        await usersModel.updatePassword(userId, hashedPassword);

        return true;
    }

    /**
     * Изменение данных пользователя (имя и/или пароль)
     */
    async updateUserData(userId, data) {
        const user = await usersModel.getById(userId);
        if (!user) {
            return null;
        }

        const updates = {};

        // Обновляем имя, если передано
        if (data.fullName !== undefined) {
            const trimmedName = data.fullName.trim();
            if (trimmedName.length === 0) {
                throw new ValidationError('Имя пользователя не может быть пустым');
            }
            if (trimmedName.length > 100) {
                throw new ValidationError('Имя пользователя слишком длинное (максимум 100 символов)');
            }
            updates.full_name = trimmedName;
        }

        // Обновляем пароль, если передан
        if (data.newPassword) {
            const bcrypt = require('bcryptjs');
            updates.password_hash = await bcrypt.hash(data.newPassword, 10);
        }

        // Выполняем обновление
        if (Object.keys(updates).length > 0) {
            await usersModel.partialUpdate(userId, updates);
        }

        // Возвращаем обновленные данные пользователя
        const updatedUser = await usersModel.getById(userId);
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.full_name,
            role: updatedUser.role,
            createdAt: updatedUser.created_at,
            updatedAt: updatedUser.updated_at
        };
    }

    /**
     * Удаление пользователя
     */
    async deleteUser(userId) {
        const user = await usersModel.getById(userId);
        if (!user) {
            return null;
        }

        await usersModel.delete(userId);
        return true;
    }

    /**
     * Получение статистики пользователей
     */
    async getUsersStats() {
        const users = await usersModel.getAll();

        const stats = {
            total: users.length,
            byRole: {
                admin: users.filter(u => u.role === 'admin').length,
                user: users.filter(u => u.role === 'user').length
            },
            recentRegistrations: users
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map(u => ({
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    createdAt: u.created_at
                }))
        };

        return stats;
    }
}

module.exports = new AdminService();
