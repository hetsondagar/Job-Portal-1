const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.TEST_SQLITE = 'true';

const {
  sequelize,
  User,
  Company,
  Job,
  Resume,
  syncDatabase
} = require('../config');

// Require app AFTER env/config are set so it picks up sqlite test config
const app = require('..');

describe.skip('Application deadline enforcement (integration - requires DB)', () => {
  let candidateUser;
  let employerUser;
  let company;
  let jobPast;
  let jobFuture;
  let candidateToken;
  let candidateResume;

  beforeAll(async () => {
    // Recreate schema for clean test environment
    await sequelize.sync({ force: true });

    // Create employer, company, candidate
    employerUser = await User.create({
      email: 'employer@example.com',
      password: 'hashed-password-not-used',
      user_type: 'employer',
      firstName: 'Emp',
      lastName: 'Loyer',
      is_active: true
    });

    company = await Company.create({
      name: 'TestCo',
      slug: 'testco'
    });

    candidateUser = await User.create({
      email: 'candidate@example.com',
      password: 'hashed-password-not-used',
      user_type: 'candidate',
      firstName: 'Cand',
      lastName: 'Idate',
      is_active: true
    });

    // Default resume for candidate (some endpoints look it up)
    candidateResume = await Resume.create({
      userId: candidateUser.id,
      isDefault: true,
      title: 'Default Resume'
    });

    // Two jobs: one past deadline, one future deadline
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    jobPast = await Job.create({
      title: 'Past Deadline Job',
      employerId: employerUser.id,
      companyId: company.id,
      status: 'active',
      publishedAt: now,
      applicationDeadline: past,
      validTill: future // validTill in future but applicationDeadline already passed should still block
    });

    jobFuture = await Job.create({
      title: 'Future Deadline Job',
      employerId: employerUser.id,
      companyId: company.id,
      status: 'active',
      publishedAt: now,
      applicationDeadline: future,
      validTill: future
    });

    // JWT for candidate
    candidateToken = jwt.sign({ id: candidateUser.id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('blocks applying via /api/jobs/:id/apply when applicationDeadline passed', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobPast.id}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ coverLetter: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body && res.body.message).toMatch(/deadline passed|Applications are closed/i);
  });

  test('allows applying via /api/jobs/:id/apply when applicationDeadline not passed', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobFuture.id}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ coverLetter: 'Test' });

    expect([200, 201]).toContain(res.status);
    expect(res.body && res.body.success).toBe(true);
  });

  test('blocks applying via /api/user/applications when applicationDeadline passed', async () => {
    const res = await request(app)
      .post(`/api/user/applications`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ jobId: jobPast.id, coverLetter: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body && res.body.message).toMatch(/deadline passed|Applications are closed/i);
  });

  test('allows applying via /api/user/applications when applicationDeadline not passed', async () => {
    const res = await request(app)
      .post(`/api/user/applications`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ jobId: jobFuture.id, coverLetter: 'Test' });

    expect([200, 201]).toContain(res.status);
    expect(res.body && res.body.success).toBe(true);
  });
});


