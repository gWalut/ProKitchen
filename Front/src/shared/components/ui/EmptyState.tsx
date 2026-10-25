import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export const EmptyState = ({
    title,
    description,
    icon,
    action,
    className
}: EmptyStateProps) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center p-8 text-center',
                className
            )}
            role="status"
            aria-label={title}
        >
            {icon && (
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            )}

            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h3>

            {description && (
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
};