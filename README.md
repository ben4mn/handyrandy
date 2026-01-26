# HandyRandy

An intelligent assistant that answers complex queries by navigating a matrix of interconnected information. Originally designed to help teams understand NDC airline features and capabilities, HandyRandy processes natural language questions and returns contextually relevant answers. The architecture supports Slack '@' mention integration for seamless team communication.

## Features

- Matrix-based knowledge navigation
- Natural language query processing
- Designed for Slack @ mention integration
- Docker containerized frontend and backend
- Extensible to any domain-specific knowledge base

## Tech Stack

Node.js, React, Docker, Express

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for containerized deployment)

### Installation

```bash
git clone https://github.com/ben4mn/handyrandy.git
cd handyrandy
npm run install:all
```

### Running

```bash
# Development mode (frontend and backend concurrently)
npm run dev

# Or run separately
npm run dev:frontend
npm run dev:backend

# Docker deployment
npm run docker:build
npm run docker:up
```

## License

MIT
