import request from 'supertest';
import { app } from '../server.js';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import mongoose from 'mongoose';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb+srv://aamerapp1:Aammer@cluster0.sstdt.mongodb.net/aamerTest?retryWrites=true&w=majority');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Provider.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Provider.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and provider', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'provider',
        firstName: 'Test',
        lastName: 'User',
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('✅ User created successfully');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should not create user without required fields', async () => {
      const userData = {
        email: 'test@example.com',
        // Missing password
        userType: 'provider'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should not create provider without required provider fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'provider',
        firstName: 'Test',
        // Missing other provider fields
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All provider fields are required');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'provider',
        firstName: 'Test',
        lastName: 'User',
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .set('Content-Type', 'application/json');
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('✅ Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userType');
      expect(response.body).toHaveProperty('userId');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/users', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'provider',
        firstName: 'Test',
        lastName: 'User',
        location: 'Test Location',
        licenseNumber: '12345',
        companyName: 'Test Company',
        serviceType: 'Test Service'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .set('Content-Type', 'application/json');
    });

    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
}); 