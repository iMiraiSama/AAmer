import request from 'supertest';
import { app } from '../server.js';
import Provider from '../models/Provider.js';
import mongoose from 'mongoose';

describe('Provider Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://aamerapp1:Aammer@cluster0.sstdt.mongodb.net/aamerTest?retryWrites=true&w=majority');
  });

  beforeEach(async () => {
    await Provider.deleteMany({});
  });

  afterAll(async () => {
    await Provider.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/provider', () => {
    it('should create a new provider', async () => {
      const providerData = {
        firstName: 'Test',
        lastName: 'Provider',
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service',
        userId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/provider')
        .send(providerData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Provider created successfully');
      expect(response.body.provider).toHaveProperty('firstName', providerData.firstName);
      expect(response.body.provider).toHaveProperty('lastName', providerData.lastName);
    });

    it('should not create provider with missing required fields', async () => {
      const providerData = {
        firstName: 'Test',
        // Missing lastName
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service',
        userId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/provider')
        .send(providerData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('All fields are required.');
    });
  });

  describe('GET /api/provider', () => {
    beforeEach(async () => {
      // Create a test provider
      const providerData = {
        firstName: 'Test',
        lastName: 'Provider',
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service',
        userId: new mongoose.Types.ObjectId()
      };

      await Provider.create(providerData);
    });

    it('should get all providers', async () => {
      const response = await request(app)
        .get('/api/provider')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
}); 