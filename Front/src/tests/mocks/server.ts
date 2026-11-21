import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
    http.post('/api/v1/auth/login', () => HttpResponse.json({ data: {
        accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'user' }
    } })),
    http.post('/api/v1/auth/refresh', () => HttpResponse.json({ data: {
        accessToken: 'new-access-token', refreshToken: 'new-refresh-token'
    } })),
    http.get('/api/v1/ingredients/search', () => HttpResponse.json({ data: [
        { id: 1, name: 'Мука пшеничная', unit: 'г', price_per_unit: 0.05 },
        { id: 2, name: 'Молоко', unit: 'мл', price_per_unit: 0.08 }
    ] }))
];
export const server = setupServer(...handlers);
