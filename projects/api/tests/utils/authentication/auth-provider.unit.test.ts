import {
  AuthProvider,
  Principal,
} from '../../../src/utils/authentication/auth-provider';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../../../src/config';

// Mock the verify function from jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock the config
jest.mock('../../../src/config', () => ({
  config: {
    secret: 'test-secret',
  },
}));

const mockVerify = verify as jest.MockedFunction<typeof verify>;

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authProvider = new AuthProvider();
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return Principal with null user when no authorization header is present', async () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toBeNull();
      expect(mockVerify).not.toHaveBeenCalled();
    });

    it('should return Principal with null user when authorization header is empty', async () => {
      // Arrange
      mockRequest.headers = { authorization: '' };

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toBeNull();
      expect(mockVerify).not.toHaveBeenCalled();
    });

    it('should return Principal with null user when authorization header format is invalid', async () => {
      // Arrange
      mockRequest.headers = { authorization: 'InvalidFormat' };

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toBeNull();
      expect(mockVerify).not.toHaveBeenCalled();
    });

    it('should return Principal with verified user when valid JWT token is provided', async () => {
      // Arrange
      const mockUser = { id: '123', username: 'testuser' };
      const token = 'valid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      (mockVerify as any).mockReturnValue(mockUser);

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toEqual(mockUser);
      expect(mockVerify).toHaveBeenCalledWith(token, config.secret);
    });

    it('should return Principal with null user when JWT verification fails', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toBeNull();
      expect(mockVerify).toHaveBeenCalledWith(token, config.secret);
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle authorization header with extra spaces', async () => {
      // Arrange
      const mockUser = { id: '123', username: 'testuser' };
      const token = 'valid.jwt.token';
      mockRequest.headers = { authorization: `  Bearer   ${token}  ` };
      (mockVerify as any).mockReturnValue(mockUser);

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toEqual(mockUser);
      expect(mockVerify).toHaveBeenCalledWith(token, config.secret);
    });

    it('should handle authorization header as array', async () => {
      // Arrange
      const mockUser = { id: '123', username: 'testuser' };
      const token = 'valid.jwt.token';
      mockRequest.headers = { authorization: [`Bearer ${token}`] as any };
      (mockVerify as any).mockReturnValue(mockUser);

      // Act
      const result = await authProvider.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(result).toBeInstanceOf(Principal);
      expect(result.details).toEqual(mockUser);
      expect(mockVerify).toHaveBeenCalledWith(token, config.secret);
    });
  });
});

describe('Principal', () => {
  describe('constructor', () => {
    it('should create Principal with provided details', () => {
      // Arrange
      const userDetails = { id: '123', username: 'testuser' };

      // Act
      const principal = new Principal(userDetails);

      // Assert
      expect(principal.details).toEqual(userDetails);
    });

    it('should create Principal with null details', () => {
      // Arrange & Act
      const principal = new Principal(null);

      // Assert
      expect(principal.details).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should always return true', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true even with null details', async () => {
      // Arrange
      const principal = new Principal(null);

      // Act
      const result = await principal.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isResourceOwner', () => {
    it('should return true when resourceId is 1111', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isResourceOwner(1111);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when resourceId is not 1111', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isResourceOwner(2222);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when resourceId is string "1111"', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isResourceOwner('1111');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isInRole', () => {
    it('should return true when role is "admin"', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isInRole('admin');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when role is not "admin"', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isInRole('user');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when role is empty string', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isInRole('');

      // Assert
      expect(result).toBe(false);
    });

    it('should be case sensitive for role check', async () => {
      // Arrange
      const principal = new Principal({ id: '123' });

      // Act
      const result = await principal.isInRole('Admin');

      // Assert
      expect(result).toBe(false);
    });
  });
});
