-- Создание базы данных для приложения гороскопов

-- Удаляем таблицы если они существуют (осторожно!)
-- DROP TABLE IF EXISTS horoscops CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users
(
    id_user SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birthday DATE,
    zodiac VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    subscription BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы гороскопов
CREATE TABLE IF NOT EXISTS horoscops
(
    id SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    horoscop_date DATE NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_zodiac ON users(zodiac);
CREATE INDEX IF NOT EXISTS idx_horoscops_user_date ON horoscops(id_user, horoscop_date);
CREATE INDEX IF NOT EXISTS idx_horoscops_date ON horoscops(horoscop_date);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION IF NOT EXISTS update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для обновления updated_at в таблице users
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    BEFORE
UPDATE ON users 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Вставка тестовых данных (опционально)
INSERT INTO users
    (first_name, email, birthday, zodiac, password, subscription)
VALUES
    ('Анна', 'anna@example.com', '1990-03-15', 'Pisces', '$2b$10$dummy.hash.for.testing.purposes.only', false),
    ('Петр', 'petr@example.com', '1985-07-22', 'Cancer', '$2b$10$dummy.hash.for.testing.purposes.only', true),
    ('Мария', 'maria@example.com', '1992-11-08', 'Scorpio', '$2b$10$dummy.hash.for.testing.purposes.only', false)
ON CONFLICT (email) DO NOTHING;
