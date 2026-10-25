import { api } from './client';
import { Ingredient, IngredientSearchResult } from '@/shared/types/api';

export const ingredientsService = {
    // Search ingredients by query string
    async search(query: string): Promise<IngredientSearchResult[]> {
        throw new Error('Not implemented');
    },

    // Get ingredient details by ID
    async getById(id: number): Promise<Ingredient> {
        throw new Error('Not implemented');
    },

    // Get ingredient allergens
    async getAllergens(id: number): Promise<string[]> {
        throw new Error('Not implemented');
    },

    // Add allergen to ingredient
    async addAllergen(id: number, allergen: string): Promise<void> {
        throw new Error('Not implemented');
    }
};