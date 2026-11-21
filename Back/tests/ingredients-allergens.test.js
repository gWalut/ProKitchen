const request = require('supertest');
const { app } = require('../src/app');
const db = require('../src/shared/database/db');

describe('Ingredient allergens and Russian dish search', () => {
    let token;
    let ingredientId;
    let milkId;
    let dishId;
    beforeAll(async () => {
        const response = await request(app).post('/api/v1/auth/register').send({
            email: 'allergen-test@example.com', password: 'Allergen-test-9274!',
            passwordConfirm: 'Allergen-test-9274!', acceptPrivacyPolicy: true
        });
        token = response.body.data.accessToken;
        milkId = (await db.run('INSERT INTO allergens (name) VALUES (?)', ['Молоко'])).lastInsertRowid;
    });
    it('creates and reads an ingredient with its allergen links', async () => {
        const created = await request(app).post('/api/v1/ingredients').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Молоко тестовое', unit: 'мл', price_per_unit: 0.09, allergens: [milkId] });
        expect(created.status).toBe(201);
        ingredientId = created.body.data.id;
        const read = await request(app).get(`/api/v1/ingredients/${ingredientId}`).set('Authorization', `Bearer ${token}`);
        expect(read.status).toBe(200);
        expect(read.body.data.allergens).toEqual([expect.objectContaining({ name: 'Молоко' })]);
    });
    it('finds a Russian catalog dish regardless of letter case and returns its allergens', async () => {
        const created = await request(app).post('/api/v1/dishes').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Омлет тестовый', instructions: 'Приготовить', cooking_time: 5,
                difficulty_level: 'easy', portion_size: 200, ingredients: [{ id: ingredientId, quantity: 100 }] });
        expect(created.status).toBe(201);
        dishId = created.body.data.id;
        const found = await request(app).get('/api/v1/dishes/search/by-name').query({ name: '  омлет ТЕСТОВЫЙ  ' });
        expect(found.status).toBe(200);
        expect(found.body.data.id).toBe(dishId);
        expect(found.body.data.ingredients[0].allergens[0].name).toBe('Молоко');
    });
    it('replaces ingredient allergens and rejects nonexistent links', async () => {
        const update = body => request(app).put(`/api/v1/ingredients/${ingredientId}`)
            .set('Authorization', `Bearer ${token}`).send(body);
        expect((await update({ allergens: [] })).status).toBe(200);
        expect((await update({ allergens: [999999] })).status).toBe(400);
        const read = await request(app).get(`/api/v1/ingredients/${ingredientId}`).set('Authorization', `Bearer ${token}`);
        expect(read.body.data.allergens).toEqual([]);
    });
});
