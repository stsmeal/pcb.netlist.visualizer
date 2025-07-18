import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/auth.service';
import { User } from '../../src/models/user';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Create mock auth service
    mockAuthService = {
      authenticate: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Create controller with mocked dependencies
    controller = new AuthController(mockAuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    const validRequest = {
      body: {
        username: 'testuser',
        password: 'password123',
      },
    } as any;

    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        firstname: 'Test',
        lastname: 'User',
        dateCreated: new Date(),
        deleted: false,
      } as unknown as User;
      const expectedResponse = {
        user: mockUser,
        token: 'jwt-token',
      };
      mockAuthService.authenticate.mockResolvedValue(expectedResponse as any);

      // Act
      const result = await controller.authenticate(validRequest);

      // Assert
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        'testuser',
        'password123'
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should return bad request when username is missing', async () => {
      // Arrange
      const requestWithoutUsername = {
        body: {
          password: 'password123',
        },
      } as any;

      // Act
      const result = await controller.authenticate(requestWithoutUsername);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Username"}');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return bad request when username is empty string', async () => {
      // Arrange
      const requestWithEmptyUsername = {
        body: {
          username: '',
          password: 'password123',
        },
      } as any;

      // Act
      const result = await controller.authenticate(requestWithEmptyUsername);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Username"}');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return bad request when password is missing', async () => {
      // Arrange
      const requestWithoutPassword = {
        body: {
          username: 'testuser',
        },
      } as any;

      // Act
      const result = await controller.authenticate(requestWithoutPassword);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Password"}');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return bad request when password is empty string', async () => {
      // Arrange
      const requestWithEmptyPassword = {
        body: {
          username: 'testuser',
          password: '',
        },
      } as any;

      // Act
      const result = await controller.authenticate(requestWithEmptyPassword);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Password"}');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return bad request when authentication fails', async () => {
      // Arrange
      mockAuthService.authenticate.mockRejectedValue(
        new Error('Invalid credentials')
      );

      // Act
      const result = await controller.authenticate(validRequest);

      // Assert
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        'testuser',
        'password123'
      );
      expect((result as any).message).toBe(
        '{"message":"Invalid Username or Password"}'
      );
    });

    it('should handle authentication service throwing string error', async () => {
      // Arrange
      mockAuthService.authenticate.mockRejectedValue('Authentication failed');

      // Act
      const result = await controller.authenticate(validRequest);

      // Assert
      expect((result as any).message).toBe(
        '{"message":"Invalid Username or Password"}'
      );
    });
  });

  describe('register', () => {
    const validRequest = {
      body: {
        username: 'newuser',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
      },
    } as any;

    it('should register user with valid data', async () => {
      // Arrange
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'newuser',
        firstname: 'John',
        lastname: 'Doe',
        dateCreated: new Date(),
        deleted: false,
      } as unknown as User;
      mockAuthService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(validRequest);

      // Assert
      expect(mockAuthService.create).toHaveBeenCalledWith(
        {
          username: 'newuser',
          firstname: 'John',
          lastname: 'Doe',
        } as unknown as User,
        'password123'
      );
      expect(result).toEqual(mockUser);
    });

    it('should return bad request when password is missing', async () => {
      // Arrange
      const requestWithoutPassword = {
        body: {
          username: 'newuser',
          firstname: 'John',
          lastname: 'Doe',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithoutPassword);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Password"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when password is empty string', async () => {
      // Arrange
      const requestWithEmptyPassword = {
        body: {
          username: 'newuser',
          password: '',
          firstname: 'John',
          lastname: 'Doe',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithEmptyPassword);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Password"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when username is missing', async () => {
      // Arrange
      const requestWithoutUsername = {
        body: {
          password: 'password123',
          firstname: 'John',
          lastname: 'Doe',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithoutUsername);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Username"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when firstname is missing', async () => {
      // Arrange
      const requestWithoutFirstname = {
        body: {
          username: 'newuser',
          password: 'password123',
          lastname: 'Doe',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithoutFirstname);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing First Name"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when lastname is missing', async () => {
      // Arrange
      const requestWithoutLastname = {
        body: {
          username: 'newuser',
          password: 'password123',
          firstname: 'John',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithoutLastname);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Last Name"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when user creation fails', async () => {
      // Arrange
      const error = 'Username is taken';
      mockAuthService.create.mockRejectedValue(error);

      // Act
      const result = await controller.register(validRequest);

      // Assert
      expect(mockAuthService.create).toHaveBeenCalledWith(
        {
          username: 'newuser',
          firstname: 'John',
          lastname: 'Doe',
        } as unknown as User,
        'password123'
      );
      expect((result as any).message).toBe('{"message":"Username is taken"}');
    });

    it('should handle additional fields in request body', async () => {
      // Arrange
      const requestWithExtraFields = {
        body: {
          username: 'newuser',
          password: 'password123',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com', // extra field
          age: 25, // extra field
        },
      } as any;

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'newuser',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        age: 25,
        dateCreated: new Date(),
        deleted: false,
      } as unknown as User;
      mockAuthService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(requestWithExtraFields);

      // Assert
      expect(mockAuthService.create).toHaveBeenCalledWith(
        {
          username: 'newuser',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          age: 25,
        } as unknown as User,
        'password123'
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle empty strings for required fields', async () => {
      // Arrange
      const requestWithEmptyFields = {
        body: {
          username: '',
          password: 'password123',
          firstname: '',
          lastname: '',
        },
      } as any;

      // Act
      const result = await controller.register(requestWithEmptyFields);

      // Assert
      expect((result as any).message).toBe('{"message":"Missing Username"}');
      expect(mockAuthService.create).not.toHaveBeenCalled();
    });
  });
});
