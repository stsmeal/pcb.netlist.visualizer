import { UserService } from '../../src/services/user.service';
import { Context } from '../../src/context/context';
import { User } from '../../src/models/user';
import { UserIdentity } from '../../src/models/user-identity';
import * as bcrypt from 'bcryptjs';
import { withTimeout } from '../../src/utils/timeout-middleware';

// Mock the timeout middleware
jest.mock('../../src/utils/timeout-middleware');
const mockWithTimeout = withTimeout as jest.MockedFunction<typeof withTimeout>;

// Mock bcryptjs
jest.mock('bcryptjs');
const mockHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

describe('UserService', () => {
  let userService: UserService;
  let mockContext: jest.Mocked<Context>;

  beforeEach(() => {
    // Create mock context with proper jest mocks
    mockContext = {
      users: {
        findOne: jest.fn(),
        create: jest.fn(),
      },
      userIdentities: {
        create: jest.fn(),
      },
    } as any;

    // Create user service with mock context
    userService = new UserService(mockContext);

    // Setup default mock implementations
    mockWithTimeout.mockImplementation((promise: any) => promise);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUser: Partial<User> = {
      username: 'TestUser',
      firstname: 'Test',
      lastname: 'User',
    };

    const password = 'password123';

    it('should create a new user successfully', async () => {
      // Arrange
      const hashedPassword = 'hashed-password';
      const createdUser = {
        ...mockUser,
        username: 'testuser', // should be lowercased
        dateCreated: new Date(),
      } as User;

      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null); // No existing user
      (mockHash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
        hashedPassword as never
      );
      (mockContext.userIdentities.create as jest.Mock).mockResolvedValue(
        {} as UserIdentity
      );
      (mockContext.users.create as jest.Mock).mockResolvedValue(createdUser);

      // Act
      const result = await userService.create(mockUser as User, password);

      // Assert
      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(mockHash).toHaveBeenCalledWith(password, 10);
      expect(mockContext.userIdentities.create).toHaveBeenCalledWith({
        username: 'testuser',
        hash: hashedPassword,
      });
      expect(mockContext.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          firstname: 'Test',
          lastname: 'User',
          dateCreated: expect.any(Date),
        })
      );
      expect(result).toEqual(createdUser);
    });

    it('should convert username to lowercase', async () => {
      // Arrange
      const userWithUpperCase = {
        ...mockUser,
        username: 'TESTUSER',
      } as User;

      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);
      (mockHash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
        'hashed-password' as never
      );
      (mockContext.userIdentities.create as jest.Mock).mockResolvedValue(
        {} as UserIdentity
      );
      (mockContext.users.create as jest.Mock).mockResolvedValue({} as User);

      // Act
      await userService.create(userWithUpperCase, password);

      // Assert
      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(mockContext.userIdentities.create).toHaveBeenCalledWith({
        username: 'testuser',
        hash: 'hashed-password',
      });
      expect(userWithUpperCase.username).toBe('testuser');
    });

    it('should throw error when username is already taken', async () => {
      // Arrange
      const existingUser = { username: 'testuser' } as User;
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.create(mockUser as User, password)).rejects.toBe(
        'Username is Taken'
      );

      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(mockContext.userIdentities.create).not.toHaveBeenCalled();
      expect(mockContext.users.create).not.toHaveBeenCalled();
    });

    it('should set dateCreated before creating user', async () => {
      // Arrange
      const userWithoutDate = { ...mockUser } as User;

      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);
      (mockHash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
        'hashed-password' as never
      );
      (mockContext.userIdentities.create as jest.Mock).mockResolvedValue(
        {} as UserIdentity
      );
      (mockContext.users.create as jest.Mock).mockResolvedValue({} as User);

      // Act
      await userService.create(userWithoutDate, password);

      // Assert
      expect(userWithoutDate.dateCreated).toBeInstanceOf(Date);
      expect(mockContext.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dateCreated: expect.any(Date),
        })
      );
    });

    it('should use withTimeout for database operations', async () => {
      // Arrange
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);
      (mockHash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
        'hashed-password' as never
      );
      (mockContext.userIdentities.create as jest.Mock).mockResolvedValue(
        {} as UserIdentity
      );
      (mockContext.users.create as jest.Mock).mockResolvedValue({} as User);

      // Act
      await userService.create(mockUser as User, password);

      // Assert
      expect(mockWithTimeout).toHaveBeenCalledTimes(3);
      expect(mockWithTimeout).toHaveBeenCalledWith(
        expect.anything(),
        5000,
        'User lookup'
      );
      expect(mockWithTimeout).toHaveBeenCalledWith(
        expect.anything(),
        10000,
        'User identity creation'
      );
      expect(mockWithTimeout).toHaveBeenCalledWith(
        expect.anything(),
        10000,
        'User creation'
      );
    });

    it('should handle bcrypt hashing errors', async () => {
      // Arrange
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);
      (mockHash as jest.MockedFunction<typeof bcrypt.hash>).mockRejectedValue(
        new Error('Hashing failed') as never
      );

      // Act & Assert
      await expect(
        userService.create(mockUser as User, password)
      ).rejects.toThrow('Hashing failed');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username (case insensitive)', async () => {
      // Arrange
      const expectedUser = {
        username: 'testuser',
        firstname: 'Test',
        lastname: 'User',
      } as User;
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(expectedUser);

      // Act
      const result = await userService.findByUsername('TestUser');

      // Assert
      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userService.findByUsername('nonexistent');

      // Assert
      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'nonexistent',
      });
      expect(result).toBeNull();
    });

    it('should convert username to lowercase before searching', async () => {
      // Arrange
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await userService.findByUsername('UPPERCASE');

      // Assert
      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'uppercase',
      });
    });

    it('should use withTimeout for database operation', async () => {
      // Arrange
      (mockContext.users.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await userService.findByUsername('testuser');

      // Assert
      expect(mockWithTimeout).toHaveBeenCalledWith(
        expect.anything(),
        5000,
        'User lookup by username'
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      (mockContext.users.findOne as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(userService.findByUsername('testuser')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('error scenarios', () => {
    it('should handle timeout errors in create method', async () => {
      // Arrange
      const testUser = { username: 'testuser' } as User;
      mockWithTimeout.mockRejectedValue(new Error('Operation timed out'));

      // Act & Assert
      await expect(userService.create(testUser, 'password')).rejects.toThrow(
        'Operation timed out'
      );
    });

    it('should handle timeout errors in findByUsername method', async () => {
      // Arrange
      mockWithTimeout.mockRejectedValue(new Error('Operation timed out'));

      // Act & Assert
      await expect(userService.findByUsername('testuser')).rejects.toThrow(
        'Operation timed out'
      );
    });
  });
});
