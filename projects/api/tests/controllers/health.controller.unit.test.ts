import { HealthController } from '../../src/controllers/health.controller';
import { Request, Response } from 'express';

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new HealthController();

    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return health status with correct structure', async () => {
      // Arrange
      const originalUptime = process.uptime;
      const originalEnv = process.env;

      // Mock process.uptime to return a predictable value
      process.uptime = jest.fn().mockReturnValue(123.456);
      process.env = {
        ...originalEnv,
        npm_package_version: '2.0.0',
        NODE_ENV: 'test',
      };

      // Act
      await controller.getHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'API is healthy',
        data: {
          timestamp: expect.any(String),
          uptime: 123.456,
          version: '2.0.0',
          environment: 'test',
        },
      });

      // Restore original functions
      process.uptime = originalUptime;
      process.env = originalEnv;
    });

    it('should use default version when npm_package_version is not set', async () => {
      // Arrange
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        npm_package_version: undefined,
        NODE_ENV: 'production',
      };

      // Act
      await controller.getHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            version: '1.0.0',
            environment: 'production',
          }),
        })
      );

      // Restore original environment
      process.env = originalEnv;
    });

    it('should use default environment when NODE_ENV is not set', async () => {
      // Arrange
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NODE_ENV: undefined,
      };

      // Act
      await controller.getHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            environment: 'development',
          }),
        })
      );

      // Restore original environment
      process.env = originalEnv;
    });

    it('should return valid ISO timestamp', async () => {
      // Act
      await controller.getHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = callArgs.data.timestamp;

      // Verify it's a valid ISO string
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status with correct structure', async () => {
      // Act
      await controller.getReadiness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'API is ready',
        data: {
          timestamp: expect.any(String),
          ready: true,
        },
      });
    });

    it('should return valid ISO timestamp', async () => {
      // Act
      await controller.getReadiness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = callArgs.data.timestamp;

      // Verify it's a valid ISO string
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should always return ready as true', async () => {
      // Act
      await controller.getReadiness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.ready).toBe(true);
    });
  });

  describe('getLiveness', () => {
    it('should return liveness status with correct structure', async () => {
      // Act
      await controller.getLiveness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'API is alive',
        data: {
          timestamp: expect.any(String),
          alive: true,
        },
      });
    });

    it('should return valid ISO timestamp', async () => {
      // Act
      await controller.getLiveness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = callArgs.data.timestamp;

      // Verify it's a valid ISO string
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should always return alive as true', async () => {
      // Act
      await controller.getLiveness(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.alive).toBe(true);
    });
  });

  describe('timestamp consistency', () => {
    it('should return timestamps that are close to current time', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      await controller.getHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      const endTime = Date.now();
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestampMs = new Date(callArgs.data.timestamp).getTime();

      // Timestamp should be within the test execution window
      expect(timestampMs).toBeGreaterThanOrEqual(startTime);
      expect(timestampMs).toBeLessThanOrEqual(endTime);
    });
  });
});
