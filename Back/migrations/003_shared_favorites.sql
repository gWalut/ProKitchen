-- Миграция для общего избранного всех авторизованных пользователей
-- Удаляем внешний ключ на user_id в таблице favorites

-- SQLite не поддерживает DROP CONSTRAINT, поэтому нужно пересоздать таблицу

-- Создаем временную таблицу с той же структурой, но без внешнего ключа на user_id
CREATE TABLE IF NOT EXISTS favorites_new (
    user_id INTEGER,
    dish_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, dish_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Копируем данные из старой таблицы
INSERT INTO favorites_new (user_id, dish_id, created_at)
SELECT user_id, dish_id, created_at FROM favorites;

-- Удаляем старую таблицу
DROP TABLE favorites;

-- Переименовываем новую таблицу
ALTER TABLE favorites_new RENAME TO favorites;

-- Комментарий: user_id = 0 теперь используется для общего избранного всех авторизованных пользователей (не guest)
