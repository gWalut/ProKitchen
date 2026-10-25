const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

// Цвета для консоли
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_URL}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }

        const response = await axios(config);
        log(`✓ ${method} ${endpoint} - ${response.status}`, 'green');
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'ERROR';
        const message = error.response?.data?.message || error.message;
        log(`✗ ${method} ${endpoint} - ${status}: ${message}`, 'red');
        return null;
    }
}

async function runTests() {
    log('\n=== Тестирование API ===\n', 'blue');

    // 1. Health Check
    log('1. Health Check', 'yellow');
    await testEndpoint('GET', '/health');

    // 2. Регистрация
    log('\n2. Регистрация пользователя', 'yellow');
    const timestamp = Date.now();
    const registerData = {
        email: `test${timestamp}@example.com`,
        password: 'Test1234!',
        passwordConfirm: 'Test1234!',
        acceptPrivacyPolicy: true
    };
    const registerResult = await testEndpoint('POST', '/auth/register', registerData);

    let accessToken = null;
    if (registerResult && registerResult.data) {
        accessToken = registerResult.data.accessToken;
        log('✓ Токен получен', 'green');
    }

    // 3. Вход
    log('\n3. Вход пользователя', 'yellow');
    const loginData = {
        email: registerData.email,
        password: registerData.password
    };
    const loginResult = await testEndpoint('POST', '/auth/login', loginData);

    if (loginResult && loginResult.data) {
        accessToken = loginResult.data.accessToken;
        log('✓ Вход успешен', 'green');
    }

    if (!accessToken) {
        log('\n✗ Не удалось получить токен доступа. Остановка тестов.', 'red');
        return;
    }

    // 4. Получение списка ингредиентов
    log('\n4. Получение списка ингредиентов', 'yellow');
    await testEndpoint('GET', '/ingredients?limit=10', null, accessToken);

    // 5. Поиск ингредиентов
    log('\n5. Поиск ингредиентов', 'yellow');
    await testEndpoint('GET', '/ingredients/search?query=мука', null, accessToken);

    // 6. Создание блюда
    log('\n6. Создание блюда', 'yellow');
    const dishData = {
        name: 'Тестовое блюдо',
        description: 'Описание тестового блюда',
        instructions: 'Смешать все ингредиенты и готовить 30 минут',
        cooking_time: 30,
        difficulty_level: 'easy',
        portion_size: 4,
        ingredients: [
            { id: 1, quantity: 500 },
            { id: 2, quantity: 200 }
        ]
    };
    const dishResult = await testEndpoint('POST', '/dishes', dishData, accessToken);

    let dishId = null;
    if (dishResult && dishResult.data) {
        dishId = dishResult.data.id;
        log(`✓ Блюдо создано с ID: ${dishId}`, 'green');
    }

    // 7. Получение списка блюд
    log('\n7. Получение списка блюд', 'yellow');
    await testEndpoint('GET', '/dishes?limit=10', null, accessToken);

    // 8. Получение блюда по ID
    if (dishId) {
        log('\n8. Получение блюда по ID', 'yellow');
        await testEndpoint('GET', `/dishes/${dishId}`, null, accessToken);
    }

    // 9. Обновление блюда
    if (dishId) {
        log('\n9. Обновление блюда', 'yellow');
        const updateData = {
            name: 'Обновленное тестовое блюдо'
        };
        await testEndpoint('PATCH', `/dishes/${dishId}`, updateData, accessToken);
    }

    // 10. Добавление в избранное
    if (dishId) {
        log('\n10. Добавление блюда в избранное', 'yellow');
        await testEndpoint('POST', `/dishes/${dishId}/favorite`, null, accessToken);
    }

    // 11. Удаление из избранного
    if (dishId) {
        log('\n11. Удаление блюда из избранного', 'yellow');
        await testEndpoint('DELETE', `/dishes/${dishId}/favorite`, null, accessToken);
    }

    // 12. Удаление блюда
    if (dishId) {
        log('\n12. Удаление блюда', 'yellow');
        await testEndpoint('DELETE', `/dishes/${dishId}`, null, accessToken);
    }

    // 13. Выход
    log('\n13. Выход из системы', 'yellow');
    await testEndpoint('POST', '/auth/logout', { refreshToken: loginResult?.data?.refreshToken }, accessToken);

    log('\n=== Тестирование завершено ===\n', 'blue');
}

// Проверяем, установлен ли axios
try {
    require.resolve('axios');
    runTests();
} catch (e) {
    console.log('Установка axios...');
    require('child_process').execSync('npm install axios', { stdio: 'inherit' });
    runTests();
}
