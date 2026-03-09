const request = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser, Employee, Skill, Shift } = require('../../src/models');
let token;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createUser('super', 'Pass123!');
    await Shift.create({
        date: new Date().toISOString().split('T')[0],
        start_time: '06:00', end_time: '14:00',
        operational_area: 'Receiving'
    });
    const res = await request(app).post('/api/auth/login')
        .send({ username: 'super', password: 'Pass123!' });
    token = res.body.token;
});
afterAll(() => sequelize.close());

describe('SC-16 — Coverage Alerts', () => {
    test('returns alerts for uncovered shifts today', async () => {
        const res = await request(app).get('/api/shifts/alerts')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('alert includes area and unfilled positions count', async () => {
        const res = await request(app).get('/api/shifts/alerts')
            .set('Authorization', `Bearer ${token}`);
        expect(res.body[0]).toHaveProperty('operational_area');
        expect(res.body[0]).toHaveProperty('unfilled_positions');
        expect(res.body[0]).toHaveProperty('coverage_status');
    });
});