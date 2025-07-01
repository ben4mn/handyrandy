import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase, createTables } from '../database/database';
import { seedDatabase } from '../database/seed';
import { DatabaseService } from '../services/database.service';
import { createAirlinesRouter } from '../routes/airlines';
import { createFeaturesRouter } from '../routes/features';
import { createImplementationsRouter } from '../routes/implementations';

describe('API Endpoints Tests', () => {
  let app: express.Application;
  let dbService: DatabaseService;

  beforeAll(async () => {
    // Create test app
    app = express();
    
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Initialize database for testing
    process.env.DATABASE_PATH = ':memory:';
    const db = await initializeDatabase();
    await createTables(db);
    await seedDatabase(db);
    
    // Initialize database service
    dbService = new DatabaseService(db);
    
    // Set up API routes
    app.use('/api/airlines', createAirlinesRouter(dbService));
    app.use('/api/features', createFeaturesRouter(dbService));
    app.use('/api/implementations', createImplementationsRouter(dbService));
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'NDC Chatbot API is running',
        timestamp: new Date().toISOString()
      });
    });
  });

  describe('Airlines API', () => {
    test('GET /api/airlines should return all airlines', async () => {
      const response = await request(app)
        .get('/api/airlines')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toContain('Found');
    });

    test('GET /api/airlines/:id should return specific airline', async () => {
      const response = await request(app)
        .get('/api/airlines/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('codes');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data).toHaveProperty('status');
    });

    test('GET /api/airlines/:id should return 404 for non-existent airline', async () => {
      const response = await request(app)
        .get('/api/airlines/9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not found');
    });

    test('GET /api/airlines/:id/implementations should return airline with implementations', async () => {
      const response = await request(app)
        .get('/api/airlines/1/implementations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('implementations');
      expect(Array.isArray(response.body.data.implementations)).toBe(true);
    });

    test('POST /api/airlines should create new airline', async () => {
      const newAirline = {
        name: 'Test Airways',
        codes: 'TA',
        provider: 'Test Provider',
        status: 'Development'
      };

      const response = await request(app)
        .post('/api/airlines')
        .send(newAirline)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newAirline.name);
      expect(response.body.data.codes).toBe(newAirline.codes);
      expect(response.body.data.provider).toBe(newAirline.provider);
      expect(response.body.data.status).toBe(newAirline.status);
      expect(response.body.message).toBe('Airline created successfully');
    });

    test('POST /api/airlines should validate required fields', async () => {
      const invalidAirline = {
        name: '',
        codes: 'TA',
        provider: 'Test Provider'
        // missing status
      };

      const response = await request(app)
        .post('/api/airlines')
        .send(invalidAirline)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('PUT /api/airlines/:id should update existing airline', async () => {
      const updates = {
        name: 'Updated Airways',
        status: 'Production'
      };

      const response = await request(app)
        .put('/api/airlines/1')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.message).toBe('Airline updated successfully');
    });

    test('DELETE /api/airlines/:id should delete airline', async () => {
      // First create an airline to delete
      const newAirline = {
        name: 'Delete Me Airways',
        codes: 'DM',
        provider: 'Test Provider',
        status: 'Development'
      };

      const createResponse = await request(app)
        .post('/api/airlines')
        .send(newAirline)
        .expect(201);

      const airlineId = createResponse.body.data.id;

      // Now delete it
      const deleteResponse = await request(app)
        .delete(`/api/airlines/${airlineId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Airline deleted successfully');

      // Verify it's gone
      await request(app)
        .get(`/api/airlines/${airlineId}`)
        .expect(404);
    });
  });

  describe('Features API', () => {
    test('GET /api/features should return all features', async () => {
      const response = await request(app)
        .get('/api/features')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toContain('Found');
    });

    test('GET /api/features/:id should return specific feature', async () => {
      const response = await request(app)
        .get('/api/features/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('category');
      expect(response.body.data).toHaveProperty('name');
    });

    test('GET /api/features/:id/implementations should return feature with implementations', async () => {
      const response = await request(app)
        .get('/api/features/1/implementations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('implementations');
      expect(Array.isArray(response.body.data.implementations)).toBe(true);
    });

    test('POST /api/features should create new feature', async () => {
      const newFeature = {
        category: 'Shopping',
        name: 'Test Feature',
        description: 'A test feature for testing'
      };

      const response = await request(app)
        .post('/api/features')
        .send(newFeature)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe(newFeature.category);
      expect(response.body.data.name).toBe(newFeature.name);
      expect(response.body.data.description).toBe(newFeature.description);
    });

    test('POST /api/features should validate category', async () => {
      const invalidFeature = {
        category: 'InvalidCategory',
        name: 'Test Feature'
      };

      const response = await request(app)
        .post('/api/features')
        .send(invalidFeature)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('PUT /api/features/:id should update existing feature', async () => {
      const updates = {
        name: 'Updated Feature Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/features/1')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
    });

    test('DELETE /api/features/:id should delete feature', async () => {
      // First create a feature to delete
      const newFeature = {
        category: 'Shopping',
        name: 'Delete Me Feature',
        description: 'This feature will be deleted'
      };

      const createResponse = await request(app)
        .post('/api/features')
        .send(newFeature)
        .expect(201);

      const featureId = createResponse.body.data.id;

      // Now delete it
      const deleteResponse = await request(app)
        .delete(`/api/features/${featureId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify it's gone
      await request(app)
        .get(`/api/features/${featureId}`)
        .expect(404);
    });
  });

  describe('Implementations API', () => {
    test('GET /api/implementations should return all implementations', async () => {
      const response = await request(app)
        .get('/api/implementations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/implementations/:airlineId/:featureId should return specific implementation', async () => {
      const response = await request(app)
        .get('/api/implementations/1/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('airline_id', 1);
      expect(response.body.data).toHaveProperty('feature_id', 1);
      expect(response.body.data).toHaveProperty('value');
    });

    test('GET /api/implementations/:airlineId/:featureId should return 404 for non-existent implementation', async () => {
      const response = await request(app)
        .get('/api/implementations/9999/9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not found');
    });

    test('POST /api/implementations should create new implementation', async () => {
      // First create a test airline and feature
      const airline = await request(app)
        .post('/api/airlines')
        .send({
          name: 'Test Airline for Implementation',
          codes: 'TAI',
          provider: 'Test Provider',
          status: 'Development'
        });

      const feature = await request(app)
        .post('/api/features')
        .send({
          category: 'Shopping',
          name: 'Test Feature for Implementation'
        });

      const newImplementation = {
        airline_id: airline.body.data.id,
        feature_id: feature.body.data.id,
        value: 'Yes',
        notes: 'Test implementation'
      };

      const response = await request(app)
        .post('/api/implementations')
        .send(newImplementation)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.airline_id).toBe(newImplementation.airline_id);
      expect(response.body.data.feature_id).toBe(newImplementation.feature_id);
      expect(response.body.data.value).toBe(newImplementation.value);
      expect(response.body.data.notes).toBe(newImplementation.notes);
    });

    test('POST /api/implementations should prevent duplicate implementations', async () => {
      const duplicateImplementation = {
        airline_id: 1,
        feature_id: 1,
        value: 'No'
      };

      const response = await request(app)
        .post('/api/implementations')
        .send(duplicateImplementation)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Conflict');
    });

    test('PUT /api/implementations/:airlineId/:featureId should update implementation', async () => {
      const updates = {
        value: 'Updated Value',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put('/api/implementations/1/1')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value).toBe(updates.value);
      expect(response.body.data.notes).toBe(updates.notes);
    });

    test('DELETE /api/implementations/:airlineId/:featureId should delete implementation', async () => {
      // First create an implementation to delete
      const airline = await request(app)
        .post('/api/airlines')
        .send({
          name: 'Delete Implementation Airline',
          codes: 'DIA',
          provider: 'Test Provider',
          status: 'Development'
        });

      const feature = await request(app)
        .post('/api/features')
        .send({
          category: 'Shopping',
          name: 'Delete Implementation Feature'
        });

      await request(app)
        .post('/api/implementations')
        .send({
          airline_id: airline.body.data.id,
          feature_id: feature.body.data.id,
          value: 'Yes'
        });

      // Now delete it
      const deleteResponse = await request(app)
        .delete(`/api/implementations/${airline.body.data.id}/${feature.body.data.id}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify it's gone
      await request(app)
        .get(`/api/implementations/${airline.body.data.id}/${feature.body.data.id}`)
        .expect(404);
    });
  });

  describe('Input Validation', () => {
    test('should validate airline status values', async () => {
      const invalidAirline = {
        name: 'Test Airways',
        codes: 'TA',
        provider: 'Test Provider',
        status: 'InvalidStatus'
      };

      const response = await request(app)
        .post('/api/airlines')
        .send(invalidAirline)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Status must be one of');
    });

    test('should validate feature category values', async () => {
      const invalidFeature = {
        category: 'InvalidCategory',
        name: 'Test Feature'
      };

      const response = await request(app)
        .post('/api/features')
        .send(invalidFeature)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Category must be one of');
    });

    test('should validate ID parameters as positive integers', async () => {
      const response = await request(app)
        .get('/api/airlines/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ID must be a positive integer');
    });

    test('should validate required fields for airline creation', async () => {
      const incompleteAirline = {
        name: 'Test Airways'
        // missing codes, provider, status
      };

      const response = await request(app)
        .post('/api/airlines')
        .send(incompleteAirline)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should validate implementation foreign key references', async () => {
      const invalidImplementation = {
        airline_id: 9999,
        feature_id: 9999,
        value: 'Yes'
      };

      const response = await request(app)
        .post('/api/implementations')
        .send(invalidImplementation)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});