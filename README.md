# CookAssistant

Приложение для управления кухней — рецепты, ингредиенты, расчёт себестоимости блюд и формирование отчётов.

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

