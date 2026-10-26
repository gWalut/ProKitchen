const request = require('supertest');
const { app } = require('../src/app');
const usersModel = require('../src/features/auth/users.model');
const refreshTokensModel = require('../src/features/auth/refresh-tokens.model');

describe('Change Password API', () => {
    let accessToken;
    let refreshToken;
    let userId;
    const testEmail = `test-password-${Date.now()}@example.com`;
    const originalPassword = 'OldPassword123';
    const newPassword = 'NewPassword123';

    beforeAll(async () => {
        // Создаем тестового пользователя
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: testEmail,
                password: originalPassword,
                passwordConfirm: originalPassword,
                acceptPrivacyPolicy: true
            });

        accessToken = response.body.data.accessToken;
        refreshToken = response.body.data.refreshToken;
        userId = response.body.data.user.id;
    });

    afterAll(async () => {
        // Удаляем тестового пользователя
        if (userId) {
            try {
                await usersModel.delete(userId);
                await refreshTokensModel.deleteByUserId(userId);
            } catch (error) {
                // Игнорируем ошибки очистки
            }
        }
    });

    describe('POST /api/v1/auth/change-password', () => {
        it('должен успешно сменить пароль с корректными данными', async () => {
            const response = await request(app)
                .post('/api/v1/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: originalPassword,
                    newPassword: newPassword
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Пароль успешно изменен');
            expect(response.body.data.success).toBe(true);

            // Проверяем, что новый пароль работает
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.data.user.email).toBe(testEmail);
        });

        it('должен вернуть 401 при неверном текущем пароле', async () => {
            // Сначала логинимся с новым паролем
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });

            const newAccessToken = loginResponse.body.data.accessToken;

            const response = await request(app)
                .post('/api/v1/auth/change-password')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .send({
                    currentPassword: 'WrongPassword123',
                    newPassword: 'AnotherPassword123'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Неверный текущий пароль');
        });

        it('должен вернуть 400 при отсутствии текущего пароля', async () => {
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });

            const newAccessToken = loginResponse.body.data.accessToken;

            const response = await request(app)
                .post('/api/v1/auth/change-password')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .send({
                    newPassword: 'AnotherPassword123'
                });

            expect(response.status).toBe(400);
        });

        it('должен вернуть 400 при коротком новом пароле', async () => {
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });

            const newAccessToken = loginResponse.body.data.accessToken;

            const response = await request(app)
                .post('/api/v1/auth/change-password')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .send({
                    currentPassword: newPassword,
                    newPassword: '123'
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: 'newPassword', message: expect.stringContaining('8 символов') })
            ]));
        });

        it('должен вернуть 401 без авторизации', async () => {
            const response = await request(app)
                .post('/api/v1/auth/change-password')
                .send({
                    currentPassword: newPassword,
                    newPassword: 'NewPassword456'
                });

            expect(response.status).toBe(401);
        });

        it('должен отозвать все refresh токены после смены пароля', async () => {
            // Логинимся и получаем новые токены
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: newPassword
                });

            const oldRefreshToken = loginResponse.body.data.refreshToken;
            const testAccessToken = loginResponse.body.data.accessToken;

            // Меняем пароль
            await request(app)
                .post('/api/v1/auth/change-password')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({
                    currentPassword: newPassword,
                    newPassword: 'FinalPassword123'
                });

            // Пытаемся обновить токен со старым refresh токеном
            const refreshResponse = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    refreshToken: oldRefreshToken
                });

            expect(refreshResponse.status).toBe(401);
        });
    });
});
