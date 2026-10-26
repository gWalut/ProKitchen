// Mock Test for endpoint integration
const request = require('supertest');
const { app } = require('../../../src/app');
const db = require('../../../src/shared/database/db');

describe('API Endpoints (Integration)', () => {
    describe('GET /api/v1/health', () => {
        it('should return a 200 status for health check', async () => {
            const response = await request(app).get('/api/v1/health');
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.database).toBe('ok');
        });
        it('returns 503 when the database is unavailable', async () => {
            const check = jest.spyOn(db, 'healthCheck').mockResolvedValue(false);
            try {
                const response = await request(app).get('/api/v1/health');
                expect(response.status).toBe(503);
                expect(response.body.database).toBe('unavailable');
            } finally { check.mockRestore(); }
        });
    });

    describe('Auth Routes', () => {
        it('should block unauthorized access to protected routes', async () => {
            const response = await request(app).get('/api/v1/custom-dishes');
            expect(response.status).toBe(401);
        });
    });
});
