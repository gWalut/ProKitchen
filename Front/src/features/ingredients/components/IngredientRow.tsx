import React from 'react';
import { Input } from '@/shared/components/Input';

interface IngredientRowProps {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    onQuantityChange: (value: number) => void;
    onUnitPriceChange: (value: number) => void;
    onDelete: () => void;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
    name,
    quantity,
    unitPrice,
    total,
    onQuantityChange,
    onUnitPriceChange,
    onDelete,
}) => {
    return (
        <div className="flex items-center space-x-4 py-2">
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{name}</span>
            </div>
            <div className="w-24">
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.1}
                    aria-label="Количество"
                    className="text-right"
                />
            </div>
            <div className="w-24">
                <Input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => onUnitPriceChange(parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                    aria-label="Цена за единицу"
                    className="text-right"
                />
            </div>
            <div className="w-24 text-right font-medium">
                {total.toFixed(2)} ₽
            </div>
            <button
                type="button"
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Удалить ингредиент"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </button>
        </div>
    );
};

export default IngredientRow;