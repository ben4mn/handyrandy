import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

export interface Database {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  close: () => Promise<void>;
}

class DatabaseConnection implements Database {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async get(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params || [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params || [], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export async function initializeDatabase(): Promise<Database> {
  const dbPath = process.env.DATABASE_PATH || './data/ndc_chatbot.db';
  const dbDir = path.dirname(dbPath);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('📊 Connected to SQLite database at:', dbPath);
        resolve(new DatabaseConnection(db));
      }
    });
  });
}

export async function createTables(db: Database): Promise<void> {
  try {
    // Create airlines table
    await db.run(`
      CREATE TABLE IF NOT EXISTS airlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        codes TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Production', 'Pilot', 'Development', 'Inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create features table
    await db.run(`
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL CHECK (category IN ('Shopping', 'Global', 'Booking', 'Servicing', 'Payment')),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create implementations table
    await db.run(`
      CREATE TABLE IF NOT EXISTS implementations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        airline_id INTEGER NOT NULL,
        feature_id INTEGER NOT NULL,
        value TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (airline_id) REFERENCES airlines (id) ON DELETE CASCADE,
        FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE,
        UNIQUE(airline_id, feature_id)
      )
    `);

    // Create indexes for better performance
    await db.run(`CREATE INDEX IF NOT EXISTS idx_airlines_codes ON airlines(codes)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_airlines_provider ON airlines(provider)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_airlines_status ON airlines(status)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_features_category ON features(category)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_features_name ON features(name)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_implementations_airline ON implementations(airline_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_implementations_feature ON implementations(feature_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_implementations_value ON implementations(value)`);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
}