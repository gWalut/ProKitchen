-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ингредиентов
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    calories_per_unit INTEGER,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    minimum_stock_level DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы аллергенов
CREATE TABLE IF NOT EXISTS allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь ингредиентов и аллергенов
CREATE TABLE IF NOT EXISTS ingredient_allergens (
    ingredient_id INTEGER,
    allergen_id INTEGER,
    PRIMARY KEY (ingredient_id, allergen_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
);

-- Создание таблицы блюд
CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT NOT NULL,
    cooking_time INTEGER NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    portion_size INTEGER NOT NULL,
    cost_per_portion DECIMAL(10, 2),
    is_published BOOLEAN DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Связь блюд и ингредиентов
CREATE TABLE IF NOT EXISTS dish_ingredients (
    dish_id INTEGER,
    ingredient_id INTEGER,
    quantity DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- Таблица избранных блюд
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER,
    dish_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, dish_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Таблица меток (тегов)
CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь блюд и меток
CREATE TABLE IF NOT EXISTS dish_labels (
    dish_id INTEGER,
    label_id INTEGER,
    PRIMARY KEY (dish_id, label_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- Таблица логов действий (без внешнего ключа на user_id)
CREATE TABLE IF NOT EXISTS action_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для refresh токенов
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);
CREATE INDEX IF NOT EXISTS idx_dishes_created_by ON dishes(created_by);
CREATE INDEX IF NOT EXISTS idx_action_logs_user ON action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
