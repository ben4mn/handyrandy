import { initializeDatabase, createTables, Database } from '../database/database';
import { seedDatabase } from '../database/seed';
import fs from 'fs';
import path from 'path';

describe('Database Tests', () => {
  let db: Database;

  beforeEach(async () => {
    // Use in-memory database for tests to avoid file I/O issues
    process.env.DATABASE_PATH = ':memory:';
    
    // Initialize test database
    db = await initializeDatabase();
    await createTables(db);
  });

  afterEach(async () => {
    if (db) {
      await db.close();
    }
  });

  describe('Database Initialization', () => {
    test('should create database connection', () => {
      expect(db).toBeDefined();
    });

    test('should create tables with correct schema', async () => {
      // Check airlines table
      const airlinesSchema = await db.all("PRAGMA table_info(airlines)");
      expect(airlinesSchema).toHaveLength(7); // id, name, codes, provider, status, created_at, updated_at
      
      // Check features table
      const featuresSchema = await db.all("PRAGMA table_info(features)");
      expect(featuresSchema).toHaveLength(6); // id, category, name, description, created_at, updated_at
      
      // Check implementations table
      const implementationsSchema = await db.all("PRAGMA table_info(implementations)");
      expect(implementationsSchema).toHaveLength(7); // id, airline_id, feature_id, value, notes, created_at, updated_at
    });

    test('should create proper indexes', async () => {
      const indexes = await db.all("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'");
      expect(indexes.length).toBeGreaterThan(0);
      
      const indexNames = indexes.map(idx => idx.name);
      expect(indexNames).toContain('idx_airlines_codes');
      expect(indexNames).toContain('idx_features_name');
      expect(indexNames).toContain('idx_implementations_airline');
    });
  });

  describe('Database Operations', () => {
    test('should insert and retrieve airline data', async () => {
      const result = await db.run(
        'INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
        ['Test Airlines', 'TA', 'Test Provider', 'Production']
      );
      
      expect(result.lastID).toBeGreaterThan(0);
      
      const airline = await db.get('SELECT * FROM airlines WHERE id = ?', [result.lastID]);
      expect(airline.name).toBe('Test Airlines');
      expect(airline.codes).toBe('TA');
      expect(airline.provider).toBe('Test Provider');
      expect(airline.status).toBe('Production');
    });

    test('should insert and retrieve feature data', async () => {
      const result = await db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        ['Shopping', 'Test Feature', 'A test feature for testing']
      );
      
      expect(result.lastID).toBeGreaterThan(0);
      
      const feature = await db.get('SELECT * FROM features WHERE id = ?', [result.lastID]);
      expect(feature.category).toBe('Shopping');
      expect(feature.name).toBe('Test Feature');
      expect(feature.description).toBe('A test feature for testing');
    });

    test('should enforce foreign key constraints', async () => {
      // First ensure we have at least one feature
      const featureResult = await db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        ['Shopping', 'FK Test Feature', 'Testing foreign keys']
      );
      
      // Try to insert implementation with invalid airline_id (using a valid feature_id)
      await expect(
        db.run('INSERT INTO implementations (airline_id, feature_id, value) VALUES (?, ?, ?)', [9999, featureResult.lastID, 'Yes'])
      ).rejects.toThrow();
    });

    test('should enforce unique constraints', async () => {
      // Insert a feature
      await db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        ['Shopping', 'Unique Test Feature', 'Testing uniqueness']
      );
      
      // Try to insert duplicate feature name
      await expect(
        db.run(
          'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
          ['Shopping', 'Unique Test Feature', 'Duplicate name']
        )
      ).rejects.toThrow();
    });
  });

  describe('Database Seeding', () => {
    test('should seed database with sample data', async () => {
      await seedDatabase(db);
      
      // Check airlines were seeded
      const airlines = await db.all('SELECT * FROM airlines');
      expect(airlines.length).toBeGreaterThanOrEqual(5);
      
      // Check features were seeded
      const features = await db.all('SELECT * FROM features');
      expect(features.length).toBeGreaterThanOrEqual(9);
      
      // Check implementations were seeded
      const implementations = await db.all('SELECT * FROM implementations');
      expect(implementations.length).toBeGreaterThanOrEqual(25);
    });

    test('should not duplicate data on multiple seed calls', async () => {
      // First seed
      await seedDatabase(db);
      const initialCount = await db.get('SELECT COUNT(*) as count FROM airlines');
      
      // Call seed again
      await seedDatabase(db);
      
      const finalCount = await db.get('SELECT COUNT(*) as count FROM airlines');
      expect(finalCount.count).toBe(initialCount.count);
    });

    test('should seed with correct data relationships', async () => {
      await seedDatabase(db);
      
      // Verify implementation references valid airline and feature IDs
      const invalidRefs = await db.all(`
        SELECT i.* FROM implementations i
        LEFT JOIN airlines a ON i.airline_id = a.id
        LEFT JOIN features f ON i.feature_id = f.id
        WHERE a.id IS NULL OR f.id IS NULL
      `);
      
      expect(invalidRefs).toHaveLength(0);
    });
  });

  describe('Complex Queries', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    test('should retrieve airlines with their implementations', async () => {
      const results = await db.all(`
        SELECT 
          a.name as airline_name,
          a.codes,
          f.name as feature_name,
          i.value,
          i.notes
        FROM airlines a
        JOIN implementations i ON a.id = i.airline_id
        JOIN features f ON i.feature_id = f.id
        WHERE a.codes = 'AA'
        ORDER BY f.name
      `);
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.airline_name).toBeTruthy();
        expect(result.codes).toBe('AA');
        expect(result.feature_name).toBeTruthy();
        expect(result.value).toBeTruthy();
      });
    });

    test('should filter features by category', async () => {
      const shoppingFeatures = await db.all('SELECT * FROM features WHERE category = ?', ['Shopping']);
      expect(shoppingFeatures.length).toBeGreaterThan(0);
      
      shoppingFeatures.forEach(feature => {
        expect(feature.category).toBe('Shopping');
      });
    });

    test('should find airlines by provider', async () => {
      const sabreAirlines = await db.all('SELECT * FROM airlines WHERE provider LIKE ?', ['%Sabre%']);
      expect(sabreAirlines.length).toBeGreaterThan(0);
      
      sabreAirlines.forEach(airline => {
        expect(airline.provider).toContain('Sabre');
      });
    });
  });
});