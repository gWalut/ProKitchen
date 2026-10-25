const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');

class IngredientsModel extends BaseModel {
    constructor() {
        super('ingredients', ['name', 'description']);
    }

    async create(data) {
        const result = await db.run(
            `INSERT INTO ingredients (
                name, description, unit, price_per_unit, 
                calories_per_unit, stock_quantity, minimum_stock_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.description,
                data.unit,
                data.price_per_unit,
                data.calories_per_unit,
                data.stock_quantity || 0,
                data.minimum_stock_level || 0
            ]
        );
        return result.lastInsertRowid;
    }

    async list(limit = 20, offset = 0) {
        return await db.all(
            `SELECT * FROM ingredients ORDER BY name LIMIT ? OFFSET ?`,
            [limit, offset]
        );
    }

    async count() {
        const result = await db.get('SELECT COUNT(*) as count FROM ingredients');
        return result.count;
    }

    async update(id, data) {
        const fields = [];
        const values = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
        if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit); }
        if (data.price_per_unit !== undefined) { fields.push('price_per_unit = ?'); values.push(data.price_per_unit); }
        if (data.calories_per_unit !== undefined) { fields.push('calories_per_unit = ?'); values.push(data.calories_per_unit); }
        if (data.stock_quantity !== undefined) { fields.push('stock_quantity = ?'); values.push(data.stock_quantity); }
        if (data.minimum_stock_level !== undefined) { fields.push('minimum_stock_level = ?'); values.push(data.minimum_stock_level); }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const result = await db.run(
            `UPDATE ingredients SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        if (result.changes === 0) {
            throw new Error(`Ingredient with id ${id} not found`);
        }
        return result;
    }

    async updateStockQuantity(id, quantity) {
        const result = await db.run(
            `UPDATE ingredients SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [quantity, id]
        );
        if (result.changes === 0) {
            throw new Error(`Ingredient with id ${id} not found`);
        }
        return result;
    }

    async getLowStockIngredients() {
        return await db.all(
            `SELECT * FROM ingredients 
            WHERE stock_quantity <= minimum_stock_level
            ORDER BY (minimum_stock_level - stock_quantity) DESC`
        );
    }

    async search(query, limit = 20) {
        const searchQuery = `%${query}%`;
        return await db.all(
            `SELECT * FROM ingredients 
            WHERE name LIKE ? OR description LIKE ?
            ORDER BY name
            LIMIT ?`,
            [searchQuery, searchQuery, limit]
        );
    }
}

module.exports = new IngredientsModel();