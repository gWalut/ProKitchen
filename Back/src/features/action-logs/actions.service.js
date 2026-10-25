const actionLogsModel = require('./action-logs.model');

class ActionsService {
    async log(action) {
        try {
            // Не логируем действия без userId (гостевые пользователи)
            if (!action.userId) {
                console.log('Skipping log for guest user action');
                return null;
            }

            return actionLogsModel.log({
                userId: action.userId,
                actionType: action.actionType,
                entityType: action.entityType,
                entityId: action.entityId,
                details: action.details
            });
        } catch (error) {
            console.error('Error logging action:', error);
            // Не выбрасываем ошибку, чтобы не прерывать основной процесс
            return null;
        }
    }


    async getUserHistory(userId, options = {}) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;

        return actionLogsModel.getUserHistory(userId, limit, offset);
    }


    async getEntityHistory(entityType, entityId, options = {}) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;

        return actionLogsModel.getEntityHistory(entityType, entityId, limit, offset);
    }


    formatAction(action) {
        const typeLabels = {
            CREATE: 'Создание',
            UPDATE: 'Обновление',
            DELETE: 'Удаление',
            LOGIN: 'Вход в систему',
            LOGOUT: 'Выход из системы',
            REGISTER: 'Регистрация'
        };

        const entityLabels = {
            USER: 'пользователь',
            DISH: 'блюдо',
            INGREDIENT: 'ингредиент',
            LABEL: 'метка'
        };

        return {
            id: action.id,
            timestamp: action.created_at,
            description: `${typeLabels[action.action_type] || action.action_type} - ${entityLabels[action.entity_type] || action.entity_type}`,
            details: action.details ? JSON.parse(action.details) : null
        };
    }
}

module.exports = new ActionsService();