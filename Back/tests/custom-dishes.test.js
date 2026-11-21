const request = require('supertest');
const { app } = require('../src/app');

describe('Custom dish cost integrity', () => {
    let token;
    let otherToken;
    let id;
    const ingredient = { name: 'Картофель', weight: 200, unit: 'г', pricePerUnit: 0.05 };
    const send = (method, path, body, auth = token) => request(app)[method]('/api/v1/custom-dishes' + path)
        .set('Authorization', `Bearer ${auth}`).send(body);

    beforeAll(async () => {
        for (const other of [false, true]) {
            const response = await request(app).post('/api/v1/auth/register').send({
                email: `dish-${other}-${Date.now()}@example.com`, password: 'Dish-test-9274!',
                passwordConfirm: 'Dish-test-9274!', acceptPrivacyPolicy: true
            });
            expect(response.status).toBe(201);
            if (other) otherToken = response.body.data.accessToken;
            else token = response.body.data.accessToken;
        }
    });

    it('derives totals from ingredients, ignoring forged client costs', async () => {
        const response = await send('post', '', { name: ' Картофель ', portions: 2,
            ingredients: [ingredient], total_cost: 999, cost_per_portion: 888 });
        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({ name: 'Картофель', total_cost: 10, cost_per_portion: 5 });
        id = response.body.data.id;
    });

    it('recalculates a partial portions update without multiplying the ingredient total', async () => {
        const response = await send('put', `/${id}`, { portions: 4 });
        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({ portions: 4, total_cost: 10, cost_per_portion: 2.5 });
    });

    it('supports zero-priced ingredients and recalculates changed quantities', async () => {
        const response = await send('put', `/${id}`, { ingredients: [{ ...ingredient, pricePerUnit: 0 }] });
        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({ total_cost: 0, cost_per_portion: 0 });
        const created = await send('post', '', { name: 'Вода', portions: 1,
            ingredients: [{ ...ingredient, pricePerUnit: 0 }] });
        expect(created.status).toBe(201);
        expect(created.body.data.total_cost).toBe(0);
    });

    it.each([
        { portions: 0 }, { portions: 1.5 }, { name: '   ' }, { ingredients: [] },
        { ingredients: [{ ...ingredient, weight: -1 }] },
        { ingredients: [{ ...ingredient, weight: 0 }] },
        { ingredients: [{ ...ingredient, pricePerUnit: -1 }] }
    ])('rejects invalid edits: %j', async body => {
        expect((await send('put', `/${id}`, body)).status).toBe(400);
        expect((await send('get', `/${id}`)).body.data).toMatchObject({ portions: 4, total_cost: 0 });
    });

    it('prevents another user reading, editing, printing or deleting the dish', async () => {
        for (const [method, path, body] of [
            ['get', `/${id}`], ['put', `/${id}`, { name: 'Чужое' }],
            ['get', `/${id}/label?weight=200&manufactureDate=2026-11-21&shelfLife=2`], ['delete', `/${id}`]
        ]) {
            expect((await send(method, path, body, otherToken)).status).toBe(403);
        }
    });
});
