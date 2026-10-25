import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials: { email: string; password: string }) => {
        try {
            await login(credentials);
            navigate('/calculator');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Войти в систему
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <LoginForm onSubmit={handleLogin} />
                    <div className="mt-6">
                        <div className="text-sm">
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Ещё нет аккаунта? Зарегистрироваться
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};