/**
 * NutritionService — серверный адаптер для Spoonacular Food API.
 *
 * Возможности:
 *  - Поиск нутритивных данных ингредиента по названию
 *  - Retry-логика (до 3 попыток с экспоненциальным откатом)
 *  - Таймаут на каждый запрос (5 сек)
 *  - Встроенный rate-limiter: не более 1 запроса/сек к внешнему API
 *  - Нормализация ответа в формат приложения
 *  - Graceful degradation: возвращает null при недоступности API
 */

const https = require('https');
const logger = require('../../shared/utils/logger');

const SPOONACULAR_BASE = 'api.spoonacular.com';
const REQUEST_TIMEOUT_MS = 5_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;

// Простая очередь для соблюдения rate-limit (1 req/sec к Spoonacular free tier)
let _lastRequestTime = 0;
const MIN_INTERVAL_MS = 1_100;

async function _waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - _lastRequestTime;
    if (elapsed < MIN_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    _lastRequestTime = Date.now();
}

/**
 * Выполняет HTTPS GET запрос с таймаутом.
 * @returns {Promise<any>} - Разбитый JSON
 */
function _httpsGet(path) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.SPOONACULAR_API_KEY;
        if (!apiKey) {
            return reject(new Error('SPOONACULAR_API_KEY не задан в переменных окружения'));
        }

        const options = {
            hostname: SPOONACULAR_BASE,
            path: `${path}&apiKey=${apiKey}`,
            method: 'GET',
            headers: { Accept: 'application/json' },
            timeout: REQUEST_TIMEOUT_MS,
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    if (res.statusCode === 402) {
                        return reject(new Error('QUOTA_EXCEEDED'));
                    }
                    if (res.statusCode !== 200) {
                        return reject(new Error(`HTTP ${res.statusCode}`));
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Ошибка разбора ответа API'));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('TIMEOUT'));
        });

        req.on('error', (err) => reject(err));
        req.end();
    });
}

/**
 * Запрос с повторными попытками и экспоненциальным откатом.
 */
async function _fetchWithRetry(path, attempt = 1) {
    await _waitForRateLimit();
    try {
        return await _httpsGet(path);
    } catch (err) {
        const isRetryable = err.message === 'TIMEOUT' || err.message.startsWith('HTTP 5');
        if (isRetryable && attempt < MAX_RETRIES) {
            const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
            logger.warn(`[NutritionService] Retry ${attempt}/${MAX_RETRIES} через ${delay}ms: ${err.message}`);
            await new Promise((r) => setTimeout(r, delay));
            return _fetchWithRetry(path, attempt + 1);
        }
        throw err;
    }
}

/**
 * Нормализует ответ Spoonacular в формат приложения.
 * @param {object} raw - Объект из Spoonacular /food/ingredients/{id}/information
 * @returns {object}
 */
function _normalizeNutrition(raw) {
    const nutrients = raw.nutrition?.nutrients ?? [];

    const find = (name) => {
        const n = nutrients.find((x) => x.name.toLowerCase() === name.toLowerCase());
        return n ? { amount: n.amount, unit: n.unit } : null;
    };

    return {
        id: raw.id,
        name: raw.name,
        calories: find('Calories') ?? find('Energy'),
        protein: find('Protein'),
        fat: find('Fat'),
        carbohydrates: find('Carbohydrates'),
        fiber: find('Fiber'),
        sugar: find('Sugar'),
        unit: raw.unit ?? 'g',
        image: raw.image ? `https://spoonacular.com/cdn/ingredients_100x100/${raw.image}` : null,
    };
}

class NutritionService {
    /**
     * Ищет ингредиент по названию и возвращает нормализованные нутритивные данные.
     * При недоступности API возвращает null (graceful degradation).
     * @param {string} ingredientName
     * @returns {Promise<object|null>}
     */
    async getNutritionByName(ingredientName) {
        try {
            // 1. Поиск ID ингредиента
            const searchPath = `/food/ingredients/search?query=${encodeURIComponent(ingredientName)}&number=1&language=ru`;
            const searchResult = await _fetchWithRetry(searchPath);

            const item = searchResult.results?.[0];
            if (!item) {
                logger.info(`[NutritionService] Ингредиент не найден: ${ingredientName}`);
                return null;
            }

            // 2. Детали с питательными данными (на 100г)
            const detailPath = `/food/ingredients/${item.id}/information?amount=100&unit=g`;
            const detail = await _fetchWithRetry(detailPath);

            return _normalizeNutrition(detail);
        } catch (err) {
            if (err.message === 'SPOONACULAR_API_KEY не задан в переменных окружения') {
                logger.error('[NutritionService] API ключ не настроен');
            } else if (err.message === 'QUOTA_EXCEEDED') {
                logger.warn('[NutritionService] Квота Spoonacular исчерпана');
            } else {
                logger.error(`[NutritionService] Ошибка: ${err.message}`);
            }
            return null; // graceful degradation
        }
    }

    /**
     * Возвращает нутритивные данные для списка ингредиентов.
     * Запросы идут последовательно, чтобы не превысить rate-limit.
     * @param {string[]} names
     * @returns {Promise<Array<object|null>>}
     */
    async getBulkNutrition(names) {
        const results = [];
        for (const name of names) {
            results.push(await this.getNutritionByName(name));
        }
        return results;
    }
}

module.exports = new NutritionService();
