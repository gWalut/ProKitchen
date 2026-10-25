/**
 * Простой rate limiter на основе Map
 * Для продакшена рекомендуется использовать более надежное решение,
 * например, rate-limiter-flexible с Redis
 */
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 минут по умолчанию
        this.max = options.max || 100; // 100 запросов по умолчанию
        this.message = options.message || 'Слишком много запросов. Попробуйте позже.';
        this.store = new Map();

        // Периодическая очистка старых записей
        setInterval(() => this.cleanup(), this.windowMs);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.store.entries()) {
            if (now - data.startTime > this.windowMs) {
                this.store.delete(key);
            }
        }
    }

    getKey(req) {
        return req.ip;
    }

    /**
     * Middleware для ограничения количества запросов
     */
    middleware() {
        return (req, res, next) => {
            const key = this.getKey(req);
            const now = Date.now();

            // Получаем или создаем запись для IP
            let record = this.store.get(key);
            if (!record) {
                record = {
                    count: 0,
                    startTime: now
                };
                this.store.set(key, record);
            }

            // Проверяем, не истекло ли окно
            if (now - record.startTime > this.windowMs) {
                record.count = 0;
                record.startTime = now;
            }

            // Увеличиваем счетчик
            record.count += 1;

            // Добавляем заголовки rate limit
            res.setHeader('X-RateLimit-Limit', this.max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - record.count));
            res.setHeader('X-RateLimit-Reset', Math.ceil((record.startTime + this.windowMs) / 1000));

            // Проверяем лимит
            if (record.count > this.max) {
                return res.status(429).json({
                    error: 'TooManyRequests',
                    message: this.message
                });
            }

            next();
        };
    }
}

// Создаем rate limiter для эндпоинтов аутентификации
const authLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 50, // 50 попыток (увеличено для разработки)
    message: 'Слишком много попыток входа. Попробуйте позже.'
});

module.exports = {
    RateLimiter,
    authLimiter: authLimiter.middleware()
};