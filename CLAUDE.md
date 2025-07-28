# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NDC Features AI Chatbot - A full-stack TypeScript application for querying airline NDC (New Distribution Capability) feature implementation data through an AI-powered chat interface.

**Core Features:**
- Natural language querying of NDC feature data
- Data management interface for airlines, features, and implementations
- Implementation matrix for feature-airline relationships
- AI integration with Anthropic Claude API

## Architecture

### Technology Stack
- **Frontend**: React.js with TypeScript (Create React App)
- **Backend**: Node.js/Express.js with TypeScript  
- **Database**: SQLite with foreign key constraints
- **AI**: Anthropic Claude API (legacy completions API)
- **Containerization**: Docker & Docker Compose
- **Deployment**: Debian Linux server

### Key Components

**Backend Service Architecture:**
- `DatabaseService`: Core CRUD operations and complex queries
- `ClaudeService`: AI integration with query parsing and context building
- `QueryParserService`: Smart query analysis for optimized data retrieval

**Frontend Components:**
- Page-based routing with React Router
- Form components for data management
- Interactive Implementation Matrix with inline editing
- Chat interface with conversation history

**Database Schema:**
- `airlines`: ID, name, codes, provider, status
- `features`: ID, category, name, description  
- `implementations`: airline_id, feature_id, value, notes

## Development Commands

### Root Directory Commands
```bash
# Install all dependencies (root, frontend, backend)
npm run install:all

# Development (runs both frontend and backend concurrently)
npm run dev

# Build both frontend and backend
npm run build

# Run all tests
npm run test

# Docker commands
npm run docker:build
npm run docker:up
npm run docker:down
```

### Backend Commands (in backend/ directory)
```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production server
npm start

# Run tests
npm test

# Linting
npm run lint
npm run lint:fix
```

### Frontend Commands (in frontend/ directory)
```bash
# Development server (port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Testing

**Backend Tests:**
- Located in `backend/src/__tests__/`
- Uses Jest with ts-jest
- Test database setup in `setup.ts`
- Run with: `cd backend && npm test`

**Frontend Tests:**
- Uses React Testing Library
- Run with: `cd frontend && npm test`

## Environment Variables

Required for backend (`.env` file):
```
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3.5-sonnet-20240620  # optional, defaults to this
PORT=3010  # optional, defaults to 3010
DATABASE_PATH=/app/data/handy_randy.db  # for Docker
```

## API Endpoints

Base URL: `http://localhost:3010/api`

**Core APIs:**
- `GET/POST/PUT/DELETE /api/airlines`
- `GET/POST/PUT/DELETE /api/features`  
- `GET/PUT /api/implementations`
- `POST /api/chat` - AI chat endpoint

**Implementation Update:**
- `PUT /api/implementations/:airlineId/:featureId`
- `PUT /api/implementations/:id` (by implementation ID)

## Key Implementation Details

### Query Processing Flow
1. User query → `QueryParserService` analyzes intent
2. Extracts entities (airlines, features, status values)
3. Builds optimized SQL queries to minimize context
4. Sends filtered data + query to Claude API
5. Returns formatted response

### Smart Context Building
- Pre-filters data based on query analysis
- Enriches implementation records with airline/feature names
- Reduces context from 25+ items to relevant subset
- Improves response time and accuracy

### Error Handling
- Custom error types: `NotFoundError`, `DatabaseError`
- Comprehensive validation with express-validator
- Proper HTTP status codes throughout
- Error boundaries in React components

## Docker Deployment

**Production Setup:**
1. Frontend built into backend container
2. Single container serves both frontend and API
3. SQLite database persisted via Docker volume
4. Environment variables configured in docker-compose.yml

**Build & Deploy:**
```bash
docker-compose build
docker-compose up -d
```

## Common Development Tasks

### Adding a New API Endpoint
1. Add route handler in `backend/src/routes/`
2. Add service method in `DatabaseService`
3. Add validation with express-validator
4. Add tests in `backend/src/__tests__/`

### Modifying the Database Schema
1. Update schema in `backend/src/database/database.ts`
2. Update seed data in `backend/src/database/seed.ts`
3. Update TypeScript types in `backend/src/types/`
4. Update service methods as needed

### Updating the AI Prompt
1. Modify system prompt in `ClaudeService.buildSystemPrompt()`
2. Adjust query parsing in `QueryParserService`
3. Test with example queries from vision document

### Frontend Component Development
1. Follow existing component patterns (functional components with hooks)
2. Use TypeScript interfaces for props
3. Handle loading and error states
4. Use existing API service in `frontend/src/services/api.ts`