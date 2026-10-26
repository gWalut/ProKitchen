const dotenv = require('dotenv');
const path = require('path');

// Загрузка .env файла
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Основные настройки сервера
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // База данных
    DB_TYPE: process.env.DB_TYPE || 'sqlite', // postgres или sqlite

    // PostgreSQL настройки
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME || 'cookassistant',
    DB_USER: process.env.DB_USER || 'cookassist_user',
    DB_PASSWORD: process.env.DB_PASSWORD || 'cookassist_password',

    // SQLite настройки (fallback для разработки)
    DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../data/kitchen.sqlite'),

    // JWT конфигурация
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-jwt',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m', // 15 минут
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '7d', // 7 дней

    // CORS настройки
    CORS_ORIGINS: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174',
            'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
};

// Проверка обязательных переменных в production
if (config.NODE_ENV === 'production') {
    const requiredEnvs = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

    if (missingEnvs.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
    }
}

module.exports = config;
