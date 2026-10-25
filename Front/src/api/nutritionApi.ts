/**
 * Клиентский API-слой для работы с нутритивными данными.
 * Все запросы идут через /api/v1/nutrition (проксируются на бэкенд).
 */
import axios from 'axios';

const BASE = '/api/v1/nutrition';

export interface NutrientValue {
    amount: number;
    unit: string;
}

export interface NutritionData {
    id: number;
    name: string;
    calories: NutrientValue | null;
    protein: NutrientValue | null;
    fat: NutrientValue | null;
    carbohydrates: NutrientValue | null;
    fiber: NutrientValue | null;
    sugar: NutrientValue | null;
    unit: string;
    image: string | null;
}

export interface NutritionApiResult {
    data: NutritionData | null;
    /** true — данные получены, false — API недоступен */
    available: boolean;
    /** Сообщение об ошибке если available === false */
    errorMessage?: string;
}

/**
 * Получить нутритивные данные одного ингредиента по названию (100 г).
 */
export async function fetchNutritionByName(name: string): Promise<NutritionApiResult> {
    try {
        const res = await axios.get<{ data: NutritionData }>(`${BASE}/ingredient`, {
            params: { name },
            timeout: 8_000,
        });
        return { data: res.data.data, available: true };
    } catch (err: any) {
        if (err?.response?.status === 503) {
            return {
                data: null,
                available: false,
                errorMessage: 'Сервис питательных данных временно недоступен',
            };
        }
        if (err?.response?.status === 404) {
            return { data: null, available: true };
        }
        // Таймаут или сеть
        return {
            data: null,
            available: false,
            errorMessage: 'Не удалось получить данные о питательной ценности',
        };
    }
}

/**
 * Получить нутритивные данные для нескольких ингредиентов.
 */
export async function fetchBulkNutrition(
    names: string[]
): Promise<{ data: (NutritionData | null)[]; available: boolean; errorMessage?: string }> {
    try {
        const res = await axios.post<{ data: (NutritionData | null)[]; available: boolean }>(
            `${BASE}/bulk`,
            { names },
            { timeout: 30_000 }
        );
        return res.data;
    } catch (err: any) {
        if (err?.response?.status === 503) {
            return {
                data: names.map(() => null),
                available: false,
                errorMessage: 'Сервис питательных данных временно недоступен',
            };
        }
        return {
            data: names.map(() => null),
            available: false,
            errorMessage: 'Ошибка при получении данных',
        };
    }
}
