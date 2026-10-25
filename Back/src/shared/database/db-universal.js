const { Pool } = require('pg');
const config = require('../../config/config');
const logger = require('../utils/logger');

class DB {
    constructor() {
        if (!DB.instance) {
            // Для PostgreSQL используем Pool
            if (config.DB_TYPE === 'postgres') {
                this.pool = new Pool({
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    database: config.DB_NAME,
                    user: config.DB_USER,
                    password: config.DB_PASSWORD,
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                });

                this.pool.on('error', (err) => {
                    logger.error('Unexpected error on idle PostgreSQL client', err);
                });

                logger.info('PostgreSQL pool initialized');
            } else {
                // SQLite fallback для разработки
                const sqlite3 = require('sqlite3').verbose();
                this.db = new sqlite3.Database(config.DB_PATH, (err) => {
                    if (err) {
                        logger.error('Error connecting to SQLite database:', err);
                        throw err;
                    }
                    logger.info('Connected to SQLite database');
                });
                this.db.run('PRAGMA foreign_keys = ON');
            }

            DB.instance = this;
        }
        return DB.instance;
    }

    // Универсальный метод run для INSERT/UPDATE/DELETE
    async run(sql, params = []) {
        if (config.DB_TYPE === 'postgres') {
            // PostgreSQL: конвертируем ? в $1, $2, etc.
            const pgSql = this._convertPlaceholders(sql);
            try {
                const result = await this.pool.query(pgSql, params);
                return {
                    changes: result.rowCount,
                    lastInsertRowid: result.rows[0]?.id || null
                };
            } catch (error) {
                logger.error('PostgreSQL query error:', error);
                throw error;
            }
        } else {
            // SQLite
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            changes: this.changes,
                            lastInsertRowid: this.lastID
                        });
                    }
                });
            });
        }
    }

    // Получение одной строки
    async get(sql, params = []) {
        if (config.DB_TYPE === 'postgres') {
            const pgSql = this._convertPlaceholders(sql);
            try {
                const result = await this.pool.query(pgSql, params);
                return result.rows[0] || null;
            } catch (error) {
                logger.error('PostgreSQL query error:', error);
                throw error;
            }
        } else {
            return new Promise((resolve, reject) => {
                this.db.get(sql, params, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        }
    }

    // Получение множества строк
    async all(sql, params = []) {
        if (config.DB_TYPE === 'postgres') {
            const pgSql = this._convertPlaceholders(sql);
            try {
                const result = await this.pool.query(pgSql, params);
                return result.rows;
            } catch (error) {
                logger.error('PostgreSQL query error:', error);
                throw error;
            }
        } else {
            return new Promise((resolve, reject) => {
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        }
    }

    // Подготовка statement
    prepare(sql) {
        return {
            run: async (params = []) => {
                return this.run(sql, params);
            },
            get: async (params = []) => {
                return this.get(sql, params);
            },
            all: async (params = []) => {
                return this.all(sql, params);
            }
        };
    }

    // Транзакция
    async transaction(callback) {
        if (config.DB_TYPE === 'postgres') {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } else {
            return new Promise((resolve, reject) => {
                this.db.serialize(async () => {
                    try {
                        this.db.run('BEGIN TRANSACTION');
                        const result = await callback();
                        this.db.run('COMMIT');
                        resolve(result);
                    } catch (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                    }
                });
            });
        }
    }

    // Конвертация плейсхолдеров ? в $1, $2 для PostgreSQL
    _convertPlaceholders(sql) {
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    }

    // Закрытие соединения
    async close() {
        if (config.DB_TYPE === 'postgres') {
            await this.pool.end();
            logger.info('PostgreSQL pool closed');
        } else if (this.db) {
            this.db.close((err) => {
                if (err) {
                    logger.error('Error closing SQLite database:', err);
                } else {
                    logger.info('SQLite database closed');
                }
            });
        }
    }

    // Проверка подключения
    async healthCheck() {
        try {
            if (config.DB_TYPE === 'postgres') {
                const result = await this.pool.query('SELECT 1 as health');
                return result.rows[0].health === 1;
            } else {
                return new Promise((resolve) => {
                    this.db.get('SELECT 1 as health', (err, row) => {
                        resolve(!err && row.health === 1);
                    });
                });
            }
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }
}

// Экспортируем единственный экземпляр
module.exports = new DB();
