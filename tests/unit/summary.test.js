const request = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser, Employee, Skill, Shift } = require('../../src/models');
let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await createUser('super', 'Pass123!');
  const skill = await Skill.create({ name: 'Forklift' });
  const emp   = await Employee.create({ name: 'John', position: 'Loader' });
  await emp.setSkills([skill]);
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

describe('SC-13 — Daily Summary', () => {
  test('returns todays shifts grouped by area with coverage status', async () => {
    const res = await request(app).get('/api/shifts/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('operational_area');
    expect(res.body[0]).toHaveProperty('coverage_status');
  });

  test('coverage_status is uncovered when no employees assigned', async () => {
    const res = await request(app).get('/api/shifts/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body[0].coverage_status).toBe('uncovered');
  });
});
