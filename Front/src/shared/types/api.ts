// API Response типы
export interface ApiResponse<T = any> {
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export interface ListParams {
    q?: string;
    limit?: number;
    offset?: number;
}

export interface PaginationParams {
    limit?: number;
    offset?: number;
}// Аутентификация
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface TokenResponse {
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    passwordConfirm: string;
    acceptPrivacyPolicy: boolean;
}

export interface User {
    id: number;
    email: string;
    name?: string;
    role?: 'user' | 'admin';
    settings?: UserSettings;
}

export interface UserSettings {
    theme?: 'light' | 'dark';
    language?: string;
    // другие настройки пользователя
}

// Ингредиенты и Аллергены
export interface Ingredient {
    id: number;
    name: string;
    description?: string;
    unit: 'г' | 'кг' | 'мл' | 'л' | 'шт' | 'уп';
    price_per_unit: number;
    allergens?: Allergen[];
    created_at: string;
    updated_at: string;
}

export interface Allergen {
    id: number;
    name: string;
    description?: string;
}

// Блюда
export interface Dish {
    id: number;
    name: string;
    portions: number;
    notes?: string;
    totalCost?: number;
    portionCost?: number;
    isFavorite?: boolean;
    ingredients: {
        ingredient_id: number;
        quantity: number;
        price_at_time?: number;
    }[];
    created_at: string;
    updated_at: string;
}

export interface CreateDishRequest {
    name: string;
    portions: number;
    notes?: string;
    ingredients: {
        ingredient_id: number;
        quantity: number;
        price_at_time?: number;
    }[];
}

export interface CalculationResult {
    total_cost: number;
    cost_per_portion: number;
    breakdown: Array<{
        ingredient_id: number;
        name: string;
        quantity: number;
        cost: number;
    }>;
}

// Избранное и Этикетки
export interface Favorite {
    id: number;
    dish_id: number;
    user_id: number;
    dish: Dish;
}

export interface LabelPreviewRequest {
    dish_id: number;
    weight_g: number;
    production_date: string;
    expiry_date: string;
}

export interface Label {
    id: number;
    dish_id: number;
    weight_g: number;
    production_date: string;
    expiry_date: string;
    created_at: string;
}

// История действий
export interface Action {
    id: number;
    user_id: number;
    action_type: string;
    entity_type: 'user' | 'dish' | 'ingredient' | 'allergen';
    entity_id: number;
    details: Record<string, any>;
    created_at: string;
}