import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IngredientAutocomplete } from './IngredientAutocomplete';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Input } from '@/shared/components/ui/Input';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    price_per_unit: number;
}

interface IngredientRow {
    id?: number;
    ingredient?: Ingredient;
    quantity: number;
    unitPrice: number;
    cost?: number;
}

interface IngredientsTableProps {
    rows: IngredientRow[];
    onChangeRows: (rows: IngredientRow[]) => void;
    onAddRow: () => void;
    onRemoveRow: (index: number) => void;
}

export const IngredientsTable = ({
    rows,
    onChangeRows,
    onAddRow,
    onRemoveRow
}: IngredientsTableProps) => {
    const handleUpdateRow = (index: number, updates: Partial<IngredientRow>) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], ...updates };

        // Автоматически обновляем стоимость
        if (newRows[index].quantity && newRows[index].unitPrice) {
            newRows[index].cost = newRows[index].quantity * newRows[index].unitPrice;
        }

        onChangeRows(newRows);
    };

    const handleSelectIngredient = (index: number, ingredient: Ingredient) => {
        handleUpdateRow(index, {
            ingredient,
            unitPrice: ingredient.price_per_unit
        });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                    <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3">Ингредиент</th>
                            <th className="px-4 py-3 w-28">Кол-во</th>
                            <th className="px-4 py-3 w-32">Цена/ед.</th>
                            <th className="px-4 py-3 w-32">Стоимость</th>
                            <th className="px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2">
                                    <IngredientAutocomplete
                                        value={row.ingredient?.name || ''}
                                        onChange={() => { }} // Изменения только через onSelect
                                        onSelect={(ingredient) =>
                                            handleSelectIngredient(index, ingredient)
                                        }
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center space-x-1">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={row.quantity || ''}
                                            onChange={(e) =>
                                                handleUpdateRow(index, {
                                                    quantity: parseFloat(e.target.value) || 0
                                                })
                                            }
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {row.ingredient?.unit}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center space-x-1">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={row.unitPrice || ''}
                                            onChange={(e) =>
                                                handleUpdateRow(index, {
                                                    unitPrice: parseFloat(e.target.value) || 0
                                                })
                                            }
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ₽
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                        {row.cost ? `${row.cost.toFixed(2)} ₽` : '-'}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <IconButton
                                        variant="danger"
                                        onClick={() => onRemoveRow(index)}
                                        aria-label="Удалить ингредиент"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center">
                <IconButton
                    onClick={onAddRow}
                    variant="primary"
                    aria-label="Добавить ингредиент"
                >
                    <PlusIcon className="h-5 w-5" />
                </IconButton>
            </div>
        </div>
    );
};