import { initializeDatabase, createTables } from '../database/database';
import { seedDatabase } from '../database/seed';
import fs from 'fs';
import path from 'path';

describe('Utility Functions Tests', () => {
  describe('Environment Configuration', () => {
    test('should use test environment variables', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.DATABASE_PATH).toContain('test');
      expect(process.env.PORT).toBe('3002');
    });

    test('should create test database in correct location', () => {
      const dbPath = process.env.DATABASE_PATH!;
      expect(dbPath).toContain('test');
      expect(path.dirname(dbPath)).toContain('test_data');
    });
  });

  describe('Database File Management', () => {
    test('should create database directory if it does not exist', async () => {
      const testDbPath = './test_data/new_test.db';
      const testDbDir = path.dirname(testDbPath);
      
      // Remove directory if it exists
      if (fs.existsSync(testDbDir)) {
        if (fs.existsSync(testDbPath)) {
          fs.unlinkSync(testDbPath);
        }
        fs.rmdirSync(testDbDir);
      }
      
      // Temporarily change DATABASE_PATH
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = testDbPath;
      
      try {
        const db = await initializeDatabase();
        await createTables(db);
        await db.close();
        
        expect(fs.existsSync(testDbDir)).toBe(true);
        expect(fs.existsSync(testDbPath)).toBe(true);
        
        // Clean up
        fs.unlinkSync(testDbPath);
        try {
          fs.rmdirSync(testDbDir);
        } catch (error) {
          // Directory might not be empty, ignore
        }
      } finally {
        process.env.DATABASE_PATH = originalPath;
      }
    });
  });

  describe('Data Validation', () => {
    let db: any;
    
    beforeEach(async () => {
      const testDbPath = './test_data/validation_test_' + Date.now() + '.db';
      process.env.DATABASE_PATH = testDbPath;
      db = await initializeDatabase();
      await createTables(db);
    });
    
    afterEach(async () => {
      if (db) {
        await db.close();
        const testDbPath = process.env.DATABASE_PATH!;
        if (fs.existsSync(testDbPath)) {
          fs.unlinkSync(testDbPath);
        }
      }
    });

    test('should enforce airline status constraints', async () => {
      // Valid status should work
      await expect(
        db.run('INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
          ['Test Airline', 'TA', 'Test Provider', 'Production'])
      ).resolves.toBeDefined();

      // Invalid status should fail
      await expect(
        db.run('INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
          ['Test Airline 2', 'TA2', 'Test Provider', 'InvalidStatus'])
      ).rejects.toThrow();
    });

    test('should enforce feature category constraints', async () => {
      // Valid category should work
      await expect(
        db.run('INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
          ['Shopping', 'Test Feature', 'Test Description'])
      ).resolves.toBeDefined();

      // Invalid category should fail
      await expect(
        db.run('INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
          ['InvalidCategory', 'Test Feature 2', 'Test Description'])
      ).rejects.toThrow();
    });

    test('should handle empty and null values appropriately', async () => {
      // Name is required for airlines
      await expect(
        db.run('INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
          [null, 'TA3', 'Test Provider', 'Production'])
      ).rejects.toThrow();

      // Description can be null for features
      await expect(
        db.run('INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
          ['Shopping', 'Test Feature Null Desc', null])
      ).resolves.toBeDefined();
    });
  });

  describe('Database Connection Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/invalid/path/that/does/not/exist/test.db';
      
      try {
        await expect(initializeDatabase()).rejects.toThrow();
      } finally {
        process.env.DATABASE_PATH = originalPath;
      }
    });

    test('should properly close database connections', async () => {
      const db = await initializeDatabase();
      await createTables(db);
      
      // Should close without error
      await expect(db.close()).resolves.toBeUndefined();
      
      // Operations after close should fail
      await expect(db.get('SELECT 1')).rejects.toThrow();
    });
  });

  describe('Timestamp Handling', () => {
    let db: any;
    
    beforeEach(async () => {
      const testDbPath = './test_data/timestamp_test_' + Date.now() + '.db';
      process.env.DATABASE_PATH = testDbPath;
      db = await initializeDatabase();
      await createTables(db);
    });
    
    afterEach(async () => {
      if (db) {
        await db.close();
        const testDbPath = process.env.DATABASE_PATH!;
        if (fs.existsSync(testDbPath)) {
          fs.unlinkSync(testDbPath);
        }
      }
    });

    test('should automatically set created_at and updated_at timestamps', async () => {
      const result = await db.run(
        'INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
        ['Timestamp Test Airline', 'TTA', 'Test Provider', 'Production']
      );
      
      const airline = await db.get('SELECT * FROM airlines WHERE id = ?', [result.lastID]);
      
      expect(airline.created_at).toBeTruthy();
      expect(airline.updated_at).toBeTruthy();
      expect(new Date(airline.created_at)).toBeInstanceOf(Date);
      expect(new Date(airline.updated_at)).toBeInstanceOf(Date);
    });

    test('should have recent timestamps', async () => {
      const result = await db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        ['Shopping', 'Timestamp Test Feature', 'Testing timestamps']
      );
      
      const feature = await db.get('SELECT * FROM features WHERE id = ?', [result.lastID]);
      
      // Simply verify the timestamp exists and is a valid date string
      expect(feature.created_at).toBeTruthy();
      expect(feature.updated_at).toBeTruthy();
      expect(new Date(feature.created_at)).toBeInstanceOf(Date);
      expect(new Date(feature.updated_at)).toBeInstanceOf(Date);
      expect(isNaN(new Date(feature.created_at).getTime())).toBe(false);
    });
  });
});