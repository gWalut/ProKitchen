// Mock Test for endpoint integration
const request = require('supertest');
const { app, server } = require('../../../src/app');

describe('API Endpoints (Integration)', () => {
    afterAll((done) => {
        server.close(done);
    });

    describe('GET /api/v1/health', () => {
        it('should return a 200 status for health check', async () => {
            const response = await request(app).get('/api/v1/health');
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });
    });

    describe('Auth Routes', () => {
        it('should block unauthorized access to protected routes', async () => {
            const response = await request(app).get('/api/v1/custom-dishes');
            expect(response.status).toBe(401);
        });
    });
});
