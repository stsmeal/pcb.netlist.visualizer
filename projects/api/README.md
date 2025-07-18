# PCB Netlist Visualizer API

A Node.js/TypeScript REST API for managing PCB netlist data, user authentication, and submissions. Built with Express.js, MongoDB, and comprehensive testing.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: Create and manage user accounts with secure password hashing
- **Submission Management**: Handle PCB netlist submissions and user-specific data
- **Health Monitoring**: Built-in health, readiness, and liveness endpoints
- **API Documentation**: Swagger/OpenAPI documentation
- **Comprehensive Testing**: 111 unit and integration tests with full coverage
- **Docker Support**: Containerized deployment ready
- **TypeScript**: Full type safety and modern JavaScript features

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** 18+
- **MongoDB** 6+
- **npm**

## Configuration

Create environment-specific configuration files:

### Development (`.env.local`)

```env
NODE_ENV=development
PORT=3000
CONNECTION_STRING=mongodb://localhost:27017
DB_NAME=database
SECRET=local-secret
```

### Production (`.env.production`)

```env
NODE_ENV=production
PORT=3000
CONNECTION_STRING=mongodb://your-production-mongodb
DB_NAME=database
SECRET=your-production-jwt-secret
```

### Environment Variables

| Variable            | Description                          | Default                     |
| ------------------- | ------------------------------------ | --------------------------- |
| `NODE_ENV`          | Environment (development/production) | `development`               |
| `PORT`              | Server port                          | `3000`                      |
| `CONNECTION_STRING` | MongoDB connection string            | `mongodb://localhost:27017` |
| `DB_NAME`           | Database name                        | `pcb_visualizer`            |
| `SECRET`            | JWT signing secret                   | Required                    |

## Development

### Start Development Server

```bash
npm run start:dev
```

### Watch Mode (Auto-reload)

```bash
npm run start:dev:watch
```

### Build for Production

```bash
npm run build
npm start
```

### Available Scripts

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `npm run build`           | Compile TypeScript to JavaScript  |
| `npm start`               | Start production server           |
| `npm run start:dev`       | Start development server          |
| `npm run start:dev:watch` | Start dev server with auto-reload |
| `npm test`                | Run test suite                    |
| `npm run test:watch`      | Run tests in watch mode           |
| `npm run test:coverage`   | Run tests with coverage report    |
| `npm run lint`            | Check code formatting and types   |
| `npm run format`          | Auto-format code with Prettier    |

## API Endpoints

### Authentication

- `POST /auth/token` - Authenticate user and get JWT token
- `POST /auth/register` - Register new user account

### Health Monitoring

- `GET /health` - Application health status
- `GET /health/readiness` - Readiness probe
- `GET /health/liveness` - Liveness probe

### Submissions

- `GET /submissions` - Get user's submissions (requires authentication)
- `POST /submissions` - Create new submission (requires authentication)

### API Documentation

- `GET /api-docs` - Swagger UI documentation

### Example Usage

#### Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123",
    "firstname": "John",
    "lastname": "Doe"
  }'
```

#### Authenticate

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123"
  }'
```

#### Create Submission

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": "your netlist data here"
  }'
```

## Testing

The project includes comprehensive testing with **111 tests** covering all major functionality.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Coverage

- **Unit Tests**: Controllers, Services, Models, Utilities
- **Integration Tests**: End-to-end API functionality
- **Error Handling**: Comprehensive error scenario testing
- **Authentication**: JWT and authorization testing

## 🐳 Docker

### Build Docker Image

```bash
docker build -t pcb-netlist-visualizer-api .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Docker Configuration

The application includes:

- **Multi-stage Dockerfile** for optimized production builds
- **Docker Compose** setup with MongoDB
- **Health checks** for container monitoring

## 📁 Project Structure

```
src/
├── app.ts                  # Application entry point
├── config.ts              # Configuration management
├── db.ts                  # Database connection
├── constants/             # Application constants
├── controllers/           # API route controllers
│   ├── auth.controller.ts
│   ├── health.controller.ts
│   ├── submission.controller.ts
│   └── user.controller.ts
├── models/               # Database models
│   ├── user.ts
│   └── submission.ts
├── services/             # Business logic services
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── submission.service.ts
├── swagger/              # API documentation
├── utils/                # Utility functions
│   ├── authentication/   # JWT and auth providers
│   ├── helpers.ts
│   └── timeout-middleware.ts
└── providers/            # Data providers

tests/                    # Test suite
├── controllers/          # Controller tests
├── services/            # Service tests
├── models/              # Model tests
├── utils/               # Utility tests
├── integration/         # Integration tests
└── config/              # Configuration tests

deploy/                   # Kubernetes deployment files
```

## 🏗️ Architecture

The application follows a **layered architecture** pattern:

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Business logic and data processing
3. **Models**: Data structures and database schemas
4. **Providers**: Data access and external integrations
5. **Utils**: Shared utilities and middleware

### Key Technologies

- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB/Mongoose**: Database and ODM
- **Inversify**: Dependency injection
- **JWT**: Authentication tokens
- **Swagger**: API documentation
- **Jest**: Testing framework
- **Docker**: Containerization

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Request validation and sanitization
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Request timeout middleware
- **Environment Separation**: Secure config management
