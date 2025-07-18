# Testing Setup

This project uses Jest with TypeScript for testing. The testing framework includes:

## Test Structure

- `tests/` - All test files
  - `services/` - Service layer tests
  - `controllers/` - Controller/API endpoint tests
  - `models/` - Database model tests
  - `utils/` - Utility function tests
  - `setup.ts` - Global test setup and database configuration

## Features

- **Jest** - Testing framework
- **TypeScript support** - Full TypeScript integration with ts-jest
- **In-memory MongoDB** - Uses mongodb-memory-server for isolated testing
- **Supertest** - HTTP endpoint testing
- **Code coverage** - Coverage reports in multiple formats
- **Dependency injection testing** - Uses Inversify container for service testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Test Files

- `*.test.ts` or `*.spec.ts` files are automatically picked up by Jest
- Tests can be placed in `tests/` directory or alongside source files

## Configuration

- `jest.config.js` - Jest configuration
- `tests/setup.ts` - Global test setup (runs before all tests)
- Coverage reports are generated in `coverage/` directory

## Writing Tests

### Service Tests

```typescript
import { AuthService } from '../../src/services/auth.service';
import { TestContainer } from '../utils/test-container';
import { TYPES } from '../../src/constants/types';

describe('AuthService', () => {
  let authService: AuthService;
  let testContainer: TestContainer;

  beforeEach(() => {
    testContainer = new TestContainer();
    authService = testContainer.get<AuthService>(TYPES.AuthService);
  });

  it('should authenticate user', async () => {
    // Test implementation
  });
});
```

### Controller Tests

```typescript
import request from 'supertest';
// Controller tests use supertest for HTTP testing
```

### Model Tests

```typescript
import mongoose from 'mongoose';
// Model tests use the in-memory database
```

## Test Database

Tests use an in-memory MongoDB instance that:

- Starts fresh for each test run
- Clears data after each test
- Doesn't affect your development database
- Runs completely isolated

## Coverage

Coverage reports include:

- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

Reports are available in:

- Terminal output
- HTML format in `coverage/` directory
- LCOV format for CI/CD integration
