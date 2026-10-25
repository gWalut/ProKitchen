import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useSEO } from '@/shared/hooks/useSEO';

export const HelloPage = () => {
    const navigate = useNavigate();

    useSEO({
        title: 'ProKitchen — Ассистент повара',
        description: 'ProKitchen — профессиональный помощник повара: калькулятор себестоимости блюд, матрица аллергенов, печать этикеток и управление рецептами.',
        canonical: 'https://prokitchen.app/',
        ogType: 'website',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ProKitchen',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
            description: 'Профессиональный ассистент повара: калькулятор себестоимости, аллергены, этикетки.',
            inLanguage: 'ru',
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Иконка повара */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-brand-500 dark:bg-brand-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-5xl" role="img" aria-label="Повар">👨‍🍳</span>
                    </div>
                </div>

                {/* Логотип и название */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-brand-600 dark:text-brand-400">ProKitchen</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Ассистент повара</p>
                </div>

                {/* Слоган */}
                <div className="py-4">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        Ваш цифровой помощник на кухне — все в одном приложении.
                    </p>
                </div>

                {/* Кнопки */}
                <div className="space-y-4 pt-4">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate('/login')}
                        className="min-h-[52px] text-base"
                    >
                        Вход
                    </Button>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => navigate('/register')}
                        className="min-h-[52px] text-base"
                    >
                        Регистрация
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HelloPage;