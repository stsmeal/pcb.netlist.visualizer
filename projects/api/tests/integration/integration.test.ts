import { AuthService } from '../../src/services/auth.service';
import { UserService } from '../../src/services/user.service';
import { SubmissionService } from '../../src/services/submission.service';
import { TestContainer, createTestUser } from '../utils/test-container';
import { TYPES } from '../../src/constants/types';

describe('Integration Tests', () => {
  let testContainer: TestContainer;
  let authService: AuthService;
  let userService: UserService;
  let submissionService: SubmissionService;
  let mockContext: any;

  beforeEach(() => {
    testContainer = new TestContainer();
    authService = testContainer.get<AuthService>(TYPES.AuthService);
    userService = testContainer.get<UserService>(TYPES.UserService);
    submissionService = testContainer.get<SubmissionService>(
      TYPES.SubmissionService
    );
    mockContext = testContainer.get<any>(TYPES.Context);
  });

  describe('User Registration and Authentication Flow', () => {
    it('should register user and then authenticate', async () => {
      const userData = createTestUser();
      const password = 'testpassword123';

      // Mock user registration
      mockContext.users.findOne.mockResolvedValue(null);
      mockContext.userIdentities.create.mockResolvedValue({});
      const mockCreatedUser = {
        ...userData,
        username: userData.username.toLowerCase(),
        dateCreated: new Date(),
      };
      mockContext.users.create.mockResolvedValue(mockCreatedUser);

      // Register user
      const registeredUser = await authService.create(
        userData as any,
        password
      );
      expect(registeredUser).toBeDefined();

      // Setup authentication mocks
      const userIdentity = {
        username: userData.username,
        hash: 'hashedpassword',
      };
      mockContext.userIdentities.findOne.mockResolvedValue(userIdentity);
      mockContext.users.findOne.mockResolvedValue(mockCreatedUser);

      // Mock bcrypt and jwt
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'sign').mockReturnValue('test-token');

      // Authenticate user
      const authResult = await authService.authenticate(
        userData.username,
        password
      );
      expect(authResult.user).toBeDefined();
      expect(authResult.token).toBe('test-token');
    });
  });

  describe('User and Submission Flow', () => {
    it('should create user and then create submission for that user', async () => {
      const userData = createTestUser();
      const password = 'testpassword123';

      // Mock user creation
      mockContext.users.findOne.mockResolvedValue(null);
      mockContext.userIdentities.create.mockResolvedValue({});
      const mockCreatedUser = {
        ...userData,
        username: userData.username.toLowerCase(),
        dateCreated: new Date(),
      };
      mockContext.users.create.mockResolvedValue(mockCreatedUser);

      // Create user
      const createdUser = await userService.create(userData as any, password);
      expect(createdUser).toBeDefined();

      // Mock submission creation
      const submissionData = { data: 'test netlist data' };
      const expectedSubmission = {
        ...submissionData,
        dateCreated: expect.any(Date),
        user: createdUser,
      };
      mockContext.submissions.create.mockResolvedValue(expectedSubmission);

      // Create submission
      const submission = await submissionService.create(
        submissionData as any,
        createdUser
      );
      expect(submission).toBeDefined();
      expect(submission.user).toEqual(createdUser);
    });
  });

  describe('Service Dependencies', () => {
    it('should properly inject all dependencies', () => {
      expect(authService).toBeInstanceOf(AuthService);
      expect(userService).toBeInstanceOf(UserService);
      expect(submissionService).toBeInstanceOf(SubmissionService);
    });

    it('should share same context across services', () => {
      const authContext = (authService as any).context;
      const userContext = (userService as any).context;
      const submissionContext = (submissionService as any).context;

      expect(authContext).toBe(userContext);
      expect(userContext).toBe(submissionContext);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const userData = createTestUser();
      const password = 'testpassword123';

      // Mock database error
      mockContext.users.findOne.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        userService.create(userData as any, password)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle authentication errors', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      // Mock no user found
      mockContext.userIdentities.findOne.mockResolvedValue(null);

      await expect(authService.authenticate(username, password)).rejects.toBe(
        'Incorrect Username or Password'
      );
    });
  });
});
