import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { dishesApi } from '@/api/endpoints';
import { useSEO } from '@/shared/hooks/useSEO';

interface Ingredient {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
}

interface Dish {
    id: number;
    name: string;
    description?: string;
    portions: number;
    ingredients: Ingredient[];
}

export const DishDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [dish, setDish] = useState<Dish | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedPortions, setEditedPortions] = useState(1);
    const [totalCost, setTotalCost] = useState(0);
    const [costPerPortion, setCostPerPortion] = useState(0);

    // Динамический SEO на основе загруженного блюда
    useSEO({
        title: dish ? dish.name : 'Блюдо',
        description: dish
            ? `Рецепт и себестоимость блюда «${dish.name}»: ${dish.ingredients.length} ингредиентов, ${dish.portions} порций.`
            : 'Детальная информация о блюде',
        canonical: `https://prokitchen.app/dishes/${id}`,
        noIndex: true, // личные блюда не индексируем
        jsonLd: dish
            ? {
                '@context': 'https://schema.org',
                '@type': 'Recipe',
                name: dish.name,
                description: dish.description ?? '',
                recipeYield: `${dish.portions} порций`,
                recipeIngredient: dish.ingredients.map(
                    (i) => `${i.quantity} ${i.unit} ${i.name}`
                ),
            }
            : undefined,
    });

    useEffect(() => {
        loadDish();
    }, [id]);

    useEffect(() => {
        if (dish) {
            calculateCost();
        }
    }, [dish, editedPortions]);

    const loadDish = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            const response = await dishesApi.getById(parseInt(id));
            const dishData = response.data;

            // Преобразуем ингредиенты в нужный формат
            const transformedDish: Dish = {
                id: dishData.id,
                name: dishData.name,
                description: dishData.notes,
                portions: dishData.portions || 1,
                ingredients: dishData.ingredients?.map((ing: any) => ({
                    id: ing.id,
                    name: ing.name || 'Неизвестный ингредиент',
                    quantity: ing.quantity,
                    unit: ing.unit || 'г',
                    price_per_unit: ing.price_per_unit || 0
                })) || []
            };

            setDish(transformedDish);
            setEditedName(transformedDish.name);
            setEditedPortions(transformedDish.portions);
        } catch (error) {
            console.error('Failed to load dish:', error);
            alert('Не удалось загрузить блюдо');
            navigate('/favorites');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateCost = () => {
        if (!dish) return;

        const total = dish.ingredients.reduce((sum, ing) => {
            return sum + (ing.price_per_unit * ing.quantity);
        }, 0);

        const perPortion = editedPortions > 0 ? total / editedPortions : total;

        setTotalCost(total);
        setCostPerPortion(perPortion);
    };

    const handleSave = async () => {
        if (!dish || !id) return;

        try {
            await dishesApi.update(parseInt(id), {
                name: editedName,
                portions: editedPortions
            });

            alert('Блюдо обновлено!');
            setIsEditing(false);
            await loadDish();
        } catch (error) {
            console.error('Failed to update dish:', error);
            alert('Не удалось обновить блюдо');
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        if (!confirm('Вы уверены, что хотите удалить это блюдо?')) {
            return;
        }

        try {
            await dishesApi.delete(parseInt(id));
            alert('Блюдо удалено');
            navigate('/favorites');
        } catch (error) {
            console.error('Failed to delete dish:', error);
            alert('Не удалось удалить блюдо');
        }
    };

    const handleRemoveFromFavorites = async () => {
        if (!id) return;

        try {
            await dishesApi.removeFromFavorites(parseInt(id));
            alert('Блюдо удалено из избранного');
            navigate('/favorites');
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            alert('Не удалось удалить из избранного');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <p className="text-gray-600 dark:text-gray-400">Загрузка блюда...</p>
                </div>
            </div>
        );
    }

    if (!dish) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-gray-600 dark:text-gray-400">Блюдо не найдено</p>
                    <button
                        onClick={() => navigate('/favorites')}
                        className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                    >
                        Вернуться к избранному
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/favorites')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                        aria-label="Назад"
                    >
                        <span className="text-xl">←</span>
                        <span className="font-medium">Назад</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isEditing ? 'Редактирование блюда' : 'Просмотр блюда'}
                    </h1>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                                >
                                    ✏️ Редактировать
                                </button>
                                <button
                                    onClick={handleRemoveFromFavorites}
                                    className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                    title="Удалить из избранного"
                                >
                                    ⭐
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    💾 Сохранить
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedName(dish.name);
                                        setEditedPortions(dish.portions);
                                    }}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                                >
                                    ❌ Отмена
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название блюда
                            </label>
                            {isEditing ? (
                                <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    placeholder="Название блюда"
                                />
                            ) : (
                                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{dish.name}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Количество порций
                            </label>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    min="1"
                                    value={editedPortions}
                                    onChange={(e) => setEditedPortions(Number(e.target.value) || 1)}
                                />
                            ) : (
                                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{dish.portions}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ингредиенты</h3>
                        {dish.ingredients.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-600">
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Название</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Количество</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Цена за ед.</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Итого</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dish.ingredients.map((ing, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="py-2 px-2 text-gray-900 dark:text-gray-100">{ing.name}</td>
                                                <td className="py-2 px-2 text-gray-900 dark:text-gray-100">
                                                    {ing.quantity} {ing.unit}
                                                </td>
                                                <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                                                    {ing.price_per_unit.toFixed(2)} руб/{ing.unit}
                                                </td>
                                                <td className="py-2 px-2 font-medium text-brand-600 dark:text-brand-400">
                                                    {(ing.price_per_unit * ing.quantity).toFixed(2)} руб
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">Нет ингредиентов</p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Стоимость за порцию:</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400">{costPerPortion.toFixed(2)} руб</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Общая стоимость ингредиентов:</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400">{totalCost.toFixed(2)} руб</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Итоговая стоимость:</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                                {(costPerPortion * editedPortions).toFixed(2)} руб
                            </span>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <Button
                                onClick={handleDelete}
                                variant="secondary"
                                fullWidth
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                🗑️ Удалить блюдо
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DishDetailPage;
