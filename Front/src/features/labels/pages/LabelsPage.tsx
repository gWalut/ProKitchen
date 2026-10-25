import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { dishesApi, customDishesApi } from '@/api/endpoints';
import type { Dish } from '@/shared/types/api';
import type { CustomDish } from '@/api/endpoints';

type CombinedDish = (Dish | CustomDish) & {
    isCustom?: boolean;
};

export const LabelsPage = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState<CombinedDish[]>([]);
    const [selectedDishId, setSelectedDishId] = useState('');
    const [weight, setWeight] = useState('');
    const [manufactureDate, setManufactureDate] = useState('');
    const [shelfLife, setShelfLife] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDishes, setIsLoadingDishes] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDishes();

        // Установка текущей даты по умолчанию
        const today = new Date().toISOString().split('T')[0];
        setManufactureDate(today);
    }, []);

    const loadDishes = async () => {
        try {
            setIsLoadingDishes(true);

            // Загружаем избранные блюда и пользовательские блюда параллельно
            const [favoritesResponse, customDishesResponse] = await Promise.allSettled([
                dishesApi.getFavorites(),
                customDishesApi.getList()
            ]);

            const allDishes: CombinedDish[] = [];

            // Добавляем избранные блюда
            if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value.data) {
                const favDishes = Array.isArray(favoritesResponse.value.data)
                    ? favoritesResponse.value.data
                    : [favoritesResponse.value.data];
                allDishes.push(...favDishes.map(dish => ({ ...dish, isCustom: false })));
            }

            // Добавляем пользовательские блюда из калькулятора
            if (customDishesResponse.status === 'fulfilled' && customDishesResponse.value.data) {
                const customDishes = Array.isArray(customDishesResponse.value.data)
                    ? customDishesResponse.value.data
                    : [customDishesResponse.value.data];
                allDishes.push(...customDishes.map(dish => ({ ...dish, isCustom: true })));
            }

            setDishes(allDishes);
        } catch (err) {
            console.error('Failed to load dishes:', err);
            setError('Не удалось загрузить блюда');
        } finally {
            setIsLoadingDishes(false);
        }
    };

    const handlePrint = async () => {
        if (!selectedDishId || !weight || !manufactureDate || !shelfLife) {
            setError('Заполните все поля!');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const [type, idStr] = selectedDishId.split('-');
            const dishId = parseInt(idStr);
            const isCustom = type === 'custom';

            const selectedDish = dishes.find(d =>
                d.id === dishId && d.isCustom === isCustom
            );

            if (!selectedDish) {
                setError('Блюдо не найдено');
                return;
            }

            // Генерируем PDF этикетку
            const pdfBlob = isCustom
                ? await customDishesApi.generateLabel(dishId, {
                    weight: parseInt(weight),
                    manufactureDate: manufactureDate,
                    shelfLife: parseInt(shelfLife),
                })
                : await dishesApi.generateLabel(dishId, {
                    weight: parseInt(weight),
                    manufactureDate: manufactureDate,
                    shelfLife: parseInt(shelfLife),
                });

            // Скачиваем PDF
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            const dishName = selectedDish.name || 'блюдо';
            link.download = `Этикетка_${dishName}_${manufactureDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Очищаем форму
            setSelectedDishId('');
            setWeight('');
            setShelfLife('');

            // Показываем успешное сообщение
            setError('');
        } catch (err) {
            console.error('Failed to generate label:', err);
            setError('Не удалось создать этикетку. Проверьте подключение к серверу.');
        } finally {
            setIsLoading(false);
        }
    }; return (
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
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">🏷️ Печать этикеток</h1>
                    <div className="w-32"></div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl font-medium animate-shake">
                            ❌ {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🍲</span>
                            Выберите блюдо:
                        </label>
                        {isLoadingDishes ? (
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-center">
                                ⏳ Загрузка блюд...
                            </div>
                        ) : (
                            <>
                                <select
                                    value={selectedDishId}
                                    onChange={(e) => setSelectedDishId(e.target.value)}
                                    disabled={dishes.length === 0}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value=""> Выберите блюдо </option>
                                    {dishes.map((dish) => (
                                        <option key={`${dish.isCustom ? 'custom' : 'regular'}-${dish.id}`} value={`${dish.isCustom ? 'custom' : 'regular'}-${dish.id}`}>
                                            {dish.name} {dish.isCustom ? '' : '(Избранное)'}
                                        </option>
                                    ))}
                                </select>
                                {dishes.length === 0 && (
                                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                        📝 Нет доступных блюд. <br />
                                        • Создайте блюдо в <strong>Калькуляторе себестоимости</strong><br />
                                    </p>
                                )}
                                {dishes.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Доступно блюд: {dishes.length}
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Параметры этикетки:</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Вес (г):</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="Введите вес в граммах"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата изготовления:</label>
                                <Input
                                    type="date"
                                    value={manufactureDate}
                                    onChange={(e) => setManufactureDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Срок годности (дней):</label>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={shelfLife}
                                    onChange={(e) => setShelfLife(e.target.value)}
                                    placeholder="Введите срок годности в днях"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handlePrint}
                        variant="primary"
                        fullWidth
                        className="mt-6"
                        disabled={isLoading || !selectedDishId}
                    >
                        {isLoading ? '⏳ Создание этикетки...' : '🖨️ Напечатать'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LabelsPage;
