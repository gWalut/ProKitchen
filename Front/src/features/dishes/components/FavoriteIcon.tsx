import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface FavoriteIconProps {
    isFavorite: boolean;
    onClick: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export const FavoriteIcon = ({ isFavorite, onClick, size = 'md' }: FavoriteIconProps) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const Icon = isFavorite ? StarSolid : StarOutline;

    return (
        <button
            onClick={onClick}
            className={`
        text-yellow-400 hover:text-yellow-500 focus:outline-none
        transition-colors duration-200
      `}
        >
            <Icon className={sizes[size]} />
            <span className="sr-only">
                {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            </span>
        </button>
    );
};