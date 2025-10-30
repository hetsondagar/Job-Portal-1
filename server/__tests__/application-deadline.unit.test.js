const { isApplicationsClosed } = require('../utils/applicationDeadline');

describe('isApplicationsClosed', () => {
  test('returns true when validTill is in the past', () => {
    const now = new Date('2025-01-02T00:00:00Z');
    const job = { validTill: '2025-01-01T00:00:00Z' };
    expect(isApplicationsClosed(job, now)).toBe(true);
  });

  test('returns true when applicationDeadline is in the past', () => {
    const now = new Date('2025-01-02T00:00:00Z');
    const job = { applicationDeadline: '2025-01-01T00:00:00Z' };
    expect(isApplicationsClosed(job, now)).toBe(true);
  });

  test('returns false when both dates are in the future', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const job = { validTill: '2025-01-02T00:00:00Z', applicationDeadline: '2025-01-03T00:00:00Z' };
    expect(isApplicationsClosed(job, now)).toBe(false);
  });

  test('returns false when dates are missing', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const job = { title: 'No dates' };
    expect(isApplicationsClosed(job, now)).toBe(false);
  });
});


