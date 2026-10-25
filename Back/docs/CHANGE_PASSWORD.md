# 🔐 Смена пароля - Руководство

## Описание функционала

Реализован полный функционал смены пароля для пользователей CookAssistant.

## 🎯 Возможности

- ✅ Безопасная смена пароля через API
- ✅ Валидация текущего и нового пароля
- ✅ Автоматический выход из всех сессий после смены пароля
- ✅ Требование минимальной длины пароля (8 символов)
- ✅ Логирование действий для аудита
- ✅ Красивый UI для смены пароля в приложении

## 📋 API Endpoint

### POST `/api/v1/auth/change-password`

**Требуется:** Авторизация (Bearer token)

**Тело запроса:**
```json
{
  "currentPassword": "текущий_пароль",
  "newPassword": "новый_пароль"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Пароль успешно изменен",
  "data": {
    "success": true
  }
}
```

**Ошибки:**

- `400` - Неверная валидация (пароль слишком короткий)
- `401` - Неверный текущий пароль или не авторизован
- `404` - Пользователь не найден

## 🔒 Безопасность

1. **Проверка текущего пароля** - пользователь должен ввести правильный текущий пароль
2. **Минимальная длина** - новый пароль должен быть минимум 8 символов
3. **Хеширование** - пароли хранятся в виде bcrypt хеша
4. **Отзыв токенов** - все refresh токены пользователя отзываются после смены пароля
5. **Логирование** - действие записывается в журнал аудита

## 💻 Использование в Frontend

### Через Settings Page

1. Откройте страницу настроек
2. Нажмите кнопку **"Сменить пароль"**
3. В модальном окне введите:
   - Текущий пароль
   - Новый пароль
   - Подтверждение нового пароля
4. Нажмите **"Сменить пароль"**
5. После успешной смены вы будете автоматически разлогинены

### Программный вызов

```typescript
import { authApi } from '@/api/endpoints';

try {
  await authApi.changePassword('currentPassword123', 'newPassword456');
  console.log('Пароль успешно изменен');
  // Пользователь будет автоматически разлогинен
} catch (error) {
  console.error('Ошибка смены пароля:', error.message);
}
```

## 🧪 Тестирование

### Запуск автоматических тестов

```bash
cd Back
npm test -- changePassword.test.js
```

### Запуск скрипта тестирования API

```bash
cd Back
node test-change-password.js
```

Этот скрипт проверяет:
- ✅ Регистрацию пользователя
- ✅ Отклонение неверного текущего пароля
- ✅ Отклонение короткого нового пароля
- ✅ Успешную смену пароля
- ✅ Отзыв старых refresh токенов
- ✅ Невозможность входа со старым паролем
- ✅ Успешный вход с новым паролем

## 📝 Примеры

### Curl запрос

```bash
# Получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"oldpass123"}' \
  | jq -r '.data.accessToken')

# Сменить пароль
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass456"
  }'
```

### JavaScript (axios)

```javascript
const axios = require('axios');

async function changePassword() {
  try {
    // Логин
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'user@example.com',
      password: 'oldpass123'
    });
    
    const token = loginResponse.data.data.accessToken;
    
    // Смена пароля
    const changeResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/change-password',
      {
        currentPassword: 'oldpass123',
        newPassword: 'newpass456'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Пароль изменен:', changeResponse.data.message);
  } catch (error) {
    console.error('Ошибка:', error.response.data.message);
  }
}

changePassword();
```

## 🔍 Логирование

После смены пароля в таблицу `action_logs` записывается событие:

```sql
SELECT * FROM action_logs 
WHERE action_type = 'CHANGE_PASSWORD' 
ORDER BY created_at DESC 
LIMIT 1;
```

Результат:
```
user_id | action_type      | entity_type | entity_id | created_at
--------|------------------|-------------|-----------|-------------------
123     | CHANGE_PASSWORD  | USER        | 123       | 2025-11-13 10:30:00
```

## ⚠️ Важные замечания

1. **Автоматический выход** - после смены пароля пользователь автоматически выходит из всех сессий
2. **Одноразовая операция** - каждая смена пароля требует знания текущего пароля
3. **Безопасность** - старые refresh токены сразу отзываются
4. **Логирование** - все действия логируются для безопасности

## 🎨 UI Компоненты

### ChangePasswordModal

Компонент модального окна с формой смены пароля:

- Поле для текущего пароля
- Поле для нового пароля
- Поле подтверждения нового пароля
- Валидация на клиентской стороне
- Отображение ошибок
- Состояние загрузки

## 📚 Связанные файлы

### Backend
- `Back/src/routes/auth.js` - маршрут API
- `Back/src/controllers/authController.js` - контроллер
- `Back/src/services/authService.js` - бизнес-логика
- `Back/src/models/usersModel.js` - работа с БД
- `Back/src/validators/authValidators.js` - валидация
- `Back/tests/changePassword.test.js` - тесты
- `Back/test-change-password.js` - скрипт тестирования

### Frontend
- `Front/src/api/client.ts` - API клиент
- `Front/src/api/endpoints.ts` - endpoints
- `Front/src/pages/SettingsPage.tsx` - страница настроек
- `Front/src/components/ChangePasswordModal.tsx` - модальное окно

### Документация
- `Back/docs/openapi.yaml` - OpenAPI спецификация
- `README.md` - основная документация

## 🎉 Готово!

Функционал смены пароля полностью реализован и протестирован.
