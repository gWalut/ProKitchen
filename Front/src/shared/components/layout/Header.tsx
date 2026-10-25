import { useAuth } from '@/features/auth/context/AuthContext';
import { Link } from 'react-router-dom';

export const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-xl font-semibold text-primary-600">
                        ProKitchen
                    </Link>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    {user.name}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Войти
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};