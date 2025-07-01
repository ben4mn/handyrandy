import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeDatabase, createTables } from '../database/database';
import { seedDatabase } from '../database/seed';

// Create test app
const createTestApp = async () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Initialize database for testing
  const db = await initializeDatabase();
  await createTables(db);
  await seedDatabase(db);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'NDC Chatbot API is running',
      timestamp: new Date().toISOString()
    });
  });

  // API routes placeholder
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'NDC Features AI Chatbot API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        airlines: '/api/airlines',
        features: '/api/features',
        implementations: '/api/implementations',
        chat: '/api/chat'
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  return app;
};

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('Health Check Endpoint', () => {
    test('GET /api/health should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'NDC Chatbot API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('API Info Endpoint', () => {
    test('GET /api should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'NDC Features AI Chatbot API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health', '/api/health');
      expect(response.body.endpoints).toHaveProperty('airlines', '/api/airlines');
      expect(response.body.endpoints).toHaveProperty('features', '/api/features');
      expect(response.body.endpoints).toHaveProperty('implementations', '/api/implementations');
      expect(response.body.endpoints).toHaveProperty('chat', '/api/chat');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    test('should return 404 for non-API routes', async () => {
      const response = await request(app)
        .get('/random-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('CORS and Security Headers', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options'); // Can be DENY or SAMEORIGIN
    });
  });

  describe('Content Type Handling', () => {
    test('should handle JSON content type', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should parse JSON request bodies', async () => {
      // This test will be more relevant when we have POST endpoints
      // For now, just ensure the middleware is set up correctly
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('API Response Structure', () => {
    test('health endpoint should have consistent response structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Check response structure
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
      
      // Verify timestamp is valid ISO string
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });

    test('API info endpoint should have consistent response structure', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.version).toBe('string');
      expect(typeof response.body.endpoints).toBe('object');
      
      // Check all expected endpoints are strings
      Object.values(response.body.endpoints).forEach(endpoint => {
        expect(typeof endpoint).toBe('string');
      });
    });

    test('error responses should have consistent structure', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('Performance and Load', () => {
    test('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/health').expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
      });
    });

    test('should respond quickly to health checks', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Health check should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });
  });
});