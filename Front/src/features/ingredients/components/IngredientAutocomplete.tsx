import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/utils/cn';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    price_per_unit: number;
}

interface IngredientAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (ingredient: Ingredient) => void;
}

export const IngredientAutocomplete = ({
    value,
    onChange,
    onSelect
}: IngredientAutocompleteProps) => {
    const [query, setQuery] = useState(value);
    const debouncedQuery = useDebounce(query, 300);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchIngredients = async () => {
            if (!debouncedQuery.trim()) {
                setIngredients([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/ingredients?q=${encodeURIComponent(debouncedQuery)}`
                );
                const data = await response.json();
                setIngredients(data.data);
            } catch (error) {
                console.error('Ошибка при поиске ингредиентов:', error);
                setIngredients([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIngredients();
    }, [debouncedQuery]);

    // Синхронизация внешнего и внутреннего значения
    useEffect(() => {
        setQuery(value);
    }, [value]);

    const handleChange = (newValue: string) => {
        setQuery(newValue);
        onChange(newValue);
    };

    return (
        <Combobox
            as="div"
            value={query}
            onChange={(value: string | Ingredient) => {
                if (typeof value === 'string') {
                    handleChange(value);
                } else {
                    handleChange(value.name);
                    onSelect(value);
                }
            }}
            className="relative"
        >
            <div className="relative">
                <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                />
                <Combobox.Input
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-dark-700 dark:bg-dark-800 dark:text-white"
                    placeholder="Поиск ингредиента..."
                    onChange={(e) => handleChange(e.target.value)}
                    displayValue={(value: string | Ingredient) =>
                        typeof value === 'string' ? value : value.name
                    }
                />
            </div>

            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg border border-gray-200 focus:outline-none dark:bg-dark-800 dark:border-dark-700">
                {isLoading && (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        Загрузка...
                    </div>
                )}

                {!isLoading && ingredients.length === 0 && query.trim() !== '' && (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        Ничего не найдено
                    </div>
                )}

                {ingredients.map((ingredient) => (
                    <Combobox.Option
                        key={ingredient.id}
                        value={ingredient}
                        className={({ active }) =>
                            cn(
                                'relative cursor-pointer select-none px-4 py-2',
                                active
                                    ? 'bg-primary-50 text-primary-900 dark:bg-dark-700 dark:text-primary-100'
                                    : 'text-gray-900 dark:text-gray-100'
                            )
                        }
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{ingredient.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {ingredient.price_per_unit} ₽ за {ingredient.unit}
                            </span>
                        </div>
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </Combobox>
    );
};