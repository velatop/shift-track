const request = require('supertest');
const app = require('../../server');
const { sequelize, createUser, Skill } = require('../../src/models');
let token;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createUser('super', 'Pass123!');
    await Skill.bulkCreate([{ name: 'Forklift' }, { name: 'Safety' }]);
    const res = await request(app).post('/api/auth/login')
        .send({ username: 'super', password: 'Pass123!' });
    token = res.body.token;
});
afterAll(() => sequelize.close());

describe('SC-10 — Employee Registration', () => {
    test('Create employee with name, position, and skills', async () => {
        const res = await request(app).post('/api/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'John Wick', position: 'Loader', skillIds: [1, 2] });
        expect(res.status).toBe(201);
        expect(res.body.employee).toHaveProperty('id');
        expect(res.body.message).toMatch(/exitoso|success/i);
    });

    test('It fails if at least one skill is not included', async () => {
        const res = await request(app).post('/api/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'David Beckham', position: 'Picker', skillIds: [] });
        expect(res.status).toBe(400);
    });

    test('employee list returns the created employee', async () => {
        const res = await request(app).get('/api/employees')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});