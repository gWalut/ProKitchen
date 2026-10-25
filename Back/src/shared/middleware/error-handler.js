const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Централизованный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
    // Логируем ошибку в консоль для разработки
    console.error('❌ Error occurred:', {
        error: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    });

    // Логируем через logger
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    });

    // Если ошибка уже отформатирована (наследуется от AppError)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.error,
            message: err.message,
            details: err.details
        });
    }

    // Обработка ошибок валидации Mongoose
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message
        }));

        return res.status(400).json({
            error: 'ValidationError',
            message: 'Ошибка валидации',
            details
        });
    }

    // Обработка ошибок уникальности Mongoose
    if (err.code === 11000) {
        return res.status(409).json({
            error: 'ConflictError',
            message: 'Запись с такими данными уже существует',
            details: err.keyValue
        });
    }

    // Обработка ошибок SQLite
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            error: 'ConflictError',
            message: 'Нарушение ограничений базы данных',
            details: err.message
        });
    }

    // Для всех остальных ошибок возвращаем общее сообщение
    // В продакшене не отправляем стек ошибки клиенту
    const response = {
        error: 'InternalServerError',
        message: 'Внутренняя ошибка сервера'
    };

    // В режиме разработки добавляем дополнительную информацию
    if (process.env.NODE_ENV !== 'production') {
        response.details = {
            message: err.message,
            stack: err.stack
        };
    }

    res.status(500).json(response);
};

/**
 * 404-обработчик — вызывается если ни один маршрут не совпал.
 * Возвращает корректный HTTP 404.
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'NotFound',
        message: `Маршрут ${req.method} ${req.path} не существует`,
        statusCode: 404,
    });
};

/**
 * 410-обработчик — для ресурсов, которые были удалены навсегда.
 * Используйте явно в конкретных маршрутах: next(goneError('...'))
 */
const goneHandler = (message = 'Ресурс удалён и больше не доступен') => (req, res) => {
    res.status(410).json({
        error: 'Gone',
        message,
        statusCode: 410,
    });
};

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.goneHandler = goneHandler;