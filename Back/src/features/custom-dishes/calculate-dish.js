const { ValidationError } = require('../../shared/utils/errors');

// Stored costs always follow the ingredients, never client-supplied totals.
module.exports = function calculateDish(data) {
    const { name, portions = 1, ingredients } = data;
    if (typeof name !== 'string' || !name.trim() || !Number.isInteger(portions) || portions < 1 ||
        !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new ValidationError('Укажите название, целое число порций и ингредиенты');
    }
    for (const ingredient of ingredients) {
        if (typeof ingredient.name !== 'string' || !ingredient.name.trim() ||
            typeof ingredient.unit !== 'string' || !ingredient.unit.trim() ||
            !Number.isFinite(ingredient.weight) || ingredient.weight <= 0 ||
            !Number.isFinite(ingredient.pricePerUnit) || ingredient.pricePerUnit < 0) {
            throw new ValidationError('Укажите название, единицу, положительное количество и неотрицательную цену ингредиента');
        }
    }
    const total = ingredients.reduce((sum, ing) => sum + ing.weight * ing.pricePerUnit, 0);
    if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER / 100) {
        throw new ValidationError('Стоимость блюда слишком велика');
    }
    const totalCost = Math.round(total * 100) / 100;
    return {
        ...data,
        name: name.trim(),
        portions,
        total_cost: totalCost,
        cost_per_portion: Math.round(totalCost / portions * 100) / 100
    };
};
