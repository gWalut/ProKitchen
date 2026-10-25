import { useNavigate } from 'react-router-dom';
import { LargeTileButton } from '@/shared/components/LargeTileButton';
import { useGuest } from '@/features/auth/hooks/useGuest';
import { useSEO } from '@/shared/hooks/useSEO';
import toast from 'react-hot-toast';

export const MainPage = () => {
    const navigate = useNavigate();
    const { isGuest, showAuthRequiredMessage } = useGuest();

    useSEO({
        title: 'Главная',
        description: 'Управляйте рецептами, считайте себестоимость блюд, проверяйте аллергены — всё в одном месте.',
        canonical: 'https://prokitchen.app/main',
        noIndex: true, // личный кабинет пользователя
    });

    const handleNavigation = (path: string, requireAuth: boolean = false) => {
        if (requireAuth && isGuest) {
            toast.error(showAuthRequiredMessage());
            return;
        }
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {isGuest && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 mb-6 shadow-lg backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <p className="relative text-amber-900 dark:text-amber-100 text-center font-semibold flex items-center justify-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span>Вы в гостевом режиме. <a href="/register" className="underline decoration-2 hover:text-amber-700 dark:hover:text-amber-200 transition-colors">Зарегистрируйтесь</a>, чтобы получить полный доступ!</span>
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">Добро пожаловать!</h1>
                        <p className="text-gray-600 dark:text-gray-400">Управляйте вашими рецептами легко и удобно</p>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        className="group flex items-center gap-2 px-5 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-400 dark:hover:border-brand-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        aria-label="Настройки"
                    >
                        <span className="text-xl transition-transform group-hover:rotate-90 duration-300">⚙️</span>
                        <span className="font-semibold hidden sm:inline">Настройки</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                        <LargeTileButton
                            icon="💰"
                            title="Калькулятор себестоимости"
                            onClick={() => handleNavigation('/calc')}
                        />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                        <LargeTileButton
                            icon="⚠️"
                            title="Матрица аллергенов"
                            onClick={() => handleNavigation('/allergens')}
                        />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                        <LargeTileButton
                            icon="🏷️"
                            title="Печать этикеток"
                            onClick={() => handleNavigation('/labels', true)}
                            className={isGuest ? 'opacity-50 cursor-not-allowed' : ''}
                        />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
                        <LargeTileButton
                            icon="⭐"
                            title="Избранные блюда"
                            onClick={() => handleNavigation('/favorites', true)}
                            className={isGuest ? 'opacity-50 cursor-not-allowed' : ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
