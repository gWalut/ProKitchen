const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db-universal');

class AllergensModel extends BaseModel {
    constructor() {
        super('allergens', ['name', 'description']);
    }

    async create(data) {
        const result = await db.run(
            'INSERT INTO allergens (name, description) VALUES (?, ?)',
            [data.name, data.description || null]
        );
        return result.lastID;
    }

    async update(id, data) {
        const result = await db.run(
            'UPDATE allergens SET name = ?, description = ? WHERE id = ?',
            [data.name, data.description || null, id]
        );
        if (result.changes === 0) {
            throw new Error(`Allergen with id ${id} not found`);
        }
        return result;
    }

    async getAll() {
        return await db.all('SELECT * FROM allergens ORDER BY name');
    }

    async getById(id) {
        return await db.get('SELECT * FROM allergens WHERE id = ?', [id]);
    }

    async getForIngredient(ingredientId) {
        return await db.all(
            `SELECT a.*
             FROM allergens a
             JOIN ingredient_allergens ia ON a.id = ia.allergen_id
             WHERE ia.ingredient_id = ?`,
            [ingredientId]
        );
    }

    async addToIngredient(ingredientId, allergenId) {
        return await db.run(
            'INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES (?, ?)',
            [ingredientId, allergenId]
        );
    }

    async removeFromIngredient(ingredientId, allergenId) {
        return await db.run(
            'DELETE FROM ingredient_allergens WHERE ingredient_id = ? AND allergen_id = ?',
            [ingredientId, allergenId]
        );
    }
}

module.exports = new AllergensModel();