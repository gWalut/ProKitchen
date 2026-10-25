import { useAuth } from './useAuth';

export type UserRole = 'user' | 'admin';

// Хук для работы с ролями пользователя
export const useRole = () => {
    const { user } = useAuth();

    const role = user?.role || 'user';

    const isAdmin = role === 'admin';
    const isUser = role === 'user';

    // Проверка, имеет ли пользователь указанную роль
    const hasRole = (requiredRole: UserRole): boolean => {
        return role === requiredRole;
    };

    const hasAnyRole = (roles: UserRole[]): boolean => {
        return roles.includes(role);
    };

    const canAccess = (allowedRoles: UserRole[]): boolean => {
        return allowedRoles.includes(role);
    };

    return {
        role,
        isAdmin,
        isUser,
        hasRole,
        hasAnyRole,
        canAccess
    };
};
