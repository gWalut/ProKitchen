import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
    // Auth handlers
    rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                token: 'mock-token',
                refreshToken: 'mock-refresh-token',
                user: {
                    id: '1',
                    email: 'test@example.com'
                }
            })
        );
    }),

    rest.post('/api/auth/refresh', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                token: 'new-mock-token',
                refreshToken: 'new-mock-refresh-token'
            })
        );
    }),

    // Ingredients handlers
    rest.get('/api/ingredients/search', (req, res, ctx) => {
        const query = req.url.searchParams.get('q');
        return res(
            ctx.status(200),
            ctx.json({
                items: [
                    { id: 1, name: 'Мука пшеничная', unit: 'г', price_per_unit: 0.05 },
                    { id: 2, name: 'Молоко', unit: 'мл', price_per_unit: 0.08 }
                ]
            })
        );
    })
];

export const server = setupServer(...handlers);