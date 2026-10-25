interface DishCardProps {
    name: string;
    cost: number;
    portions: number;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
    onClick?: () => void;
}

export const DishCard = ({ name, cost, portions, isFavorite = true, onFavoriteToggle, onClick }: DishCardProps) => {
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">🍲</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>Стоимость: <span className="font-medium text-brand-600 dark:text-brand-400">{cost} руб</span></p>
                            <p>Порций: <span className="font-medium">{portions}</span></p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle?.();
                    }}
                    className="text-2xl hover:scale-110 transition-transform"
                >
                    {isFavorite ? '⭐' : '☆'}
                </button>
            </div>
        </div>
    );
};
