import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { authApi } from '@/api/endpoints';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { useRole } from '@/features/auth/hooks/useRole';
import { useGuest } from '@/features/auth/hooks/useGuest';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { isAdmin } = useRole();
    const { isGuest } = useGuest();
    const [notifications, setNotifications] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Показываем кнопку администрирования
    // const showAdminButton = isAdmin && !isGuest;

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = '/hello';
    };

    const handleChangePassword = () => {
        setIsPasswordModalOpen(true);
    };

    const handlePasswordSubmit = async (currentPassword: string, newPassword: string) => {
        try {
            await authApi.changePassword(currentPassword, newPassword);
            setIsPasswordModalOpen(false);
            alert('Пароль успешно изменен! Пожалуйста, войдите заново.');
            // Выход из системы после смены пароля для безопасности
            await handleLogout();
        } catch (error: any) {
            // Пробрасываем ошибку в модальное окно для отображения
            throw new Error(error?.message || 'Не удалось сменить пароль');
        }
    };

    const handleAbout = () => {
        alert('ProKitchen v1.0.0\nАссистент повара - приложение для учета ингредиентов и блюд\n© 2026');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/main')}
                        className="group flex items-center gap-2 px-5 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-400 dark:hover:border-brand-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        aria-label="Назад на главную"
                    >
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="font-semibold">Назад</span>
                    </button>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">⚙️ Настройки</h1>
                    <div className="w-32"></div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 divide-y-2 divide-gray-200 dark:divide-gray-700 mb-6">
                    {/* Уведомления */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{notifications ? '🔔' : '🔕'}</span>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100 block">Уведомления</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{notifications ? 'Включены' : 'Выключены'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 shadow-inner ${notifications ? 'bg-brand-500 dark:bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            aria-label="Переключить уведомления"
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-9' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Смена темы */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl transition-transform duration-300">
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </div>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100 block">Темная тема</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">

                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 shadow-inner ${theme === 'dark'
                                ? 'bg-brand-600 shadow-brand-700'
                                : 'bg-gray-300 shadow-gray-400'
                                }`}
                            aria-label="Переключить тему"
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-500 flex items-center justify-center ${theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
                                    }`}
                            >
                                <span className="text-sm">
                                    {theme === 'dark' ? '🌙' : '☀️'}
                                </span>
                            </span>
                        </button>
                    </div>

                    {/* Учет пользователей (только для админа) */}
                    {isAdmin && !isGuest && (
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="flex items-center justify-between w-full p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👤</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">Администрирование</span>
                            </div>
                            <span className="text-red-500">→</span>
                        </button>
                    )}

                    {/* О приложении */}
                    <button
                        onClick={handleAbout}
                        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">О приложении</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </div>

                {/* Кнопки действий */}
                <div className="space-y-4">
                    {!isGuest && (
                        <Button
                            onClick={handleChangePassword}
                            variant="secondary"
                            fullWidth
                            className="!bg-green-50 dark:!bg-green-900/20 !text-green-600 dark:!text-green-400 !border-green-300 dark:!border-green-700 hover:!bg-green-100 dark:hover:!bg-green-900/30"
                        >
                            Сменить пароль
                        </Button>
                    )}
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                        fullWidth
                        className="!bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400 !border-red-300 dark:!border-red-700 hover:!bg-red-100 dark:hover:!bg-red-900/30"
                    >
                        Выйти из профиля
                    </Button>
                </div>

                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSubmit={handlePasswordSubmit}
                />
            </div>
        </div>
    );
};

export default SettingsPage;
