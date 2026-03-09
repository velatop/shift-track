const request = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser, Employee, Skill, Shift } = require('../../src/models');
let token, shiftId, employeeId;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createUser('super', 'Pass123!');
    const skill = await Skill.create({ name: 'Forklift' });
    const emp = await Employee.create({ name: 'John', position: 'Loader' });
    await emp.setSkills([skill]);
    employeeId = emp.id;
    const shift = await Shift.create({
        date: '2026-04-01', start_time: '06:00',
        end_time: '14:00', operational_area: 'Receiving'
    });
    shiftId = shift.id;
    const res = await request(app).post('/api/auth/login')
        .send({ username: 'super', password: 'Pass123!' });
    token = res.body.token;
});
afterAll(() => sequelize.close());

describe('SC-15 — Shift Assignment', () => {
    test('assigns an employee to a shift successfully', async () => {
        const res = await request(app)
            .post(`/api/shifts/${shiftId}/assign`)
            .set('Authorization', `Bearer ${token}`)
            .send({ employeeId });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    test('fails if employee is already assigned to a conflicting shift', async () => {
        const conflict = await Shift.create({
            date: '2026-04-01', start_time: '06:00',
            end_time: '14:00', operational_area: 'Shipping'
        });
        const res = await request(app)
            .post(`/api/shifts/${conflict.id}/assign`)
            .set('Authorization', `Bearer ${token}`)
            .send({ employeeId });
        expect(res.status).toBe(409);
    });

    test('fails if shift does not exist', async () => {
        const res = await request(app)
            .post('/api/shifts/9999/assign')
            .set('Authorization', `Bearer ${token}`)
            .send({ employeeId });
        expect(res.status).toBe(404);
    });
});
