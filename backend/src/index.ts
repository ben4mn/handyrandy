import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase, createTables } from './database/database';
import { seedDatabase } from './database/seed';
import { DatabaseService } from './services/database.service';
import { createAirlinesRouter } from './routes/airlines';
import { createFeaturesRouter } from './routes/features';
import { createImplementationsRouter } from './routes/implementations';
import { createChatRouter } from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NDC Chatbot API is running',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // Initialize database
    const db = await initializeDatabase();
    await createTables(db);
    await seedDatabase(db);
    
    // Initialize database service
    const dbService = new DatabaseService(db);
    
    // Set up API routes
    app.use('/api/airlines', createAirlinesRouter(dbService));
    app.use('/api/features', createFeaturesRouter(dbService));
    app.use('/api/implementations', createImplementationsRouter(dbService));
    app.use('/api/chat', createChatRouter(dbService));
    
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
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 API endpoints: http://localhost:${PORT}/api`);
      console.log(`✈️  Airlines API: http://localhost:${PORT}/api/airlines`);
      console.log(`🔧 Features API: http://localhost:${PORT}/api/features`);
      console.log(`⚙️  Implementations API: http://localhost:${PORT}/api/implementations`);
      console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();