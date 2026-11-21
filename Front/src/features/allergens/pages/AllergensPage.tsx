import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/shared/components/Input';
import { api } from '@/api/client';
import { dishesApi } from '@/api/endpoints';
import { useSEO } from '@/shared/hooks/useSEO';

interface Allergen {
    id: number;
    name: string;
    description?: string;
}

export const AllergensPage = () => {
    const navigate = useNavigate();

    useSEO({
        title: 'Матрица аллергенов блюд',
        description: 'Проверьте состав блюда на аллергены. Матрица аллергенов для поваров и рестораторов согласно требованиям Роспотребнадзора.',
        canonical: 'https://prokitchen.app/allergens',
        ogTitle: 'Матрица аллергенов — ProKitchen',
        ogDescription: 'Проверьте блюда на наличие аллергенов: глютен, молоко, яйца, орехи и другие.',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Матрица аллергенов блюд',
            url: 'https://prokitchen.app/allergens',
            description: 'Проверьте состав блюда на аллергены согласно требованиям Роспотребнадзора.',
            inLanguage: 'ru',
        },
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDish, setSelectedDish] = useState<any | null>(null);
    const [dishAllergens, setDishAllergens] = useState<string[]>([]);
    const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Загружаем все аллергены при монтировании компонента
    useEffect(() => {
        loadAllergens();
    }, []);

    const loadAllergens = async () => {
        try {
            const response = await api.fetch<{ data: Allergen[] }>('/allergens');
            setAllAllergens(response.data);
        } catch (err) {
            console.error('Failed to load allergens:', err);
            setError('Не удалось загрузить справочник аллергенов. Попробуйте обновить страницу.');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Введите название блюда');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setSelectedDish(null);
            setDishAllergens([]);

            const response = await api.fetch<{ data: { id: number; name: string; ingredients?: unknown[] } }>(
                '/dishes/search/by-name', { params: { name: searchQuery.trim() } }
            );
            const dish = response.data;

            if (dish) {
                await selectDish(dish);
            } else {
                setError(`Блюдо "${searchQuery}" не найдено`);
            }
        } catch (err) {
            console.error('Failed to search dishes:', err);
            setError(err instanceof Error ? err.message : 'Не удалось выполнить поиск.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectDish = async (dish: any) => {
        setError('');

        try {
            // Если блюдо уже содержит ингредиенты (из API search/by-name)
            let dishWithIngredients = dish;

            // Если ингредиенты отсутствуют, получаем детали блюда
            if (!dish.ingredients || dish.ingredients.length === 0) {
                const detailsResponse = await dishesApi.getById(dish.id);
                dishWithIngredients = detailsResponse.data || detailsResponse;
            }

            // Извлекаем аллергены из всех ингредиентов
            const allergens: string[] = [];

            if (dishWithIngredients.ingredients && Array.isArray(dishWithIngredients.ingredients)) {
                for (const ing of dishWithIngredients.ingredients) {
                    // Проверяем, есть ли у ингредиента аллергены
                    if (ing.allergens && Array.isArray(ing.allergens)) {
                        ing.allergens.forEach((allergen: any) => {
                            const allergenName = allergen.name || allergen;
                            if (allergenName && !allergens.includes(allergenName)) {
                                allergens.push(allergenName);
                            }
                        });
                    }
                }
            }

            setSelectedDish(dishWithIngredients);
            setDishAllergens(allergens);
        } catch (err) {
            console.error('Failed to get dish details:', err);
            setSelectedDish(null);
            setDishAllergens([]);
            setError('Не удалось получить состав блюда. Наличие аллергенов не проверено.');
        }
    };

    const isAllergenPresent = (allergenName: string): boolean => {
        return dishAllergens.some(a =>
            a.toLowerCase().includes(allergenName.toLowerCase()) ||
            allergenName.toLowerCase().includes(a.toLowerCase())
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/main')}
                        className="group flex items-center gap-2 px-5 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-400 dark:hover:border-brand-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        aria-label="Назад"
                    >
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="font-semibold">Назад</span>
                    </button>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">⚠️ Матрица аллергенов</h1>
                    <div className="w-32"></div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 space-y-6">
                    {/* Поиск блюда */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🔍</span>
                            Введите название блюда для проверки аллергенов:
                        </label>
                        <div className="flex gap-3">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Например: Омлет"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold active:scale-95"
                            >
                                {isLoading ? '⏳ Поиск...' : '🔍 Поиск'}
                            </button>
                        </div>
                        {error && (
                            <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl font-medium">{error}</p>
                        )}
                    </div>

                    {/* Список всех аллергенов (всегда видимый) */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            {selectedDish ? `Аллергены в блюде "${selectedDish.name}"` : 'Список всех аллергенов'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            {selectedDish
                                ? '🔴 Красным выделены аллергены, присутствующие в блюде. ⚪ Серым — отсутствующие.'
                                : '👉 Введите название блюда в поиск, чтобы увидеть, какие аллергены в нём содержатся.'
                            }
                        </p>

                        {allAllergens.length === 0 && <p className="text-gray-600 dark:text-gray-400">Справочник аллергенов пока пуст. Наличие аллергенов не проверено.</p>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {allAllergens.map((allergen) => {
                                const hasAllergen = selectedDish && isAllergenPresent(allergen.name);
                                return (
                                    <div
                                        key={allergen.id}
                                        className={`px-4 py-3 rounded-lg text-center font-medium transition-all ${selectedDish
                                            ? hasAllergen
                                                ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-2 border-red-300 dark:border-red-700 shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            {hasAllergen && <span className="text-lg">⚠️</span>}
                                            <span>{allergen.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedDish && allAllergens.length > 0 && dishAllergens.length === 0 && (
                            <p className="mt-4 text-center text-green-600 dark:text-green-400 font-medium">
                                В составе блюда не указаны аллергены. Сверьте состав и маркировку продуктов.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllergensPage;
