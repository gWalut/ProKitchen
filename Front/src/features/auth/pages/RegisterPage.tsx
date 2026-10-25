import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { authApi } from '@/api/endpoints';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useSEO } from '@/shared/hooks/useSEO';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useSEO({
        title: 'Регистрация',
        description: 'Создайте аккаунт ProKitchen и получите доступ ко всем функциям ассистента повара.',
        noIndex: true,
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        passwordConfirm?: string;
        acceptPrivacyPolicy?: string;
        general?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        // Валидация email
        if (!email) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email должен быть корректным';
        }

        // Валидация пароля
        if (!password) {
            newErrors.password = 'Пароль обязателен';
        } else if (password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
        }

        // Валидация подтверждения пароля
        if (!passwordConfirm) {
            newErrors.passwordConfirm = 'Подтверждение пароля обязательно';
        } else if (password !== passwordConfirm) {
            newErrors.passwordConfirm = 'Пароли не совпадают';
        }

        // Валидация согласия с политикой
        if (!acceptPrivacyPolicy) {
            newErrors.acceptPrivacyPolicy = 'Необходимо принять политику конфиденциальности';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Валидация на клиенте
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await authApi.register(email, password, passwordConfirm, acceptPrivacyPolicy);
            window.location.href = '/main';
        } catch (err: any) {
            if (err?.status === 400 && err?.message) {
                setErrors({ general: err.message });
            } else if (err?.message?.includes('email')) {
                setErrors({ email: err.message });
            } else if (err?.message?.includes('пароль') || err?.message?.includes('password')) {
                setErrors({ password: err.message });
            } else {
                setErrors({ general: err?.message || 'Ошибка регистрации. Попробуйте снова.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                aria-label="Переключить тему"
            >
                <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>

            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                        Создание аккаунта
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
                        Зарегистрируйтесь, чтобы начать использовать CookAssistent
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            type="email"
                            label="Электронная почта"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            error={errors.email}
                            required
                            autoComplete="email"
                        />

                        <Input
                            type="password"
                            label="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 8 символов"
                            error={errors.password}
                            required
                            autoComplete="new-password"
                        />

                        <Input
                            type="password"
                            label="Подтвердите пароль"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Повторите пароль"
                            error={errors.passwordConfirm}
                            required
                            autoComplete="new-password"
                        />

                        <div className="flex items-start">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="accept-privacy"
                                    type="checkbox"
                                    checked={acceptPrivacyPolicy}
                                    onChange={(e) => setAcceptPrivacyPolicy(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2"
                                />
                            </div>
                            <label htmlFor="accept-privacy" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                Я принимаю{' '}
                                <Link
                                    to="/privacy"
                                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline"
                                >
                                    политику конфиденциальности
                                </Link>
                            </label>
                        </div>
                        {errors.acceptPrivacyPolicy && (
                            <p className="text-sm text-red-600 dark:text-red-400 -mt-3">{errors.acceptPrivacyPolicy}</p>
                        )}

                        {errors.general && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>
                            </div>
                        )}

                        <Button type="submit" variant="primary" fullWidth loading={isLoading}>
                            Зарегистрироваться
                        </Button>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                            Уже есть аккаунт?{' '}
                            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                                Войти
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
