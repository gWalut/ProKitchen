import { Link } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/Button';

export const TopBar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex-shrink-0">
                        <Logo />
                    </Link>

                    <nav className="hidden md:flex space-x-8">
                        <Link
                            to="/calculator"
                            className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        >
                            Калькулятор
                        </Link>
                        <Link
                            to="/matrix"
                            className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        >
                            Матрица
                        </Link>
                        <Link
                            to="/favorites"
                            className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        >
                            Избранное
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-500">{user.email}</span>
                                <Button variant="ghost" size="sm" onClick={logout}>
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="sm">
                                    Войти
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};