// tests/integration/smoke.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('QA smoke test', () => {
  it('el servidor responde correctamente', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBeLessThan(500);
  });
});