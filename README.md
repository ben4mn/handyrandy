# NDC Features AI Chatbot

An AI-powered chatbot system for querying NDC (New Distribution Capability) feature implementation data across airlines and providers.

## Project Overview

This system allows users to query airline NDC feature data using natural language through an AI-powered chat interface. It includes a data management interface for maintaining airline, feature, and implementation data.

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js/Express.js with TypeScript  
- **Database**: SQLite
- **AI**: Anthropic Claude API
- **Containerization**: Docker & Docker Compose
- **Deployment**: Debian Linux server

## Project Structure

```
/
├── frontend/          # React TypeScript app
├── backend/           # Node.js Express API
├── docker/            # Docker configuration files
├── docs/              # Documentation
├── docker-compose.yml # Multi-container setup
└── README.md          # This file
```

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development
1. Clone the repository
2. Install dependencies: `npm install` in both frontend/ and backend/
3. Set up environment variables
4. Run development servers: `npm run dev`

### Docker Development
1. Build containers: `docker-compose build`
2. Start services: `docker-compose up`

## Features

- **Data Management**: CRUD operations for airlines, features, and implementations
- **Implementation Matrix**: Grid interface for feature-airline relationships  
- **Natural Language Queries**: AI-powered question answering
- **Chat Interface**: Conversational UI with history

## Documentation

See the `docs/` directory for detailed documentation:
- `vision.md` - Project vision and architecture
- `instructions.md` - Implementation milestones and requirements

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push branch and create pull request

## License

[Add license information]