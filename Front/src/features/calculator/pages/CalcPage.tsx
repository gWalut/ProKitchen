import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { customDishesApi } from '@/api/endpoints';
import { useSEO } from '@/shared/hooks/useSEO';

// Lazy-load — загружается только когда пользователь видит результат
const NutritionWidget = lazy(() => import('../components/NutritionWidget'));

interface Ingredient {
    id: number;
    name: string;
    weight: number; // вес в граммах
    unit: string;
    pricePerUnit: number; // цена за 1г/мл/шт
}

export const CalcPage = () => {
    const navigate = useNavigate();

    useSEO({
        title: 'Калькулятор себестоимости блюд',
        description: 'Рассчитайте точную себестоимость блюда по ингредиентам. Калькулятор для поваров и рестораторов.',
        canonical: 'https://prokitchen.app/calc',
        ogTitle: 'Калькулятор себестоимости блюд — ProKitchen',
        ogDescription: 'Бесплатный онлайн-калькулятор себестоимости блюд для поваров и рестораторов.',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Калькулятор себестоимости блюд',
            url: 'https://prokitchen.app/calc',
            applicationCategory: 'UtilitiesApplication',
            description: 'Рассчитайте точную себестоимость блюда по ингредиентам.',
            inLanguage: 'ru',
        },
    });

    const [dishName, setDishName] = useState('');
    const [portions, setPortions] = useState(1);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [calculated, setCalculated] = useState(false);
    const [totalCost, setTotalCost] = useState(0);
    const [costPerPortion, setCostPerPortion] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    /** Последний выбранный ингредиент для виджета питательности */
    const [nutritionTarget, setNutritionTarget] = useState<string | null>(null);

    // Категории продуктов
    const categories = [
        { id: 'all', label: 'Все', emoji: '🍽️' },
        { id: 'meat', label: 'Мясо и рыба', emoji: '🥩' },
        { id: 'vegetables', label: 'Овощи', emoji: '🥦' },
        { id: 'fruits', label: 'Фрукты', emoji: '🍎' },
        { id: 'grains', label: 'Крупы и мука', emoji: '🌾' },
        { id: 'dairy', label: 'Молочные', emoji: '🥛' },
        { id: 'eggs_oils', label: 'Яйца и масла', emoji: '🥚' },
        { id: 'herbs_spices', label: 'Зелень и специи', emoji: '🌿' },
        { id: 'sauces', label: 'Соусы', emoji: '🧄' },
    ];

    // Базовый набор продуктов с ценами - цены за 1г/мл/шт в рублях
    const baseProducts = [
        // Мясо и рыба
        { id: 1, name: 'Курица (филе)', unit: 'г', pricePerUnit: 0.50, category: 'meat' },
        { id: 2, name: 'Свинина', unit: 'г', pricePerUnit: 0.55, category: 'meat' },
        { id: 3, name: 'Говядина', unit: 'г', pricePerUnit: 0.75, category: 'meat' },
        { id: 4, name: 'Фарш говяжий', unit: 'г', pricePerUnit: 0.50, category: 'meat' },
        { id: 31, name: 'Курица (тушка)', unit: 'г', pricePerUnit: 0.30, category: 'meat' },
        { id: 32, name: 'Фарш куриный', unit: 'г', pricePerUnit: 0.40, category: 'meat' },
        { id: 33, name: 'Индейка', unit: 'г', pricePerUnit: 0.60, category: 'meat' },
        { id: 34, name: 'Баранина', unit: 'г', pricePerUnit: 0.90, category: 'meat' },
        { id: 35, name: 'Сосиски', unit: 'г', pricePerUnit: 0.35, category: 'meat' },
        { id: 36, name: 'Колбаса варёная', unit: 'г', pricePerUnit: 0.45, category: 'meat' },
        { id: 37, name: 'Сало', unit: 'г', pricePerUnit: 0.35, category: 'meat' },
        { id: 38, name: 'Рыба (минтай)', unit: 'г', pricePerUnit: 0.28, category: 'meat' },
        { id: 39, name: 'Рыба (форель)', unit: 'г', pricePerUnit: 0.85, category: 'meat' },
        { id: 40, name: 'Рыба (сёмга)', unit: 'г', pricePerUnit: 1.20, category: 'meat' },
        { id: 41, name: 'Креветки', unit: 'г', pricePerUnit: 0.90, category: 'meat' },
        { id: 42, name: 'Кальмары', unit: 'г', pricePerUnit: 0.60, category: 'meat' },

        // Овощи
        { id: 5, name: 'Картофель', unit: 'г', pricePerUnit: 0.05, category: 'vegetables' },
        { id: 6, name: 'Морковь', unit: 'г', pricePerUnit: 0.05, category: 'vegetables' },
        { id: 7, name: 'Лук репчатый', unit: 'г', pricePerUnit: 0.04, category: 'vegetables' },
        { id: 8, name: 'Помидоры', unit: 'г', pricePerUnit: 0.18, category: 'vegetables' },
        { id: 9, name: 'Огурцы', unit: 'г', pricePerUnit: 0.12, category: 'vegetables' },
        { id: 10, name: 'Капуста белокочанная', unit: 'г', pricePerUnit: 0.04, category: 'vegetables' },
        { id: 11, name: 'Перец болгарский', unit: 'г', pricePerUnit: 0.25, category: 'vegetables' },
        { id: 28, name: 'Зелёный лук', unit: 'г', pricePerUnit: 0.35, category: 'vegetables' },
        { id: 29, name: 'Чеснок', unit: 'г', pricePerUnit: 0.35, category: 'vegetables' },
        { id: 43, name: 'Свёкла', unit: 'г', pricePerUnit: 0.05, category: 'vegetables' },
        { id: 44, name: 'Кабачок', unit: 'г', pricePerUnit: 0.08, category: 'vegetables' },
        { id: 45, name: 'Баклажан', unit: 'г', pricePerUnit: 0.15, category: 'vegetables' },
        { id: 46, name: 'Тыква', unit: 'г', pricePerUnit: 0.07, category: 'vegetables' },
        { id: 47, name: 'Шпинат', unit: 'г', pricePerUnit: 0.45, category: 'vegetables' },
        { id: 48, name: 'Брокколи', unit: 'г', pricePerUnit: 0.25, category: 'vegetables' },
        { id: 49, name: 'Цветная капуста', unit: 'г', pricePerUnit: 0.18, category: 'vegetables' },
        { id: 50, name: 'Сельдерей (стебель)', unit: 'г', pricePerUnit: 0.20, category: 'vegetables' },
        { id: 51, name: 'Лук-порей', unit: 'г', pricePerUnit: 0.22, category: 'vegetables' },
        { id: 52, name: 'Редька', unit: 'г', pricePerUnit: 0.06, category: 'vegetables' },

        // Фрукты
        { id: 53, name: 'Яблоко', unit: 'г', pricePerUnit: 0.10, category: 'fruits' },
        { id: 54, name: 'Груша', unit: 'г', pricePerUnit: 0.12, category: 'fruits' },
        { id: 55, name: 'Банан', unit: 'г', pricePerUnit: 0.12, category: 'fruits' },
        { id: 56, name: 'Апельсин', unit: 'г', pricePerUnit: 0.15, category: 'fruits' },
        { id: 57, name: 'Лимон', unit: 'г', pricePerUnit: 0.20, category: 'fruits' },
        { id: 58, name: 'Виноград', unit: 'г', pricePerUnit: 0.25, category: 'fruits' },
        { id: 59, name: 'Клубника', unit: 'г', pricePerUnit: 0.50, category: 'fruits' },
        { id: 60, name: 'Черника', unit: 'г', pricePerUnit: 0.80, category: 'fruits' },
        { id: 61, name: 'Вишня', unit: 'г', pricePerUnit: 0.45, category: 'fruits' },
        { id: 62, name: 'Слива', unit: 'г', pricePerUnit: 0.18, category: 'fruits' },

        // Крупы и мука
        { id: 12, name: 'Рис', unit: 'г', pricePerUnit: 0.10, category: 'grains' },
        { id: 13, name: 'Гречка', unit: 'г', pricePerUnit: 0.13, category: 'grains' },
        { id: 14, name: 'Макароны', unit: 'г', pricePerUnit: 0.08, category: 'grains' },
        { id: 15, name: 'Мука пшеничная', unit: 'г', pricePerUnit: 0.05, category: 'grains' },
        { id: 63, name: 'Перловая крупа', unit: 'г', pricePerUnit: 0.08, category: 'grains' },
        { id: 64, name: 'Пшено', unit: 'г', pricePerUnit: 0.09, category: 'grains' },
        { id: 65, name: 'Овсяные хлопья', unit: 'г', pricePerUnit: 0.10, category: 'grains' },
        { id: 66, name: 'Манная крупа', unit: 'г', pricePerUnit: 0.07, category: 'grains' },
        { id: 67, name: 'Кукурузная крупа', unit: 'г', pricePerUnit: 0.09, category: 'grains' },
        { id: 68, name: 'Хлеб белый', unit: 'г', pricePerUnit: 0.08, category: 'grains' },
        { id: 69, name: 'Хлеб чёрный', unit: 'г', pricePerUnit: 0.07, category: 'grains' },
        { id: 70, name: 'Мука кукурузная', unit: 'г', pricePerUnit: 0.08, category: 'grains' },

        // Молочные
        { id: 16, name: 'Молоко', unit: 'мл', pricePerUnit: 0.09, category: 'dairy' },
        { id: 17, name: 'Сметана', unit: 'г', pricePerUnit: 0.25, category: 'dairy' },
        { id: 18, name: 'Сыр твёрдый', unit: 'г', pricePerUnit: 0.70, category: 'dairy' },
        { id: 19, name: 'Масло сливочное', unit: 'г', pricePerUnit: 0.85, category: 'dairy' },
        { id: 20, name: 'Творог', unit: 'г', pricePerUnit: 0.35, category: 'dairy' },
        { id: 71, name: 'Кефир', unit: 'мл', pricePerUnit: 0.08, category: 'dairy' },
        { id: 72, name: 'Йогурт натуральный', unit: 'г', pricePerUnit: 0.18, category: 'dairy' },
        { id: 73, name: 'Сливки 20%', unit: 'мл', pricePerUnit: 0.30, category: 'dairy' },
        { id: 74, name: 'Сыр плавленый', unit: 'г', pricePerUnit: 0.50, category: 'dairy' },
        { id: 75, name: 'Сыр моцарелла', unit: 'г', pricePerUnit: 0.80, category: 'dairy' },
        { id: 76, name: 'Ряженка', unit: 'мл', pricePerUnit: 0.10, category: 'dairy' },
        { id: 77, name: 'Сливочный сыр', unit: 'г', pricePerUnit: 0.55, category: 'dairy' },

        // Яйца и масла
        { id: 21, name: 'Яйца куриные', unit: 'шт', pricePerUnit: 13.00, category: 'eggs_oils' },
        { id: 22, name: 'Масло растительное', unit: 'мл', pricePerUnit: 0.18, category: 'eggs_oils' },
        { id: 78, name: 'Яйца перепелиные', unit: 'шт', pricePerUnit: 4.00, category: 'eggs_oils' },
        { id: 79, name: 'Масло оливковое', unit: 'мл', pricePerUnit: 0.65, category: 'eggs_oils' },

        // Зелень и специи
        { id: 23, name: 'Соль', unit: 'г', pricePerUnit: 0.025, category: 'herbs_spices' },
        { id: 24, name: 'Сахар', unit: 'г', pricePerUnit: 0.07, category: 'herbs_spices' },
        { id: 25, name: 'Перец чёрный молотый', unit: 'г', pricePerUnit: 1.30, category: 'herbs_spices' },
        { id: 26, name: 'Укроп', unit: 'г', pricePerUnit: 0.40, category: 'herbs_spices' },
        { id: 27, name: 'Петрушка', unit: 'г', pricePerUnit: 0.40, category: 'herbs_spices' },
        { id: 80, name: 'Базилик', unit: 'г', pricePerUnit: 0.80, category: 'herbs_spices' },
        { id: 81, name: 'Лавровый лист', unit: 'г', pricePerUnit: 0.50, category: 'herbs_spices' },
        { id: 82, name: 'Паприка', unit: 'г', pricePerUnit: 0.90, category: 'herbs_spices' },
        { id: 83, name: 'Куркума', unit: 'г', pricePerUnit: 1.20, category: 'herbs_spices' },
        { id: 84, name: 'Имбирь молотый', unit: 'г', pricePerUnit: 1.50, category: 'herbs_spices' },
        { id: 85, name: 'Корица', unit: 'г', pricePerUnit: 1.00, category: 'herbs_spices' },
        { id: 86, name: 'Тмин', unit: 'г', pricePerUnit: 0.80, category: 'herbs_spices' },
        { id: 87, name: 'Кориандр молотый', unit: 'г', pricePerUnit: 0.70, category: 'herbs_spices' },

        // Соусы
        { id: 30, name: 'Майонез', unit: 'г', pricePerUnit: 0.20, category: 'sauces' },
        { id: 88, name: 'Кетчуп', unit: 'г', pricePerUnit: 0.18, category: 'sauces' },
        { id: 89, name: 'Горчица', unit: 'г', pricePerUnit: 0.25, category: 'sauces' },
        { id: 90, name: 'Соевый соус', unit: 'мл', pricePerUnit: 0.30, category: 'sauces' },
        { id: 91, name: 'Уксус столовый', unit: 'мл', pricePerUnit: 0.05, category: 'sauces' },
        { id: 92, name: 'Томатная паста', unit: 'г', pricePerUnit: 0.15, category: 'sauces' },
        { id: 93, name: 'Аджика', unit: 'г', pricePerUnit: 0.22, category: 'sauces' },
        { id: 94, name: 'Соус терияки', unit: 'мл', pricePerUnit: 0.45, category: 'sauces' },
    ];

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        weight: 0,
        pricePerUnit: 0,
        unit: 'г'
    });

    // Фильтрация продуктов по поисковому запросу и категории
    const filteredProducts = baseProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addIngredient = () => {
        if (!newIngredient.name || newIngredient.weight <= 0) {
            alert('Заполните название и вес продукта');
            return;
        }

        const ingredient: Ingredient = {
            id: Date.now(),
            name: newIngredient.name,
            weight: newIngredient.weight,
            unit: newIngredient.unit,
            pricePerUnit: newIngredient.pricePerUnit
        };

        setIngredients([...ingredients, ingredient]);
        setNewIngredient({ name: '', weight: 0, pricePerUnit: 0, unit: 'г' });
        setShowAddForm(false);
    };

    const selectBaseProduct = (product: typeof baseProducts[0]) => {
        const ingredient: Ingredient = {
            id: Date.now(),
            name: product.name,
            weight: 0,
            unit: product.unit,
            pricePerUnit: product.pricePerUnit
        };
        setIngredients([...ingredients, ingredient]);
        setNutritionTarget(product.name);
        setShowAddForm(false);
        setSearchQuery(''); // Очищаем поиск
    };

    const removeIngredient = (id: number) => {
        setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const updateIngredient = (id: number, field: keyof Ingredient, value: string | number) => {
        setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
        if (calculated) {
            setTimeout(() => {
                const updatedIngredients = ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing);
                const baseCost = updatedIngredients.reduce((sum, ing) => sum + (ing.pricePerUnit * ing.weight), 0);
                const perPortion = baseCost / portions;
                const total = perPortion * portions;

                setCostPerPortion(perPortion);
                setTotalCost(total);
            }, 0);
        }
    };

    const calculate = () => {
        if (!dishName.trim()) {
            alert('Введите название блюда');
            return;
        }

        // Общая стоимость всех ингредиентов (базовая стоимость)
        const baseCost = ingredients.reduce((sum, ing) => sum + (ing.pricePerUnit * ing.weight), 0);

        // Стоимость за одну порцию
        const perPortion = baseCost / portions;

        // Итоговая стоимость = стоимость за порцию * количество порций
        const total = perPortion * portions;

        setCostPerPortion(perPortion);
        setTotalCost(total);
        setCalculated(true);
    };

    // Функция для обновления количества порций
    const handlePortionsChange = (newPortions: number) => {
        const validPortions = newPortions > 0 ? newPortions : 1;
        setPortions(validPortions);

        if (calculated && costPerPortion > 0) {
            setTotalCost(costPerPortion * validPortions);
        }
    };

    const saveDish = async () => {
        if (!dishName || ingredients.length === 0) {
            alert('Введите название блюда и добавьте ингредиенты');
            return;
        }

        if (!calculated) {
            alert('Сначала рассчитайте стоимость блюда');
            return;
        }

        try {
            // Сохраняем блюдо в таблицу custom_dishes
            await customDishesApi.create({
                name: dishName,
                description: `Создано в калькуляторе себестоимости`,
                portions: portions,
                ingredients: ingredients.map(ing => ({
                    name: ing.name,
                    weight: ing.weight,
                    unit: ing.unit,
                    pricePerUnit: ing.pricePerUnit
                })),
                cost_per_portion: costPerPortion,
                total_cost: totalCost
            });

            setIsFavorite(true);
            alert('Блюдо сохранено в избранное!');
        } catch (error: any) {
            console.error('Save dish error:', error);
            alert(error?.message || 'Ошибка при сохранении блюда');
        }
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
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                        💰 Калькулятор себестоимости
                    </h1>
                    <button
                        onClick={saveDish}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${isFavorite
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500 text-gray-700 dark:text-gray-200 hover:scale-105 active:scale-95'
                            }`}
                        disabled={isFavorite}
                        title={isFavorite ? 'Уже в избранном' : 'Добавить в избранное'}
                    >
                        <span className="text-2xl">{isFavorite ? '⭐' : '☆'}</span>
                    </button>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 space-y-6">
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
                                onChange={(e) => handlePortionsChange(Number(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🥗</span>
                            Ингредиенты
                        </h3>

                        {ingredients.length > 0 && (
                            <div className="overflow-x-auto mb-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20">
                                        <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Название</th>
                                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Вес (г)</th>
                                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Итого</th>
                                            <th className="w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        {ingredients.map((ing) => (
                                            <tr key={ing.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">{ing.name}</td>
                                                <td className="py-3 px-4">
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="0"
                                                        value={ing.weight || ''}
                                                        onChange={(e) => updateIngredient(ing.id, 'weight', Number(e.target.value) || 0)}
                                                        className="min-w-[100px]"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">
                                                    {(ing.pricePerUnit * ing.weight).toFixed(2)} ₽
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => removeIngredient(ing.id)}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl hover:scale-125 transition-transform"
                                                    >
                                                        ✕
                                                    </button>
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
                                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                            >
                                <span className="text-2xl">+</span> Добавить ингредиент...
                            </button>
                        ) : (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Выберите продукт или введите свой</h4>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                            setShowCategoryFilter(false);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Поле поиска + кнопка фильтра */}
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-stretch">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                                            <Input
                                                placeholder="Поиск продуктов..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-11"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowCategoryFilter(v => !v)}
                                            title="Фильтр по категориям"
                                            className={`flex items-center justify-center px-3.5 rounded-xl border-2 transition-all ${showCategoryFilter || selectedCategory !== 'all'
                                                ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-brand-400 dark:hover:border-brand-500'
                                                }`}
                                        >
                                            <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <line x1="1" y1="1.5" x2="19" y2="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="4" y1="7.5" x2="16" y2="7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="7" y1="13.5" x2="13" y2="13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Панель категорий */}
                                    {showCategoryFilter && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                                        ? 'bg-brand-600 text-white shadow-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300'
                                                        }`}
                                                >
                                                    <span>{cat.emoji}</span>
                                                    <span>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Список базовых продуктов */}
                                {filteredProducts.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900">
                                        {filteredProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => selectBaseProduct(product)}
                                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-brand-50 hover:to-purple-50 dark:hover:from-brand-900/20 dark:hover:to-purple-900/20 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                        {product.pricePerUnit} ₽/{product.unit}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        <span className="text-4xl block mb-2">🤷</span>
                                        <p>Продукт не найден</p>
                                        <p className="text-sm mt-1">Добавьте свой продукт ниже</p>
                                    </div>
                                )}

                                {/* Форма добавления вручную */}
                                <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-4">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <span className="text-lg">✏️</span>
                                        Или добавьте свой продукт:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                            placeholder="Цена за 1г (₽)"
                                            value={newIngredient.pricePerUnit || ''}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, pricePerUnit: Number(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <Button
                                        onClick={addIngredient}
                                        variant="primary"
                                        className="mt-3 w-full"
                                    >
                                        ➕ Добавить свой продукт
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={calculate}
                        variant="primary"
                        fullWidth
                        disabled={ingredients.length === 0 || !dishName.trim()}
                    >
                        Рассчитать
                    </Button>

                    {calculated && (
                        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 space-y-4 bg-gradient-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-900/10 dark:to-purple-900/10 rounded-xl p-6 -mx-2">
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="text-xl">🍽️</span>
                                    Стоимость за порцию:
                                </span>
                                <span className="font-extrabold text-2xl text-brand-600 dark:text-brand-400">{costPerPortion.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex justify-between items-center text-xl border-t border-gray-300 dark:border-gray-600 pt-4">
                                <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span className="text-2xl">💵</span>
                                    Итоговая стоимость:
                                </span>
                                <span className="font-extrabold text-3xl text-brand-600 dark:text-brand-400">
                                    {totalCost.toFixed(2)} ₽
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Виджет питательной ценности — lazy загружается только при первом выборе */}
                    {nutritionTarget && (
                        <Suspense fallback={<div className="h-16 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />}>
                            <NutritionWidget ingredientName={nutritionTarget} />
                        </Suspense>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalcPage;
