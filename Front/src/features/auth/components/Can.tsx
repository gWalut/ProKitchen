import { ReactNode } from 'react';
import { useRole, UserRole } from '../hooks/useRole';

interface CanProps {
    // Роли, которым разрешен доступ
    roles: UserRole[];

    // Контент, который будет показан если доступ разрешен
    children: ReactNode;

    // Контент, который будет показан если доступ запрещен
    fallback?: ReactNode;
}

// Компонент для условного рендеринга на основе ролей
export const Can = ({ roles, children, fallback = null }: CanProps) => {
    const { canAccess } = useRole();

    if (canAccess(roles)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
