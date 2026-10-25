const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');

class ActionLogsModel extends BaseModel {
    constructor() {
        super('action_logs', ['action_type', 'entity_type']);
    }

    async log(data) {
        const sql = `
            INSERT INTO action_logs (
                user_id, action_type, entity_type, 
                entity_id, details
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const result = await db.run(sql, [
            data.userId,
            data.actionType,
            data.entityType,
            data.entityId,
            JSON.stringify(data.details || {})
        ]);

        return result.lastInsertRowid;
    }

    async getUserHistory(userId, limit = 50, offset = 0) {
        const sql = `
            SELECT * FROM action_logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        return await db.all(sql, [userId, limit, offset]);
    }

    async getEntityHistory(entityType, entityId, limit = 50, offset = 0) {
        const sql = `
            SELECT * FROM action_logs
            WHERE entity_type = ? AND entity_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        return await db.all(sql, [entityType, entityId, limit, offset]);
    }
}

module.exports = new ActionLogsModel();