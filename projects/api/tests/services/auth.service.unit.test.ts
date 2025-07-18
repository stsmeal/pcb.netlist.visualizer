import { AuthService } from '../../src/services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockContext: any;

  beforeEach(() => {
    // Mock the context dependency
    mockContext = {
      users: {
        findOne: jest.fn(),
        create: jest.fn(),
      },
      userIdentities: {
        findOne: jest.fn(),
        create: jest.fn(),
      },
      loginAudits: {
        create: jest.fn().mockReturnValue({
          then: jest.fn().mockReturnThis(),
          catch: jest.fn(),
        }),
      },
    };

    authService = new AuthService(mockContext);
  });

  describe('create', () => {
    it('should create a new user when username is available', async () => {
      const userData = {
        username: 'testuser',
        firstname: 'Test',
        lastname: 'User',
      };
      const password = 'testpassword';

      // Mock that username doesn't exist
      mockContext.users.findOne.mockResolvedValue(null);
      mockContext.userIdentities.create.mockResolvedValue({});
      mockContext.users.create.mockResolvedValue({
        ...userData,
        username: userData.username.toLowerCase(),
        dateCreated: expect.any(Date),
      });

      const result = await authService.create(userData as any, password);

      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: userData.username.toLowerCase(),
      });
      expect(mockContext.userIdentities.create).toHaveBeenCalled();
      expect(mockContext.users.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when username is taken', async () => {
      const userData = {
        username: 'existinguser',
        firstname: 'Test',
        lastname: 'User',
      };
      const password = 'testpassword';

      // Mock that username exists
      mockContext.users.findOne.mockResolvedValue({ username: 'existinguser' });

      await expect(authService.create(userData as any, password)).rejects.toBe(
        'Username is Taken'
      );
    });

    it('should convert username to lowercase', async () => {
      const userData = {
        username: 'UPPERCASE',
        firstname: 'Test',
        lastname: 'User',
      };
      const password = 'testpassword';

      mockContext.users.findOne.mockResolvedValue(null);
      mockContext.userIdentities.create.mockResolvedValue({});
      mockContext.users.create.mockResolvedValue({});

      await authService.create(userData as any, password);

      expect(mockContext.users.findOne).toHaveBeenCalledWith({
        username: 'uppercase',
      });
    });
  });

  describe('authenticate', () => {
    it('should authenticate valid user', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const userIdentity = { username, hash: 'hashedpassword' };
      const user = { username, firstname: 'Test', lastname: 'User' };

      mockContext.userIdentities.findOne.mockResolvedValue(userIdentity);
      mockContext.users.findOne.mockResolvedValue(user);

      // Mock bcrypt compare to return true
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock jwt sign
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      const result = await authService.authenticate(username, password);

      expect(result.user).toBe(user);
      expect(result.token).toBe('mock-token');
    });

    it('should throw error for invalid credentials', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';

      mockContext.userIdentities.findOne.mockResolvedValue(null);

      await expect(authService.authenticate(username, password)).rejects.toBe(
        'Incorrect Username or Password'
      );
    });
  });
});
