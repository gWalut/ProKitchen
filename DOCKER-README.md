# 🍳 CookAssistant - Кулинарный помощник

Полнофункциональное веб-приложение для управления рецептами, ингредиентами и расчета стоимости блюд.

## 🚀 Быстрый старт с Docker

### Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac/Linux)
- PowerShell (для Windows)

### Установка и запуск

1. **Клонируйте репозиторий**
```bash
git clone <your-repo>
cd CookAsistent2
```

2. **Запустите проект**
```powershell
.\start-docker.ps1
```

Готово! 🎉 Приложение будет доступно:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Управление Docker

**Обновление проекта** (пересборка образов):
```powershell
.\update-docker.ps1
```

**Обновление с сохранением данных**:
```powershell
.\update-docker.ps1 -KeepData
```

**Остановка**:
```powershell
.\stop-docker.ps1
```

## 🛠️ Разработка без Docker

### Backend

```bash
cd Back
npm install
npm run dev
```

**Переменные окружения** (`.env`):
```env
NODE_ENV=development
PORT=3000
DB_TYPE=sqlite
DB_PATH=./data/kitchen.sqlite
JWT_SECRET=your_secret_key
```

### Frontend

```bash
cd Front
npm install
npm run dev
```

Приложение откроется на http://localhost:5173

## 📦 Структура проекта

```
CookAsistent2/
├── Back/                   # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # Контроллеры API
│   │   ├── models/        # Модели данных
│   │   ├── routes/        # Маршруты API
│   │   ├── services/      # Бизнес-логика
│   │   └── middlewares/   # Middleware
│   ├── migrations/        # SQL миграции
│   ├── seeds/            # Начальные данные
│   └── Dockerfile
├── Front/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   ├── api/          # API клиент
│   │   └── hooks/        # Custom hooks
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml     # Docker конфигурация
├── start-docker.ps1      # Скрипт запуска
├── update-docker.ps1     # Скрипт обновления
└── stop-docker.ps1       # Скрипт остановки
```

## 🗄️ База данных

Проект поддерживает две БД:
- **SQLite** - для разработки (легковесная)
- **PostgreSQL** - для production (в Docker)

Миграции находятся в:
- `Back/migrations/001_create_tables.sql` (PostgreSQL)
- `Back/migrations/001_create_tables_sqlite.sql` (SQLite)

## 🔧 Технологический стек

### Backend
- Node.js + Express
- PostgreSQL / SQLite
- JWT Authentication
- Winston (логирование)

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Query
- React Router
- Axios

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy)
- Multi-stage builds

## 📝 API Endpoints

### Авторизация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход

### Ингредиенты
- `GET /api/v1/ingredients` - Список ингредиентов
- `POST /api/v1/ingredients` - Создать ингредиент
- `PUT /api/v1/ingredients/:id` - Обновить
- `DELETE /api/v1/ingredients/:id` - Удалить

### Блюда
- `GET /api/v1/dishes` - Список блюд
- `GET /api/v1/dishes/:id` - Детали блюда
- `POST /api/v1/dishes` - Создать блюдо
- `PUT /api/v1/dishes/:id` - Обновить
- `DELETE /api/v1/dishes/:id` - Удалить

## 🔐 Безопасность

- JWT токены (access + refresh)
- Bcrypt для хэширования паролей
- Rate limiting
- CORS защита
- Input validation (Joi)
- SQL injection защита (prepared statements)

## 🧪 Тестирование

**Backend**:
```bash
cd Back
npm test
```

**Frontend**:
```bash
cd Front
npm test
```

## 📊 Мониторинг

**Логи Docker**:
```bash
docker-compose logs -f
```

**Логи конкретного сервиса**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

**Статус контейнеров**:
```bash
docker-compose ps
```

## 🐛 Отладка

### Подключение к базе данных
```bash
docker exec -it cookassist_db psql -U cookassist_user -d cookassistant
```

### Проверка логов backend
```bash
docker exec -it cookassist_backend cat logs/error.log
```

### Перезапуск конкретного сервиса
```bash
docker-compose restart backend
```

## 🔄 Обновление зависимостей

**Backend**:
```bash
cd Back
npm update
```

**Frontend**:
```bash
cd Front
npm update
```

## 📈 Production Deploy

1. **Настройте переменные окружения** в `docker-compose.yml`
2. **Измените секреты JWT**
3. **Настройте домен и SSL** (Let's Encrypt)
4. **Запустите**:
```bash
docker-compose up -d
```

## 🤝 Разработка

### Добавление новой миграции
1. Создайте файл `Back/migrations/00X_description.sql`
2. Добавьте SQL для PostgreSQL
3. Запустите: `npm run migrate`

### Добавление нового API endpoint
1. Создайте контроллер в `Back/src/controllers/`
2. Добавьте роут в `Back/src/routes/`
3. Обновите валидацию в `Back/src/validators/`

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Ваше имя / Команда

---

**Приятной работы!** 🚀
