import request from 'supertest';
import { app } from '../server.js';

describe('Server Tests', () => {
  it('should respond with 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });

  it('should have CORS enabled', async () => {
    const response = await request(app).get('/');
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should have JSON parsing middleware', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .set('Content-Type', 'application/json');
    
    expect(response.status).not.toBe(400); // Should not be a parsing error
  });
}); 