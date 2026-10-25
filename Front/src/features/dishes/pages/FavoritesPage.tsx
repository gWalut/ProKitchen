import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customDishesApi, CustomDish } from '@/api/endpoints';
import { Button } from '@/shared/components/Button';

export const FavoritesPage = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState<CustomDish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Загрузка избранных блюд при монтировании
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Загружаем пользовательские блюда из калькулятора
            const response = await customDishesApi.getList();
            setDishes(response.data);
        } catch (err) {
            console.error('Failed to load favorites:', err);
            setError('Не удалось загрузить избранные блюда');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (id: number) => {
        try {
            await customDishesApi.delete(id);
            setDishes(dishes.filter(dish => dish.id !== id));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
            alert('Не удалось удалить из избранного');
        }
    };

    const openDish = (id: number) => {
        // Переходим на страницу редактирования/просмотра блюда
        navigate(`/custom-dishes/${id}`);
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
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">⭐ Избранные блюда</h1>
                    <div className="w-32"></div>
                </div>

                {isLoading ? (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                        <div className="text-6xl mb-4 animate-pulse">⭐</div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Загрузка избранных блюд...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-12 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ошибка загрузки</h3>
                        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                        <Button variant="primary" onClick={loadFavorites}>
                            Попробовать снова
                        </Button>
                    </div>
                ) : dishes.length > 0 ? (
                    <div className="space-y-4">
                        {dishes.map((dish) => (
                            <div key={dish.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{dish.name}</h3>
                                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">🍽️ Порций: {dish.portions}</span>
                                            <span className="font-bold text-brand-600 dark:text-brand-400">
                                                💰 {dish.cost_per_portion.toFixed(2)} ₽/порция
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(dish.id)}
                                        className="text-3xl hover:scale-125 transition-transform hover:rotate-12"
                                        title="Удалить из избранного"
                                    >
                                        ⭐
                                    </button>
                                </div>

                                {dish.ingredients && dish.ingredients.length > 0 && (
                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <span>🥗</span>
                                            Ингредиенты:
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {dish.ingredients.map((ing, idx) => (
                                                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                                    • {ing.name}: {ing.weight} {ing.unit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => openDish(dish.id)}
                                    variant="primary"
                                    fullWidth
                                >
                                    👁️ Просмотреть и редактировать
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                        <div className="text-6xl mb-4">⭐</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Нет избранных блюд</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Добавьте первое в калькуляторе себестоимости</p>
                        <Button onClick={() => navigate('/calc')} variant="primary">
                            📊 Перейти в калькулятор
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
