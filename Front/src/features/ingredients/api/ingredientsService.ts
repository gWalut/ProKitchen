import { api } from '@/api/client';
import { Ingredient, Allergen, ApiResponse } from '@/shared/types/api';

export const ingredientsService = {
    async search(query: string): Promise<Ingredient[]> {
        const response = await api.fetch<ApiResponse<{ items: Ingredient[] }>>('/ingredients/search', { params: { query } });
        return response.data.items;
    },
    async getById(id: number): Promise<Ingredient> {
        return (await api.fetch<ApiResponse<Ingredient>>(`/ingredients/${id}`)).data;
    },
    async getAllergens(id: number): Promise<string[]> {
        const ingredient = await this.getById(id);
        return (ingredient.allergens ?? []).map(allergen => allergen.name);
    },
    async addAllergen(id: number, name: string): Promise<void> {
        const [ingredient, allergens] = await Promise.all([
            this.getById(id), api.fetch<ApiResponse<Allergen[]>>('/allergens')
        ]);
        const allergen = allergens.data.find(item => item.name.toLocaleLowerCase('ru') === name.trim().toLocaleLowerCase('ru'));
        if (!allergen) throw new Error('Аллерген не найден в справочнике');
        await api.fetch(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify({
            allergens: [...new Set([...(ingredient.allergens ?? []).map(item => item.id), allergen.id])]
        }) });
    }
};
