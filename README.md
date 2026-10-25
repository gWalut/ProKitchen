# CookAssistant

Приложение для управления кухней — рецепты, ингредиенты, расчёт себестоимости блюд и формирование отчётов.

## Структура Бека

Back/
│
├── 📄 Dockerfile                      # Docker-образ для бэкенда
├── 📄 package.json                    # Зависимости и скрипты (Express, JWT, PostgreSQL/SQLite)
├── 📄 jest.config.js                  # Настройки тестирования Jest
│
├── 📂 src/                            # Исходный код приложения
│   ├── 📄 app.js                      # Главный файл приложения Express
│   │
│   ├── 📂 config/                     # Конфигурация приложения
│   │   └── config.js                  # Настройки БД, JWT, переменные окружения
│   │
│   ├── 📂 features/                   # Модули по функциональности (Feature-based архитектура)
│   │   ├── 📂 action-logs/            # Логирование действий пользователей
│   │   ├── 📂 allergens/              # Управление аллергенами
│   │   ├── 📂 auth/                   # Аутентификация и авторизация (JWT)
│   │   ├── 📂 custom-dishes/          # Пользовательские блюда
│   │   ├── 📂 dishes/                 # Каталог блюд
│   │   ├── 📂 favorites/              # Избранные блюда
│   │   ├── 📂 ingredients/            # Управление ингредиентами
│   │   └── 📂 labels/                 # Метки и категории
│   │
│   ├── 📂 shared/                     # Общие компоненты
│   │   ├── 📂 database/               # Подключение к БД (PostgreSQL/SQLite)
│   │   ├── 📂 middleware/             # Middleware (auth, validation, rate-limit)
│   │   ├── 📂 models/                 # Модели данных
│   │   ├── 📂 services/               # Бизнес-логика
│   │   └── 📂 utils/                  # Утилиты (логирование, валидация)
│   │
│   └── 📂 logs/                       # Логи приложения
│
├── 📂 scripts/                        # Скрипты управления БД
│   ├── migrate.js                     # Миграции БД
│   ├── reset-database.js              # Сброс БД
│   ├── seed_allergens.js              # Заполнение данными аллергенов
│   └── import-ingredients.js          # Импорт ингредиентов
│
├── 📂 migrations/                     # SQL-миграции
│   ├── 001_create_tables.sql          # Создание таблиц (PostgreSQL)
│   ├── 001_create_tables_sqlite.sql   # Создание таблиц (SQLite)
│   └── 002_create_custom_dishes.sql   # Пользовательские блюда
│
├── 📂 tests/                          # Unit-тесты
│   ├── auth.test.js                   # Тесты аутентификации
│   ├── changePassword.test.js         # Тесты смены пароля
│   └── setup.js                       # Настройка тестового окружения
│
├── 📂 coverage/                       # Отчеты о покрытии тестами
├── 📂 data/                           # Файлы данных (JSON, CSV)
├── 📂 docs/                           # Документация API
│   ├── openapi.yaml                   # OpenAPI спецификация
│   └── CHANGE_PASSWORD.md             # Документация по смене пароля
│
├── 📂 fonts/                          # Шрифты для PDF-генерации
└── 📂 seeds/                          # SQL-seed файлы

🔑 **Ключевые файлы для запуска:**
├── test-api.js                        # Тестирование API
├── test-server.js                     # Тестирование сервера
├── check-db.js                        # Проверка подключения к БД
└── download-fonts.js                  # Загрузка шрифтов

## Структура Фронта

Front/
│
├── 📄 Dockerfile                      # Docker-образ для фронтенда
├── 📄 package.json                    # Зависимости (React, TypeScript, TanStack Query)
├── 📄 vite.config.ts                  # Конфигурация Vite
├── 📄 tsconfig.json                   # Настройки TypeScript
├── 📄 tailwind.config.js              # Конфигурация Tailwind CSS
├── 📄 playwright.config.ts            # E2E тесты (Playwright)
├── 📄 jest.config.cjs                 # Unit-тесты (Jest)
├── 📄 nginx.conf                      # Конфигурация Nginx для продакшена
│
├── 📂 src/                            # Исходный код
│   ├── 📄 main.tsx                    # Точка входа React
│   ├── 📄 App.tsx                     # Главный компонент
│   ├── 📄 routes.tsx                  # Маршрутизация (React Router)
│   │
│   ├── 📂 api/                        # API-клиент
│   │   ├── client.ts                  # Axios-клиент с перехватчиками
│   │   ├── endpoints.ts               # Эндпоинты API
│   │   └── services.ts                # API-сервисы
│   │
│   ├── 📂 features/                   # Модули функциональности
│   │   ├── 📂 auth/                   # Авторизация (login, register)
│   │   ├── 📂 allergens/              # Управление аллергенами
│   │   ├── 📂 calculator/             # Калькулятор калорий
│   │   ├── 📂 dishes/                 # Каталог блюд
│   │   ├── 📂 ingredients/            # Управление ингредиентами
│   │   ├── 📂 labels/                 # Метки
│   │   └── 📂 profile/                # Профиль пользователя
│   │
│   ├── 📂 shared/                     # Общие компоненты
│   │   ├── 📂 components/             # UI-компоненты (Button, Modal, Card)
│   │   ├── 📂 contexts/               # React Context (Auth, Theme)
│   │   ├── 📂 hooks/                  # Custom Hooks (useAuth, useFetch)
│   │   ├── 📂 providers/              # Провайдеры (QueryClient, Router)
│   │   ├── 📂 schemas/                # Zod-схемы валидации
│   │   ├── 📂 types/                  # TypeScript типы
│   │   ├── 📂 utils/                  # Утилиты (форматирование, storage)
│   │   └── 📂 styles/                 # Глобальные стили
│   │
│   ├── 📂 pages/                      # Страницы приложения
│   ├── 📂 stories/                    # Storybook компоненты
│   ├── 📂 mocks/                      # Mock-данные для тестов (MSW)
│   └── 📂 tests/                      # Unit-тесты
│
├── 📂 tests/
│   └── 📂 e2e/                        # E2E-тесты (Playwright)
│
├── 📂 docs/
│   └── UI-GUIDELINES.md               # Гайдлайны по UI
│
└── 📂 scripts/
    └── optimize-images.js             # Оптимизация изображений

## Быстрый старт

Запустить проект через Docker:

```powershell
.\start-docker.ps1
```

Приложение будет доступно по адресу http://localhost

## Технологии

**Backend:** Node.js, SQlite
**Frontend:** React, TypeScript, Tailwind CSS  
**Деплой:** Docker, Nginx

## Установка

### Через Docker

Нужен Docker Desktop. Запуск:

```powershell
.\start-docker.ps1
```

Остановка:

```powershell
.\stop-docker.ps1
```

### Локально

Backend:
```bash
cd Back
npm install
npm run dev
```

Frontend:
```bash
cd Front
npm install
npm run dev
```

## Возможности

- Управление рецептами и ингредиентами
- Автоматический расчёт себестоимости
- Контроль аллергенов
- Генерация PDF отчётов

## API

Основные эндпоинты:

```
POST   /api/v1/auth/login
GET    /api/v1/dishes
GET    /api/v1/ingredients
```

Полная документация API в `Back/docs/openapi.yaml`

