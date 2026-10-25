import { rest } from 'msw';
import { server } from './mocks/server';
import { apiClient } from '../api/apiClient';

describe('apiClient', () => {
    it('автоматически обновляет токен при 401 ошибке', async () => {
        // Мокаем последовательность запросов
        let requestCount = 0;

        // Первый запрос вернет 401, второй (после обновления токена) - успех
        server.use(
            rest.get('/api/protected', (req, res, ctx) => {
                requestCount++;
                if (requestCount === 1) {
                    return res(ctx.status(401));
                }
                return res(ctx.json({ data: 'protected data' }));
            })
        );

        // Запрос к защищенному эндпоинту
        const response = await apiClient.get('/protected');

        // Проверяем что данные получены после автоматического обновления токена
        expect(response.data).toEqual({ data: 'protected data' });
        expect(requestCount).toBe(2);
    });

    it('возвращает ошибку если обновление токена не удалось', async () => {
        // Мокаем неудачное обновление токена
        server.use(
            rest.post('/api/auth/refresh', (req, res, ctx) => {
                return res(ctx.status(400));
            })
        );

        // Проверяем что запрос завершается с ошибкой
        await expect(apiClient.get('/protected')).rejects.toThrow();
    });
});