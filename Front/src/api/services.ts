import { api } from './client';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    UserSettings,
    ListParams,
    PaginatedResponse,
    Ingredient,
    Allergen,
    Dish,
    CreateDishRequest,
    CalculationResult,
    LabelPreviewRequest,
    Label,
    Favorite,
    Action
} from '@/shared/types/api';

// Auth API
export const authApi = {
    register: (data: RegisterRequest) =>
        api.fetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    login: (data: LoginRequest) =>
        api.fetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    refresh: (refreshToken: string) =>
        api.fetch<AuthResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        }),

    logout: (refreshToken: string) =>
        api.fetch<void>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        })
};

// User API
export const userApi = {
    getProfile: () =>
        api.fetch<User>('/user'),

    updateSettings: (settings: UserSettings) =>
        api.fetch<User>('/user/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings)
        })
};

// Ingredients API
export const ingredientsApi = {
    getList: (params?: ListParams) =>
        api.fetch<PaginatedResponse<Ingredient>>('/ingredients', {
            method: 'GET',
            params
        }),

    getById: (id: number) =>
        api.fetch<Ingredient>(`/ingredients/${id}`),

    create: (data: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) =>
        api.fetch<Ingredient>('/ingredients', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    update: (id: number, data: Partial<Ingredient>) =>
        api.fetch<Ingredient>(`/ingredients/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
};

// Allergens API
export const allergensApi = {
    getList: () =>
        api.fetch<Allergen[]>('/allergens'),

    create: (data: Omit<Allergen, 'id'>) =>
        api.fetch<Allergen>('/allergens', {
            method: 'POST',
            body: JSON.stringify(data)
        })
};

// Dishes API
export const dishesApi = {
    create: (data: CreateDishRequest) =>
        api.fetch<Dish>('/dishes', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    getList: (params?: ListParams) =>
        api.fetch<PaginatedResponse<Dish>>('/dishes', {
            method: 'GET',
            params
        }),

    getById: (id: number) =>
        api.fetch<Dish>(`/dishes/${id}`),

    update: (id: number, data: Partial<CreateDishRequest>) =>
        api.fetch<Dish>(`/dishes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),

    delete: (id: number) =>
        api.fetch<void>(`/dishes/${id}`, {
            method: 'DELETE'
        }),

    calculate: (id: number, portions?: number) =>
        api.fetch<CalculationResult>(`/dishes/${id}/calculate`, {
            method: 'POST',
            body: JSON.stringify({ portions })
        }),

    calculateAdhoc: (composition: CreateDishRequest) =>
        api.fetch<CalculationResult>('/calculate', {
            method: 'POST',
            body: JSON.stringify(composition)
        })
};

// Favorites API
export const favoritesApi = {
    add: (dishId: number) =>
        api.fetch<void>('/favorites', {
            method: 'POST',
            body: JSON.stringify({ dish_id: dishId })
        }),

    getList: () =>
        api.fetch<PaginatedResponse<Favorite>>('/favorites'),

    delete: (id: number) =>
        api.fetch<void>(`/favorites/${id}`, {
            method: 'DELETE'
        })
};

// Labels API
export const labelsApi = {
    preview: (data: LabelPreviewRequest) =>
        api.fetch<Blob>('/labels/preview', {
            method: 'POST',
            body: JSON.stringify(data),
            responseType: 'blob'
        }),

    getById: (id: number) =>
        api.fetch<Label>(`/labels/${id}`)
};

// Actions API
export const actionsApi = {
    getList: (limit?: number) =>
        api.fetch<PaginatedResponse<Action>>('/actions', {
            method: 'GET',
            params: { limit }
        })
};