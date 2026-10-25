import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { customDishesApi, CustomDishIngredient } from '@/api/endpoints';

export const EditCustomDishPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dishName, setDishName] = useState('');
    const [portions, setPortions] = useState(1);
    const [ingredients, setIngredients] = useState<CustomDishIngredient[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        weight: 0,
        pricePerUnit: 0,
        unit: 'г'
    });

    // Загрузка блюда
    useEffect(() => {
        if (id) {
            loadDish(parseInt(id));
        }
    }, [id]);

    const loadDish = async (dishId: number) => {
        try {
            setIsLoading(true);
            const response = await customDishesApi.getById(dishId);
            const loadedDish = response.data;

            setDishName(loadedDish.name);
            setPortions(loadedDish.portions);
            setIngredients(loadedDish.ingredients || []);
        } catch (error) {
            console.error('Failed to load dish:', error);
            alert('Не удалось загрузить блюдо');
            navigate('/favorites');
        } finally {
            setIsLoading(false);
        }
    }; const addIngredient = () => {
        if (!newIngredient.name || newIngredient.weight <= 0) {
            alert('Заполните название и вес продукта');
            return;
        }

        const ingredient: CustomDishIngredient = {
            name: newIngredient.name,
            weight: newIngredient.weight,
            unit: newIngredient.unit,
            pricePerUnit: newIngredient.pricePerUnit
        };

        setIngredients([...ingredients, ingredient]);
        setNewIngredient({ name: '', weight: 0, pricePerUnit: 0, unit: 'г' });
        setShowAddForm(false);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof CustomDishIngredient, value: string | number) => {
        setIngredients(ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
    };

    // Пересчёт стоимости
    const calculateCosts = () => {
        const totalCost = ingredients.reduce((sum, ing) => sum + (ing.pricePerUnit * ing.weight), 0);
        const costPerPortion = portions > 0 ? totalCost / portions : 0;
        return { totalCost, costPerPortion };
    };

    const saveDish = async () => {
        if (!dishName || ingredients.length === 0) {
            alert('Введите название блюда и добавьте ингредиенты');
            return;
        }

        if (!id) return;

        try {
            setIsSaving(true);
            const { totalCost, costPerPortion } = calculateCosts();

            await customDishesApi.update(parseInt(id), {
                name: dishName,
                portions: portions,
                ingredients: ingredients,
                cost_per_portion: costPerPortion,
                total_cost: totalCost
            });

            alert('Блюдо успешно обновлено!');
            navigate('/favorites');
        } catch (error: any) {
            console.error('Save dish error:', error);
            alert(error?.message || 'Ошибка при сохранении блюда');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteDish = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
            return;
        }

        if (!id) return;

        try {
            await customDishesApi.delete(parseInt(id));
            alert('Блюдо удалено');
            navigate('/favorites');
        } catch (error) {
            console.error('Delete dish error:', error);
            alert('Ошибка при удалении блюда');
        }
    };

    const { totalCost, costPerPortion } = calculateCosts();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🍳</div>
                    <p className="text-gray-600 dark:text-gray-400">Загрузка блюда...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Редактирование блюда</h1>
                    <button
                        onClick={deleteDish}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <span className="text-xl">🗑️</span>
                        <span className="font-medium">Удалить</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название блюда <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={dishName}
                                onChange={(e) => setDishName(e.target.value)}
                                placeholder="Название блюда"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Количество порций</label>
                            <Input
                                type="number"
                                min="1"
                                value={portions}
                                onChange={(e) => setPortions(Number(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ингредиенты</h3>

                        {ingredients.length > 0 && (
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-600">
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Название</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Вес (г)</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Цена/ед</th>
                                            <th className="text-left py-2 px-2 text-sm text-gray-700 dark:text-gray-300">Итого</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredients.map((ing, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="py-2 px-2">
                                                    <Input
                                                        value={ing.name}
                                                        onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                                                        className="min-w-[150px]"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="0"
                                                        value={ing.weight || ''}
                                                        onChange={(e) => updateIngredient(idx, 'weight', Number(e.target.value) || 0)}
                                                        className="min-w-[100px]"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={ing.pricePerUnit || ''}
                                                        onChange={(e) => updateIngredient(idx, 'pricePerUnit', Number(e.target.value) || 0)}
                                                        className="min-w-[100px]"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 font-medium text-brand-600 dark:text-brand-400">
                                                    {(ing.pricePerUnit * ing.weight).toFixed(2)} руб
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button onClick={() => removeIngredient(idx)} className="text-red-600 hover:text-red-700 text-xl">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
                            >
                                <span className="text-xl">+</span> Добавить ингредиент
                            </button>
                        ) : (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Новый ингредиент</h4>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <Input
                                        placeholder="Название"
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Вес (г)"
                                        value={newIngredient.weight || ''}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, weight: Number(e.target.value) || 0 })}
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Цена за 1г (руб)"
                                        value={newIngredient.pricePerUnit || ''}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, pricePerUnit: Number(e.target.value) || 0 })}
                                    />
                                    <Button
                                        onClick={addIngredient}
                                        variant="primary"
                                    >
                                        Добавить
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Стоимость за порцию:</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400">{costPerPortion.toFixed(2)} руб</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Итоговая стоимость:</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400">{totalCost.toFixed(2)} руб</span>
                        </div>
                    </div>

                    <Button
                        onClick={saveDish}
                        variant="primary"
                        fullWidth
                        disabled={ingredients.length === 0 || !dishName.trim() || isSaving}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditCustomDishPage;
