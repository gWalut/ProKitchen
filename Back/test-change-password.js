/**
 * Скрипт для тестирования API смены пароля
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testChangePassword() {
    const testEmail = `test-password-${Date.now()}@example.com`;
    const oldPassword = 'OldPassword123';
    const newPassword = 'NewPassword456';

    let accessToken = null;
    let refreshToken = null;

    try {
        log('\n=== Тестирование API смены пароля ===\n', 'cyan');

        // 1. Регистрация тестового пользователя
        log('1. Регистрация тестового пользователя...', 'yellow');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
            email: testEmail,
            password: oldPassword,
            passwordConfirm: oldPassword,
            acceptPrivacyPolicy: true
        });

        if (registerResponse.status === 201) {
            log('✅ Регистрация успешна', 'green');
            accessToken = registerResponse.data.data.accessToken;
            refreshToken = registerResponse.data.data.refreshToken;
            log(`   Email: ${testEmail}`, 'blue');
            log(`   Password: ${oldPassword}`, 'blue');
        }

        // 2. Попытка сменить пароль с неверным текущим паролем
        log('\n2. Попытка смены пароля с неверным текущим паролем...', 'yellow');
        try {
            await axios.post(`${API_URL}/auth/change-password`, {
                currentPassword: 'WrongPassword',
                newPassword: newPassword
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            log('❌ Должна была быть ошибка!', 'red');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                log('✅ Правильно отклонен неверный пароль', 'green');
                log(`   Ошибка: ${error.response.data.message}`, 'blue');
            } else {
                throw error;
            }
        }

        // 3. Попытка сменить пароль со слишком коротким новым паролем
        log('\n3. Попытка смены пароля со слишком коротким новым паролем...', 'yellow');
        try {
            await axios.post(`${API_URL}/auth/change-password`, {
                currentPassword: oldPassword,
                newPassword: '123'
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            log('❌ Должна была быть ошибка!', 'red');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                log('✅ Правильно отклонен короткий пароль', 'green');
                log(`   Ошибка: ${error.response.data.message}`, 'blue');
            } else {
                throw error;
            }
        }

        // 4. Успешная смена пароля
        log('\n4. Успешная смена пароля...', 'yellow');
        const changeResponse = await axios.post(`${API_URL}/auth/change-password`, {
            currentPassword: oldPassword,
            newPassword: newPassword
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (changeResponse.status === 200 && changeResponse.data.data.success) {
            log('✅ Пароль успешно изменен', 'green');
            log(`   Старый пароль: ${oldPassword}`, 'blue');
            log(`   Новый пароль: ${newPassword}`, 'blue');
        }

        // 5. Проверка, что старый refresh токен больше не работает
        log('\n5. Проверка отзыва refresh токенов...', 'yellow');
        try {
            await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: refreshToken
            });
            log('❌ Старый refresh токен все еще работает!', 'red');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                log('✅ Старый refresh токен правильно отозван', 'green');
            } else {
                throw error;
            }
        }

        // 6. Вход со старым паролем должен не работать
        log('\n6. Попытка входа со старым паролем...', 'yellow');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: testEmail,
                password: oldPassword
            });
            log('❌ Вход со старым паролем должен быть запрещен!', 'red');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                log('✅ Вход со старым паролем правильно отклонен', 'green');
            } else {
                throw error;
            }
        }

        // 7. Вход с новым паролем должен работать
        log('\n7. Вход с новым паролем...', 'yellow');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: newPassword
        });

        if (loginResponse.status === 200) {
            log('✅ Вход с новым паролем успешен', 'green');
            log(`   Получен новый access token`, 'blue');
        }

        log('\n=== ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! ===\n', 'green');

    } catch (error) {
        log('\n❌ ОШИБКА В ТЕСТЕ:', 'red');
        if (error.response) {
            log(`Статус: ${error.response.status}`, 'red');
            log(`Сообщение: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        } else {
            log(error.message, 'red');
            console.error(error);
        }
        process.exit(1);
    }
}

// Запуск тестов
testChangePassword();
