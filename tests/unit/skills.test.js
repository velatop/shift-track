const request = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser, Employee, Skill } = require('../../src/models');
let token, employeeId;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createUser('super', 'Pass123!');
    await Skill.bulkCreate([{ name: 'Forklift' }, { name: 'Safety' }, { name: 'Packing' }]);
    const emp = await Employee.create({ name: 'Test Worker', position: 'Picker' });
    employeeId = emp.id;
    const res = await request(app).post('/api/auth/login').send({ username: 'super', password: 'Pass123!' });
    token = res.body.token;
});
afterAll(async () => {
  await sequelize.close();
});

describe('SC-11 — Skills Management', () => {
    test('updates an employees skills', async () => {
        const res = await request(app).put(`/api/employees/${employeeId}/skills`)
            .set('Authorization', `Bearer ${token}`)
            .send({ skillIds: [1, 3] });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('skills_updated_at');
    });

    test('Fails if employeeId does not exist', async () => {
        const res = await request(app).put('/api/employees/9999/skills')
            .set('Authorization', `Bearer ${token}`)
            .send({ skillIds: [1] });
        expect(res.status).toBe(404);
    });
});