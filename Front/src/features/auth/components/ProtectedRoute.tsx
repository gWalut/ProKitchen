import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole, UserRole } from '../hooks/useRole';

interface ProtectedRouteProps {
    // Контент, который будет показан если доступ разрешен
    children: ReactNode;

    // Требуемые роли для доступа (опционально)
    // Если не указаны, достаточно быть авторизованным
    requiredRoles?: UserRole[];

    // Путь для редиректа если пользователь не авторизован
    redirectTo?: string;

    // Путь для редиректа если у пользователя недостаточно прав
    forbiddenRedirect?: string;
}

// Компонент для защиты маршрутов на основе аутентификации и ролей
export const ProtectedRoute = ({
    children,
    requiredRoles,
    redirectTo = '/login',
    forbiddenRedirect = '/main'
}: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();
    const { canAccess } = useRole();

    // Проверка аутентификации
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Проверка ролей (если указаны)
    if (requiredRoles && !canAccess(requiredRoles)) {
        return <Navigate to={forbiddenRedirect} replace />;
    }

    return <>{children}</>;
};
