const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');

// Константа для общего user_id для всех авторизованных пользователей (кроме guest)
const SHARED_FAVORITES_USER_ID = 0;

class FavoritesModel extends BaseModel {
    constructor() {
        super('favorites');
    }

    /**
     * Определяет, какой user_id использовать для избранного
     * Для неавторизованных пользователей (guest) используется их реальный ID (если он есть)
     * Для всех остальных авторизованных - общий ID (0)
     */
    _getFavoritesUserId(userId, userRole) {
        // Если роль не передана или это авторизованный пользователь - используем общий ID
        // guest пользователи не авторизованы, поэтому сюда не попадут
        return SHARED_FAVORITES_USER_ID;
    }

    async addFavorite(userId, dishId, userRole = null) {
        const favoritesUserId = this._getFavoritesUserId(userId, userRole);
        return await db.run(
            `INSERT OR IGNORE INTO favorites (user_id, dish_id) VALUES (?, ?)`,
            [favoritesUserId, dishId]
        );
    }

    async removeFavorite(userId, dishId, userRole = null) {
        const favoritesUserId = this._getFavoritesUserId(userId, userRole);
        return await db.run(
            `DELETE FROM favorites WHERE user_id = ? AND dish_id = ?`,
            [favoritesUserId, dishId]
        );
    }

    async getByUser(userId, userRole = null) {
        const favoritesUserId = this._getFavoritesUserId(userId, userRole);
        return await db.all(
            `SELECT d.*
            FROM dishes d
            JOIN favorites f ON d.id = f.dish_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC`,
            [favoritesUserId]
        );
    }

    async isFavorite(userId, dishId, userRole = null) {
        const favoritesUserId = this._getFavoritesUserId(userId, userRole);
        const result = await db.get(
            `SELECT 1 FROM favorites WHERE user_id = ? AND dish_id = ?`,
            [favoritesUserId, dishId]
        );
        return !!result;
    }
}

module.exports = new FavoritesModel();