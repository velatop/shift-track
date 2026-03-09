const request = require('supertest');
const { app }  = require('../../server');
const { sequelize, createUser, Skill } = require('../../src/models');

let token;
let employeeId;
let shiftId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await createUser('admin', 'ShiftTrack2026!');
  await Skill.bulkCreate([
    { name: 'Forklift Operator' },
    { name: 'Safety Certified' },
    { name: 'Receiving' },
    { name: 'Shipping' },
  ]);
});
afterAll(() => sequelize.close());

describe('SC-19 — Full Flow Integration', () => {

  // STEP 1: Login
  test('Step 1: supervisor logs in and receives JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'ShiftTrack2026!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  // STEP 2: Register employee
  test('Step 2: supervisor registers employee with skills', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name:     'Maria Lopez',
        position: 'Warehouse Associate',
        skillIds: [1, 2]
      });

    expect(res.status).toBe(201);
    expect(res.body.employee).toHaveProperty('id');
    expect(res.body.employee.name).toBe('Maria Lopez');
    employeeId = res.body.employee.id;
  });

  // STEP 3: Create shift
  test('Step 3: supervisor creates a shift for today', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res   = await request(app)
      .post('/api/shifts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date:             today,
        start_time:       '06:00',
        end_time:         '14:00',
        operational_area: 'Receiving'
      });

    expect(res.status).toBe(201);
    expect(res.body.shift).toHaveProperty('id');
    shiftId = res.body.shift.id;
  });

  // STEP 4: Assign employee to shift
  test('Step 4: supervisor assigns employee to the shift', async () => {
    const res = await request(app)
      .post(`/api/shifts/${shiftId}/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({ employeeId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // STEP 5: Verify summary reflects the assignment
  test('Step 5: daily summary shows employee assigned to shift', async () => {
    const res = await request(app)
      .get('/api/shifts/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const shift = res.body.find(s => s.id === shiftId);
    expect(shift).toBeDefined();
    expect(shift.assigned_employees).toBe(1);
    expect(shift.coverage_status).toBe('partial');
  });

  // STEP 6: Verify alerts show partial coverage
  test('Step 6: alerts endpoint shows shift as partially covered', async () => {
    const res = await request(app)
      .get('/api/shifts/alerts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const alert = res.body.find(a => a.shift_id === shiftId);
    expect(alert).toBeDefined();
    expect(alert.coverage_status).toBe('partial');
    expect(alert.unfilled_positions).toBe(1);
  });

  // STEP 7: Verify employee no longer available for conflicting shift
  test('Step 7: employee is unavailable for a conflicting shift', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Create conflicting shift (same date and time, different area)
    const conflictRes = await request(app)
      .post('/api/shifts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date:             today,
        start_time:       '06:00',
        end_time:         '14:00',
        operational_area: 'Shipping'
      });
    const conflictShiftId = conflictRes.body.shift.id;

    const res = await request(app)
      .get(`/api/shifts/${conflictShiftId}/available-employees`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const ids = res.body.map(e => e.id);
    expect(ids).not.toContain(employeeId);
  });

});