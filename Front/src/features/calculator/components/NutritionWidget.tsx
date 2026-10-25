/**
 * NutritionWidget — виджет питательной ценности ингредиента.
 *
 * Состояния:
 *  - idle      : не выбран ингредиент
 *  - loading   : запрос в процессе
 *  - success   : данные получены
 *  - empty     : ингредиент не найден в базе Spoonacular
 *  - error     : API недоступен (graceful degradation)
 */
import { useState, useEffect, useRef } from 'react';
import { fetchNutritionByName, NutritionData } from '@/api/nutritionApi';

interface Props {
    /** Название ингредиента для поиска (если null — виджет скрыт) */
    ingredientName: string | null;
}

type State =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; data: NutritionData }
    | { kind: 'empty' }
    | { kind: 'error'; message: string };

const DEBOUNCE_MS = 500;

function NutrientRow({ label, value, unit, color }: {
    label: string;
    value: number;
    unit: string;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>
                {value.toFixed(1)} {unit}
            </span>
        </div>
    );
}

export function NutritionWidget({ ingredientName }: Props) {
    const [state, setState] = useState<State>({ kind: 'idle' });
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!ingredientName || ingredientName.trim().length < 2) {
            setState({ kind: 'idle' });
            return;
        }

        // Дебаунс чтобы не делать запрос при каждом символе
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setState({ kind: 'loading' });

        debounceRef.current = setTimeout(async () => {
            const result = await fetchNutritionByName(ingredientName.trim());

            if (!result.available) {
                setState({ kind: 'error', message: result.errorMessage ?? 'Ошибка API' });
                return;
            }
            if (!result.data) {
                setState({ kind: 'empty' });
                return;
            }
            setState({ kind: 'success', data: result.data });
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [ingredientName]);

    if (state.kind === 'idle') return null;

    return (
        <aside
            aria-label="Питательная ценность"
            className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4"
        >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span role="img" aria-hidden>🥗</span> Питательная ценность (на 100 г)
            </h3>

            {/* LOADING */}
            {state.kind === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Загрузка данных…
                </div>
            )}

            {/* SUCCESS */}
            {state.kind === 'success' && (
                <div>
                    {state.data.image && (
                        <img
                            src={state.data.image}
                            alt={state.data.name}
                            width={48}
                            height={48}
                            loading="lazy"
                            className="float-right ml-3 rounded-lg object-cover w-12 h-12"
                        />
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">{state.data.name}</p>
                    <div className="space-y-0.5">
                        {state.data.calories && (
                            <NutrientRow
                                label="Калории"
                                value={state.data.calories.amount}
                                unit={state.data.calories.unit}
                                color="text-orange-600 dark:text-orange-400"
                            />
                        )}
                        {state.data.protein && (
                            <NutrientRow
                                label="Белки"
                                value={state.data.protein.amount}
                                unit={state.data.protein.unit}
                                color="text-blue-600 dark:text-blue-400"
                            />
                        )}
                        {state.data.fat && (
                            <NutrientRow
                                label="Жиры"
                                value={state.data.fat.amount}
                                unit={state.data.fat.unit}
                                color="text-yellow-600 dark:text-yellow-400"
                            />
                        )}
                        {state.data.carbohydrates && (
                            <NutrientRow
                                label="Углеводы"
                                value={state.data.carbohydrates.amount}
                                unit={state.data.carbohydrates.unit}
                                color="text-green-600 dark:text-green-400"
                            />
                        )}
                        {state.data.fiber && (
                            <NutrientRow
                                label="Клетчатка"
                                value={state.data.fiber.amount}
                                unit={state.data.fiber.unit}
                                color="text-teal-600 dark:text-teal-400"
                            />
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        Источник: Spoonacular Food Database
                    </p>
                </div>
            )}

            {/* EMPTY — ингредиент не найден */}
            {state.kind === 'empty' && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    Нутритивные данные для «{ingredientName}» не найдены
                </p>
            )}

            {/* ERROR — graceful degradation */}
            {state.kind === 'error' && (
                <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <span role="img" aria-label="Предупреждение">⚠️</span>
                    <span>{state.message}. Данные о питательности временно недоступны.</span>
                </div>
            )}
        </aside>
    );
}

export default NutritionWidget;
