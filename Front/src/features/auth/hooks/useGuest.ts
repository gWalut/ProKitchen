import { useAuth } from './useAuth';

// Хук для проверки, является ли пользователь гостем.

export const useGuest = () => {
    const { isAuthenticated } = useAuth();
    const isGuest = !isAuthenticated && localStorage.getItem('guestMode') === 'true';

    const canAccess = (requireAuth: boolean = true): boolean => {
        if (!requireAuth) return true;
        return isAuthenticated && !isGuest;
    };

    const showAuthRequiredMessage = (): string => {
        return 'Для пользования функцией авторизуйтесь в приложении';
    };

    return {
        isGuest,
        canAccess,
        showAuthRequiredMessage
    };
};
