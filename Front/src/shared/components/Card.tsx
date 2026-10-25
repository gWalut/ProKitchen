import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export const Card = ({ children, className = '', hover = false, gradient = false, onClick }: CardProps) => {
    const baseClasses = 'rounded-2xl shadow-xl border transition-all duration-300';

    const backgroundClasses = gradient
        ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200/50 dark:border-gray-700/50'
        : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50';

    const hoverClasses = hover
        ? 'hover:shadow-2xl hover:scale-105 hover:-translate-y-1 cursor-pointer'
        : '';

    const clickableClasses = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${baseClasses} ${backgroundClasses} ${hoverClasses} ${clickableClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
    return (
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
};

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
    return (
        <div className={`p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl ${className}`}>
            {children}
        </div>
    );
};

export default Card;
