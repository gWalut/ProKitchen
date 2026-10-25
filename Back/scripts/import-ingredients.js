const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../src/config');
const logger = require('../src/utils/logger');

/**
 * Импорт ингредиентов из JSON файла в базу данных
 * @param {string} jsonPath - Путь к JSON файлу
 */
async function importIngredients(jsonPath) {
    // Проверяем существование файла
    try {
        await fs.access(jsonPath);
    } catch (error) {
        logger.error(`Файл ${jsonPath} не найден`);
        process.exit(1);
    }

    // Проверяем существование базы данных
    const dbDir = path.dirname(config.DB_PATH);
    if (!fs.existsSync(dbDir)) {
        logger.error('База данных не найдена. Сначала выполните миграции.');
        process.exit(1);
    }

    // Инициализация базы данных
    const db = new Database(config.DB_PATH, { verbose: logger.debug });

    try {
        // Читаем JSON файл
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const ingredients = JSON.parse(jsonContent);

        if (!Array.isArray(ingredients)) {
            throw new Error('JSON файл должен содержать массив ингредиентов');
        }

        // Подготавливаем statements
        const findIngredient = db.prepare('SELECT id FROM ingredients WHERE name = ?');

        const insertIngredient = db.prepare(`
            INSERT INTO ingredients (
                name, description, unit, price_per_unit,
                calories_per_unit, stock_quantity, minimum_stock_level
            ) VALUES (
                @name, @description, @unit, @price_per_unit,
                @calories_per_unit, @stock_quantity, @minimum_stock_level
            )
        `);

        const updateIngredient = db.prepare(`
            UPDATE ingredients SET
                description = @description,
                unit = @unit,
                price_per_unit = @price_per_unit,
                calories_per_unit = @calories_per_unit,
                stock_quantity = @stock_quantity,
                minimum_stock_level = @minimum_stock_level,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `);

        // Статистика импорта
        let stats = {
            total: ingredients.length,
            inserted: 0,
            updated: 0,
            errors: 0
        };

        // Выполняем импорт в транзакции
        const importTransaction = db.transaction((ingredients) => {
            for (const ingredient of ingredients) {
                try {
                    // Проверяем обязательные поля
                    if (!ingredient.name || !ingredient.unit || !ingredient.price_per_unit) {
                        throw new Error(`Отсутствуют обязательные поля для ингредиента: ${JSON.stringify(ingredient)}`);
                    }

                    // Проверяем существование ингредиента
                    const existing = findIngredient.get(ingredient.name);

                    if (existing) {
                        // Обновляем существующий ингредиент
                        updateIngredient.run({
                            id: existing.id,
                            description: ingredient.description || null,
                            unit: ingredient.unit,
                            price_per_unit: ingredient.price_per_unit,
                            calories_per_unit: ingredient.calories_per_unit || null,
                            stock_quantity: ingredient.stock_quantity || 0,
                            minimum_stock_level: ingredient.minimum_stock_level || 0
                        });
                        stats.updated++;
                    } else {
                        // Создаем новый ингредиент
                        insertIngredient.run({
                            name: ingredient.name,
                            description: ingredient.description || null,
                            unit: ingredient.unit,
                            price_per_unit: ingredient.price_per_unit,
                            calories_per_unit: ingredient.calories_per_unit || null,
                            stock_quantity: ingredient.stock_quantity || 0,
                            minimum_stock_level: ingredient.minimum_stock_level || 0
                        });
                        stats.inserted++;
                    }
                } catch (error) {
                    logger.error(`Ошибка импорта ингредиента ${ingredient.name}:`, error);
                    stats.errors++;
                }
            }
        });

        // Запускаем импорт
        logger.info('Начало импорта ингредиентов...');
        importTransaction(ingredients);

        // Выводим статистику
        logger.info('Импорт завершен:', {
            total: stats.total,
            inserted: stats.inserted,
            updated: stats.updated,
            errors: stats.errors
        });

    } catch (error) {
        logger.error('Ошибка при импорте:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Проверяем аргументы командной строки
if (process.argv.length < 3) {
    logger.error('Использование: node import-ingredients.js <path-to-json>');
    process.exit(1);
}

// Запускаем импорт
const jsonPath = path.resolve(process.argv[2]);
importIngredients(jsonPath);