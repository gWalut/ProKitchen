import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { authReducer, initialState, AuthState } from './authReducer';
import { api, ApiClient } from '@/api/client';
import { LoginRequest, RegisterRequest } from '@/shared/types/api';

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshInProgress: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initializeAuth = async () => {
            const hasTokens = await api.initialize();
            if (hasTokens) {
                // Токены есть - создаем фиктивного пользователя из токена
                // TODO: Добавить endpoint /user/profile на backend для получения реальных данных
                try {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        // Очищаем флаг гостевого режима если есть валидный токен
                        localStorage.removeItem('guestMode');

                        // Парсим JWT токен чтобы получить данные пользователя
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        dispatch({
                            type: 'AUTH_SUCCESS',
                            payload: {
                                user: {
                                    id: payload.userId,
                                    email: payload.email,
                                    name: payload.email.split('@')[0],
                                    role: payload.role || 'user'
                                }
                            }
                        });
                        return;
                    }
                } catch (error) {
                    console.warn('Failed to parse token:', error);
                }
            }
            // Токенов нет или не удалось распарсить
            // Не вызываем AUTH_FAILURE, просто оставляем как есть
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const { data } = await api.login(credentials);

            // Очищаем флаг гостевого режима при успешном логине
            localStorage.removeItem('guestMode');

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: data.user }
            });
        } catch (error) {
            dispatch({
                type: 'AUTH_FAILURE',
                payload: error instanceof Error ? error.message : 'Ошибка входа'
            });
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await api.register(data);

            // Очищаем флаг гостевого режима при успешной регистрации
            localStorage.removeItem('guestMode');

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: response.data.user }
            });
        } catch (error) {
            dispatch({
                type: 'AUTH_FAILURE',
                payload: error instanceof Error ? error.message : 'Ошибка регистрации'
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } finally {
            dispatch({ type: 'AUTH_LOGOUT' });
        }
    }; return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                refreshInProgress: api instanceof ApiClient && api['refreshPromise'] !== null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};