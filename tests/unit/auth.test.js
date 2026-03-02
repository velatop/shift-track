const request  = require('supertest');
const { app } = require('../../server');
const { sequelize, createUser } = require('../../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await createUser('supervisor', 'TestPass123!');
});

afterAll(async () => {
  await sequelize.close();
});

describe('SC-17 — Secure Login', () => {
  test('Successful login returns JWT token', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'supervisor', password: 'TestPass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Incorrect credentials return 401', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'supervisor', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('3 failed attempts will block the account.', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/auth/login')
        .send({ username: 'supervisor', password: 'wrong' });
    }
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'supervisor', password: 'TestPass123!' });
    expect(res.status).toBe(423); // 423 = Locked
    expect(res.body.error).toMatch(/bloqueada|blocked/i);
  });
});
