const request = require('supertest');
const app = require('../../server');
const { sequelize, createUser } = require('../../src/models');
let token;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createUser('super', 'Pass123!');
    const res = await request(app).post('/api/auth/login').send({ username: 'super', password: 'Pass123!' });
    token = res.body.token;
});
afterAll(() => sequelize.close());

describe('SC-12 — Shift Creation', () => {
    const shiftData = {
        date: '2026-03-10',
        start_time: '06:00',
        end_time: '14:00',
        operational_area: 'Receiving'
    };

    test('Create a turn correctly', async () => {
        const res = await request(app).post('/api/shifts')
            .set('Authorization', `Bearer ${token}`)
            .send(shiftData);
        expect(res.status).toBe(201);
        expect(res.body.shift).toHaveProperty('id');
    });

    test('reject duplicate appointment (same time, area and date))', async () => {
        const res = await request(app).post('/api/shifts')
            .set('Authorization', `Bearer ${token}`)
            .send(shiftData);
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/duplicado|conflict/i);
    });

    test('It fails if required fields are missing.', async () => {
        const res = await request(app).post('/api/shifts')
            .set('Authorization', `Bearer ${token}`)
            .send({ date: '2026-03-10', operational_area: 'Shipping' });
        expect(res.status).toBe(400);
    });

    test('The shift list includes the created shift', async () => {
        const res = await request(app).get('/api/shifts')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});
