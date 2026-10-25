-- Создание таблицы для пользовательских блюд из калькулятора себестоимости
CREATE TABLE IF NOT EXISTS custom_dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    portions INTEGER DEFAULT 1,
    ingredients_json TEXT NOT NULL, -- JSON массив с ингредиентами: [{name, weight, unit, pricePerUnit}]
    cost_per_portion DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индекс для быстрого поиска блюд по пользователю
CREATE INDEX IF NOT EXISTS idx_custom_dishes_user_id ON custom_dishes(user_id);

-- Индекс для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_custom_dishes_created_at ON custom_dishes(created_at DESC);
