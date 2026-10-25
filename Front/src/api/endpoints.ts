import {
    Ingredient,
    Dish,
    PaginationParams,
    PaginatedResponse,
    ApiResponse,
    Allergen
} from '@/shared/types/api';
import { api } from './client';

// Auth API
export const authApi = {
    login: (email: string, password: string) => api.login({ email, password }),
    register: (email: string, password: string, passwordConfirm: string, acceptPrivacyPolicy: boolean) =>
        api.register({ email, password, passwordConfirm, acceptPrivacyPolicy }),
    logout: () => api.logout(),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.changePassword(currentPassword, newPassword),
};

// Ingredients API
export const ingredientsApi = {
    getList: async (params?: PaginationParams & { search?: string }) => {
        return api.fetch<PaginatedResponse<Ingredient>>('/ingredients', {
            method: 'GET',
            params
        });
    },

    getById: async (id: number) => {
        return api.fetch<ApiResponse<Ingredient>>(`/ingredients/${id}`, {
            method: 'GET'
        });
    },

    create: async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
        return api.fetch<ApiResponse<{ id: number }>>('/ingredients', {
            method: 'POST',
            body: JSON.stringify(ingredient)
        });
    },

    update: async (id: number, ingredient: Partial<Ingredient>) => {
        return api.fetch<ApiResponse<Ingredient>>(`/ingredients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(ingredient)
        });
    },

    delete: async (id: number) => {
        return api.fetch<void>(`/ingredients/${id}`, {
            method: 'DELETE'
        });
    },

    search: async (query: string) => {
        return api.fetch<PaginatedResponse<Ingredient>>('/ingredients', {
            method: 'GET',
            params: { search: query, limit: 10 }
        });
    }
};

// Dishes API
export const dishesApi = {
    getList: async (params?: PaginationParams & { difficulty?: 'easy' | 'medium' | 'hard' }) => {
        return api.fetch<PaginatedResponse<Dish>>('/dishes', {
            method: 'GET',
            params
        });
    },

    getFavorites: async () => {
        return api.fetch<ApiResponse<Dish[]>>('/dishes/favorites', {
            method: 'GET'
        });
    },

    getById: async (id: number) => {
        return api.fetch<ApiResponse<Dish>>(`/dishes/${id}`, {
            method: 'GET'
        });
    },

    create: async (dish: {
        name: string;
        portions?: number;
        description?: string;
        instructions: string;
        cooking_time: number;
        difficulty_level: 'easy' | 'medium' | 'hard';
        portion_size: number;
        ingredients: Array<{ id: number; quantity: number }>
    }) => {
        return api.fetch<ApiResponse<{ id: number }>>('/dishes', {
            method: 'POST',
            body: JSON.stringify(dish)
        });
    },

    update: async (id: number, dish: Partial<Dish>) => {
        return api.fetch<ApiResponse<Dish>>(`/dishes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dish)
        });
    },

    delete: async (id: number) => {
        return api.fetch<void>(`/dishes/${id}`, {
            method: 'DELETE'
        });
    },

    calculateCost: async (id: number, portions: number) => {
        return api.fetch<ApiResponse<{
            totalCost: number;
            costPerPortion: number;
            breakdown: Array<{
                ingredientId: number;
                name: string;
                quantity: number;
                cost: number;
            }>;
        }>>(`/dishes/${id}/cost`, {
            method: 'GET',
            params: { portions }
        });
    },

    generateLabel: async (id: number, params: { weight: number; manufactureDate: string; shelfLife: number }) => {
        return api.fetch<Blob>(`/dishes/${id}/label`, {
            method: 'GET',
            params,
            responseType: 'blob'
        });
    },

    addToFavorites: async (id: number) => {
        return api.fetch<ApiResponse<void>>(`/dishes/${id}/favorite`, {
            method: 'POST'
        });
    },

    removeFromFavorites: async (id: number) => {
        return api.fetch<ApiResponse<void>>(`/dishes/${id}/favorite`, {
            method: 'DELETE'
        });
    }
};

// Allergens API (если есть endpoint)
export const allergensApi = {
    getByIngredient: async (ingredientId: number) => {
        return api.fetch<ApiResponse<Allergen[]>>(`/ingredients/${ingredientId}/allergens`, {
            method: 'GET'
        });
    }
};

// Favorites API (если нужно)
export const favoritesApi = {
    getList: async () => {
        return api.fetch<ApiResponse<Dish[]>>('/favorites', {
            method: 'GET'
        });
    },

    add: async (dishId: number) => {
        return api.fetch<ApiResponse<void>>('/favorites', {
            method: 'POST',
            body: JSON.stringify({ dishId })
        });
    },

    remove: async (dishId: number) => {
        return api.fetch<void>(`/favorites/${dishId}`, {
            method: 'DELETE'
        });
    }
};

// Custom Dishes API - для пользовательских блюд из калькулятора себестоимости
export interface CustomDishIngredient {
    id?: number;
    name: string;
    weight: number;
    unit: string;
    pricePerUnit: number;
}

export interface CustomDish {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    portions: number;
    ingredients: CustomDishIngredient[];
    ingredients_json?: string;
    cost_per_portion: number;
    total_cost: number;
    created_at: string;
    updated_at?: string;
}

export const customDishesApi = {
    // Получить все блюда пользователя
    getList: async (search?: string) => {
        return api.fetch<ApiResponse<CustomDish[]>>('/custom-dishes', {
            method: 'GET',
            params: search ? { search } : undefined
        });
    },

    // Получить блюдо по ID
    getById: async (id: number) => {
        return api.fetch<ApiResponse<CustomDish>>(`/custom-dishes/${id}`, {
            method: 'GET'
        });
    },

    // Создать новое блюдо
    create: async (dish: {
        name: string;
        description?: string;
        portions: number;
        ingredients: CustomDishIngredient[];
        cost_per_portion: number;
        total_cost: number;
    }) => {
        return api.fetch<ApiResponse<CustomDish>>('/custom-dishes', {
            method: 'POST',
            body: JSON.stringify(dish)
        });
    },

    // Обновить блюдо
    update: async (id: number, dish: {
        name?: string;
        description?: string;
        portions?: number;
        ingredients?: CustomDishIngredient[];
        cost_per_portion?: number;
        total_cost?: number;
    }) => {
        return api.fetch<ApiResponse<CustomDish>>(`/custom-dishes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dish)
        });
    },

    // Удалить блюдо
    delete: async (id: number) => {
        return api.fetch<ApiResponse<void>>(`/custom-dishes/${id}`, {
            method: 'DELETE'
        });
    },

    // Сгенерировать этикетку для блюда
    generateLabel: async (id: number, params: { weight: number; manufactureDate: string; shelfLife: number }) => {
        return api.fetch<Blob>(`/custom-dishes/${id}/label`, {
            method: 'GET',
            params,
            responseType: 'blob'
        });
    }
};

// Admin API
export interface AdminUser {
    id: number;
    email: string;
    fullName: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export const adminApi = {
    // Получить список всех пользователей
    getUsers: async () => {
        return api.fetch<ApiResponse<AdminUser[]>>('/admin/users', {
            method: 'GET'
        });
    },

    // Получить пользователя по ID
    getUserById: async (id: number) => {
        return api.fetch<ApiResponse<AdminUser>>(`/admin/users/${id}`, {
            method: 'GET'
        });
    },

    // Изменить роль пользователя
    updateUserRole: async (id: number, role: 'user' | 'admin') => {
        return api.fetch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        });
    },

    // Изменить пароль пользователя (только для админа)
    updateUserPassword: async (id: number, newPassword: string) => {
        return api.fetch<ApiResponse<void>>(`/admin/users/${id}/password`, {
            method: 'PATCH',
            body: JSON.stringify({ newPassword })
        });
    },

    // Изменить имя пользователя (только для админа)
    updateUserName: async (id: number, fullName: string) => {
        return api.fetch<ApiResponse<AdminUser>>(`/admin/users/${id}/name`, {
            method: 'PATCH',
            body: JSON.stringify({ fullName })
        });
    },

    // Изменить данные пользователя (имя и/или пароль)
    updateUserData: async (id: number, data: { fullName?: string; newPassword?: string }) => {
        return api.fetch<ApiResponse<AdminUser>>(`/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    // Удалить пользователя
    deleteUser: async (id: number) => {
        return api.fetch<ApiResponse<void>>(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    // Получить статистику пользователей
    getUsersStats: async () => {
        return api.fetch<ApiResponse<any>>('/admin/stats/users', {
            method: 'GET'
        });
    }
};