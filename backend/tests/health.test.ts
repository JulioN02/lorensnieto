import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';

describe('Health Check', () => {
  it('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });
});
