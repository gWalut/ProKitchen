import { useNavigate } from 'react-router-dom';

export const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                        aria-label="Назад"
                    >
                        <span className="text-xl">←</span>
                        <span className="font-medium">Назад</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Политика конфиденциальности</h1>
                    <div className="w-24"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Сбор информации</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы собираем информацию, которую вы предоставляете при регистрации и использовании приложения ProKitchen.
                            Это включает ваш email, данные о блюдах, ингредиентах и предпочтениях.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Использование информации</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Ваши данные используются исключительно для предоставления функциональности приложения:
                        </p>
                        <ul className="mt-2 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                            <li>Сохранение ваших рецептов и калькуляций</li>
                            <li>Отслеживание аллергенов</li>
                            <li>Генерация этикеток</li>
                            <li>Улучшение работы сервиса</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Защита данных</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы применяем современные методы защиты для обеспечения безопасности ваших данных.
                            Все пароли хранятся в зашифрованном виде. Доступ к вашим данным имеете только вы.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Cookies</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы используем cookies для поддержания вашей сессии и улучшения пользовательского опыта.
                            Вы можете отключить cookies в настройках браузера, но это может ограничить функциональность приложения.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Передача данных третьим лицам</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы не передаем ваши личные данные третьим лицам без вашего согласия,
                            за исключением случаев, предусмотренных законодательством.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Ваши права</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Вы имеете право на доступ, исправление или удаление ваших персональных данных.
                            Для этого свяжитесь с нами через настройки приложения.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Изменения в политике</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы можем обновлять эту политику конфиденциальности. Обо всех значительных изменениях
                            мы уведомим вас через приложение.
                        </p>
                    </section>

                    <section className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Последнее обновление: 10 ноября 2025 г.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Контакт: support@prokitchen.app
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
