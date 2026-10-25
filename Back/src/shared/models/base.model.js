const db = require('../database/db');
const { NotFoundError } = require('../utils/errors');

class BaseModel {
    constructor(tableName, searchFields = []) {
        this.tableName = tableName;
        this.searchFields = searchFields;
        this.db = db;
    }

    async getById(id) {
        const item = await db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        if (!item) {
            throw new NotFoundError(`${this.tableName} with id ${id} not found`);
        }
        return item;
    }

    async list() {
        return await db.all(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    }

    async delete(id) {
        const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        if (result.changes === 0) {
            throw new NotFoundError(`${this.tableName} with id ${id} not found`);
        }
        return result;
    }

    async search(query) {
        if (!this.searchFields.length) return [];

        const searchQuery = this.searchFields
            .map(field => `${field} LIKE ?`)
            .join(' OR ');

        const searchPattern = `%${query}%`;
        const params = new Array(this.searchFields.length).fill(searchPattern);

        return await db.all(
            `SELECT * FROM ${this.tableName} WHERE ${searchQuery} ORDER BY created_at DESC`,
            params
        );
    }
}

module.exports = BaseModel;