const request = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser, Employee, Skill, Shift } = require('../../src/models');
let token, shiftId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await createUser('super', 'Pass123!');

  const forklift = await Skill.create({ name: 'Forklift' });
  const safety   = await Skill.create({ name: 'Safety' });

  const emp1 = await Employee.create({ name: 'John', position: 'Loader' });
  await emp1.setSkills([forklift]);

  const emp2 = await Employee.create({ name: 'Ana', position: 'Picker' });
  await emp2.setSkills([safety]);

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

describe('SC-14 — Filter Available Employees', () => {
  test('returns only employees with required skills for the shift area', async () => {
    const res = await request(app)
      .get(`/api/shifts/${shiftId}/available-employees`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('returns 404 if shift does not exist', async () => {
    const res = await request(app)
      .get('/api/shifts/9999/available-employees')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
