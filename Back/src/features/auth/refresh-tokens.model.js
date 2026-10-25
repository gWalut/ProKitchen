const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');

class RefreshTokensModel extends BaseModel {
    constructor() {
        super('refresh_tokens');
    }

    async create(data) {
        const sql = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES (?, ?, ?)
        `;
        const result = await db.run(sql, [
            data.user_id,
            data.token,
            data.expires_at
        ]);
        return result.lastInsertRowid;
    }

    async deleteToken(token) {
        const sql = 'DELETE FROM refresh_tokens WHERE token = ?';
        return await db.run(sql, [token]);
    }

    async deleteUserTokens(userId) {
        const sql = 'DELETE FROM refresh_tokens WHERE user_id = ?';
        return await db.run(sql, [userId]);
    }

    async findValidToken(token) {
        const sql = `
            SELECT rt.*, u.email, u.role 
            FROM refresh_tokens rt
            JOIN users u ON rt.user_id = u.id
            WHERE rt.token = ? AND rt.expires_at > datetime('now')
        `;
        return await db.get(sql, [token]);
    }

    async cleanupExpired() {
        const sql = `
            DELETE FROM refresh_tokens 
            WHERE expires_at <= datetime('now')
        `;
        return await db.run(sql);
    }
}

module.exports = new RefreshTokensModel();