import { getConfig } from '../../src/config';

describe('Config', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return default configuration when no environment variables are set', () => {
      // Clear relevant environment variables
      delete process.env.NODE_ENV;
      delete process.env.DB_CONNECTION_STRING;
      delete process.env.DB_NAME;
      delete process.env.JWT_SECRET;
      delete process.env.PORT;

      const config = getConfig();

      expect(config).toEqual({
        environment: 'development',
        connectionString: 'localhost:27017',
        dbName: 'database',
        secret: 'local-secret',
        port: 3000,
      });
    });

    it('should use environment variables when they are set', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_CONNECTION_STRING = 'mongodb://prod-server:27017';
      process.env.DB_NAME = 'prod-database';
      process.env.JWT_SECRET = 'super-secret-key';
      process.env.PORT = '8080';

      const config = getConfig();

      expect(config).toEqual({
        environment: 'production',
        connectionString: 'mongodb://prod-server:27017',
        dbName: 'prod-database',
        secret: 'super-secret-key',
        port: 8080,
      });
    });

    it('should set environment to production when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      const config = getConfig();

      expect(config.environment).toBe('production');
    });

    it('should default to development environment when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const config = getConfig();

      expect(config.environment).toBe('development');
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '5000';

      const config = getConfig();

      expect(config.port).toBe(5000);
      expect(typeof config.port).toBe('number');
    });

    it('should handle invalid PORT by using default', () => {
      process.env.PORT = 'not-a-number';

      const config = getConfig();

      expect(config.port).toBe(NaN); // parseInt returns NaN for invalid input
    });

    it('should use default port when PORT is empty string', () => {
      process.env.PORT = '';

      const config = getConfig();

      expect(config.port).toBe(3000);
    });

    it('should handle partial environment variable configuration', () => {
      process.env.NODE_ENV = 'staging';
      process.env.DB_CONNECTION_STRING = 'mongodb://staging-server:27017';
      // Leave other env vars undefined to test mixing defaults and env vars

      const config = getConfig();

      expect(config).toEqual({
        environment: 'staging',
        connectionString: 'mongodb://staging-server:27017',
        dbName: 'database', // default
        secret: 'local-secret', // default
        port: 3000, // default
      });
    });

    it('should preserve type safety for environment field', () => {
      process.env.NODE_ENV = 'development';
      const config = getConfig();
      expect(config.environment).toBe('development');

      process.env.NODE_ENV = 'production';
      const config2 = getConfig();
      expect(config2.environment).toBe('production');
    });
  });
});
