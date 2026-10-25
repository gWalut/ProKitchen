import React from 'react';

interface AllergenBadgeProps {
    name: string;
    className?: string;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({ name, className }) => {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-brand-700 ${className || ''
                }`}
        >
            {name}
        </span>
    );
};

export default AllergenBadge;