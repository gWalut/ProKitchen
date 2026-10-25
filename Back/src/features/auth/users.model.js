const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');
const { NotFoundError } = require('../../shared/utils/errors');

class UsersModel extends BaseModel {
    constructor() {
        super('users', ['email', 'full_name']);
    }

    async create(userData) {
        const sql = `
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        `;
        const result = await db.run(sql, [
            userData.email,
            userData.password_hash,
            userData.full_name,
            userData.role
        ]);
        return result.lastInsertRowid;
    }

    async update(id, userData) {
        const sql = `
            UPDATE users 
            SET email = ?, 
                full_name = ?,
                role = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(sql, [
            userData.email,
            userData.full_name,
            userData.role,
            id
        ]);
        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }

    async partialUpdate(id, userData) {
        const fields = [];
        const values = [];

        if (userData.email !== undefined) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        if (userData.full_name !== undefined) {
            fields.push('full_name = ?');
            values.push(userData.full_name);
        }
        if (userData.role !== undefined) {
            fields.push('role = ?');
            values.push(userData.role);
        }
        if (userData.password_hash !== undefined) {
            fields.push('password_hash = ?');
            values.push(userData.password_hash);
        }

        if (fields.length === 0) {
            return { changes: 0 };
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const result = await db.run(sql, values);

        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }

    async updatePassword(id, passwordHash) {
        const sql = `
            UPDATE users 
            SET password_hash = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(sql, [passwordHash, id]);
        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }

    async getByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return await db.get(sql, [email]) || null;
    }

    async getAll() {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC';
        return await db.all(sql);
    }

    async updateRole(id, role) {
        const sql = `
            UPDATE users 
            SET role = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(sql, [role, id]);
        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }

    async updatePassword(id, hashedPassword) {
        const sql = `
            UPDATE users 
            SET password_hash = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(sql, [hashedPassword, id]);
        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }

    async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await db.run(sql, [id]);
        if (result.changes === 0) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return result;
    }
}

module.exports = new UsersModel();