import React, { useState } from 'react';
import { FavoriteIcon } from './FavoriteIcon';

interface ResultCardProps {
    totalCost: number;
    costPerPortion: number;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
    breakdown?: {
        ingredients: Array<{
            name: string;
            cost: number;
        }>;
    };
}

export const ResultCard: React.FC<ResultCardProps> = ({
    totalCost,
    costPerPortion,
    isFavorite = false,
    onFavoriteToggle,
    breakdown,
}) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Результат расчета</h3>
                {onFavoriteToggle && (
                    <FavoriteIcon
                        isFavorite={isFavorite}
                        onClick={onFavoriteToggle}
                    />
                )}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Итоговая стоимость:</span>
                    <span className="font-semibold text-gray-900">{totalCost.toFixed(2)} ₽</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Стоимость за порцию:</span>
                    <span className="font-semibold text-gray-900">{costPerPortion.toFixed(2)} ₽</span>
                </div>
            </div>

            {breakdown && (
                <>
                    <button
                        type="button"
                        className="mt-4 text-sm text-brand-500 hover:text-brand-600 flex items-center"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                        <svg
                            className={`w-4 h-4 mr-1 transition-transform ${showBreakdown ? 'rotate-90' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        {showBreakdown ? 'Скрыть детали' : 'Показать детали'}
                    </button>

                    {showBreakdown && (
                        <div className="mt-4 space-y-2">
                            {breakdown.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{ingredient.name}</span>
                                    <span className="text-gray-900">{ingredient.cost.toFixed(2)} ₽</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ResultCard;