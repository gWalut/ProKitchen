import { User } from '@/shared/types/api';

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User } }
    | { type: 'AUTH_FAILURE'; payload?: string }
    | { type: 'AUTH_LOGOUT' };

export const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
}; export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                loading: false,
                error: null,
                isAuthenticated: true
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload ?? 'Произошла ошибка',
                user: null,
                isAuthenticated: false
            };
        case 'AUTH_LOGOUT':
            return initialState;
        default:
            return state;
    }
};