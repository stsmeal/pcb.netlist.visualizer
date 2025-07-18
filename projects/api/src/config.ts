import * as dotenv from 'dotenv';
import * as path from 'path';

// Get NODE_ENV from command line/process args BEFORE loading any .env files
// This prevents .env files from overriding the NODE_ENV set in npm scripts
const nodeEnv = process.env.NODE_ENV || 'development';

// Only load .env.local for development, otherwise load environment-specific file
if (nodeEnv === 'development') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
}

// Load general .env file as fallback (won't override existing values)
dotenv.config();

// Ensure NODE_ENV is set correctly after loading env files
process.env.NODE_ENV = nodeEnv;

export interface Config {
  connectionString: string;
  dbName: string;
  secret: string;
  port: number;
  environment: 'development' | 'production';
}

export const getConfig = (): Config => {
  const environment =
    (process.env.NODE_ENV as Config['environment']) || 'development';

  // Default configuration for local development
  const defaultConfig = {
    connectionString: 'localhost:27017',
    dbName: 'database',
    secret: 'local-secret',
    port: 3000,
  };

  return {
    environment,
    connectionString:
      process.env.DB_CONNECTION_STRING || defaultConfig.connectionString,
    dbName: process.env.DB_NAME || defaultConfig.dbName,
    secret: process.env.JWT_SECRET || defaultConfig.secret,
    port: parseInt(process.env.PORT || '3000', 10),
  };
};

export const config = getConfig();
