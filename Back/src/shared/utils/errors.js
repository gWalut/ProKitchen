// Базовый класс ошибок приложения
class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.error = this.constructor.name;
    }

    toJSON() {
        return {
            error: this.error,
            message: this.message,
            details: this.details
        };
    }
}

// Ошибка валидации
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, details);
    }
}

// Ошибка аутентификации
class AuthenticationError extends AppError {
    constructor(message = 'Не авторизован') {
        super(message, 401);
    }
}

// Ошибка авторизации
class AuthorizationError extends AppError {
    constructor(message = 'Нет доступа') {
        super(message, 403);
    }
}

// Ошибка "не найдено"
class NotFoundError extends AppError {
    constructor(message = 'Ресурс не найден') {
        super(message, 404);
    }
}

// Ошибка конфликта
class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, details);
    }
}

// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
    const logger = require('./logger');

    // Если ошибка не является экземпляром AppError, преобразуем её
    if (!(err instanceof AppError)) {
        logger.error('Необработанная ошибка:', err);
        err = new AppError('Внутренняя ошибка сервера', 500);
    } else {
        logger.error(`${err.error}: ${err.message}`, err.details || '');
    }

    res.status(err.statusCode).json(err.toJSON());
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    errorHandler
};