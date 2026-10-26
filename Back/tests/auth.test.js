const request = require('supertest');
const { app } = require('../src/app');
const usersModel = require('../src/features/auth/users.model');
const refreshTokensModel = require('../src/features/auth/refresh-tokens.model');

describe('Auth API', () => {
    const testEmail = `test-auth-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    let testUserId;
    let accessToken;
    let refreshToken;

    afterAll(async () => {
        // Очистка тестовых данных
        if (testUserId) {
            try {
                await usersModel.delete(testUserId);
                await refreshTokensModel.deleteByUserId(testUserId);
            } catch (error) {
                // Игнорируем ошибки очистки
            }
        }
    });

    describe('POST /api/v1/auth/register', () => {
        it('должен успешно зарегистрировать нового пользователя', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: testEmail,
                    password: testPassword,
                    passwordConfirm: testPassword,
                    acceptPrivacyPolicy: true
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe(testEmail);

            testUserId = response.body.data.user.id;
            accessToken = response.body.data.accessToken;
            refreshToken = response.body.data.refreshToken;
        });

        it('должен вернуть ошибку при регистрации с существующим email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: testEmail,
                    password: testPassword,
                    passwordConfirm: testPassword,
                    acceptPrivacyPolicy: true
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('уже существует');
        });

        it('должен вернуть ошибку при несовпадении паролей', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: `another-${Date.now()}@example.com`,
                    password: testPassword,
                    passwordConfirm: 'DifferentPassword',
                    acceptPrivacyPolicy: true
                });

            expect(response.status).toBe(400);
        });

        it('должен вернуть ошибку при коротком пароле', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: `short-${Date.now()}@example.com`,
                    password: '123',
                    passwordConfirm: '123',
                    acceptPrivacyPolicy: true
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('должен успешно авторизовать пользователя', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user.email).toBe(testEmail);
        });

        it('должен вернуть ошибку при неверном пароле', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'WrongPassword123'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Неверн');
        });

        it('должен вернуть ошибку при несуществующем email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword
                });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('должен обновить токены', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    refreshToken: refreshToken
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
        });

        it('должен вернуть ошибку при неверном refresh токене', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    refreshToken: 'invalid-token'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('должен успешно разлогинить пользователя', async () => {
            // Сначала получаем новый токен
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword
                });

            const newRefreshToken = loginResponse.body.data.refreshToken;

            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
                .send({
                    refreshToken: newRefreshToken
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('успешно');
        });
    });
});
