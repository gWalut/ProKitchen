import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { authApi } from '@/api/endpoints';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useSEO } from '@/shared/hooks/useSEO';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useSEO({
        title: 'Вход в аккаунт',
        description: 'Войдите в ProKitchen — профессиональный ассистент повара.',
        noIndex: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authApi.login(email, password);
            // Принудительно обновляем страницу после успешного логина
            window.location.href = '/main';
        } catch (err: any) {
            setError(err?.message || 'Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Декоративные элементы */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            {/* Кнопка смены темы */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
                aria-label="Переключить тему"
            >
                <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-10">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-br from-brand-400 to-purple-500 rounded-2xl shadow-lg mb-4">
                            <span className="text-5xl">👨‍🍳</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">Вход в аккаунт</h1>
                        <p className="text-gray-600 dark:text-gray-400">Добро пожаловать обратно!</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Электронная почта</label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" required />
                        </div>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-3 animate-shake">
                                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                            </div>
                        )}
                        <Button type="submit" variant="primary" fullWidth loading={isLoading}>Войти</Button>
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                // Очищаем все токены и данные авторизации
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                // Устанавливаем флаг гостевого режима
                                localStorage.setItem('guestMode', 'true');
                                // Принудительно обновляем страницу чтобы очистить состояние
                                window.location.href = '/main';
                            }}
                        >
                            Войти как гость
                        </Button>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">или</span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">Нет аккаунта? <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold">Зарегистрироваться</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;