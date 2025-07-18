import { SubmissionController } from '../../src/controllers/submission.controller';
import { SubmissionService } from '../../src/services/submission.service';
import { UserProvider } from '../../src/providers/user-provider';
import { User } from '../../src/models/user';
import { Submission } from '../../src/models/submisssion';

describe('SubmissionController', () => {
  let controller: SubmissionController;
  let mockSubmissionService: jest.Mocked<SubmissionService>;
  let mockUserProvider: jest.Mocked<UserProvider>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    firstname: 'Test',
    lastname: 'User',
    dateCreated: new Date(),
    deleted: false,
  } as unknown as User;

  beforeEach(() => {
    // Create mock services
    mockSubmissionService = {
      getForUser: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<SubmissionService>;

    mockUserProvider = {
      user: mockUser,
    } as jest.Mocked<UserProvider>;

    // Create controller with mocked dependencies
    controller = new SubmissionController(
      mockSubmissionService,
      mockUserProvider
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSubmissionsForCurrentUser', () => {
    it('should return submissions for the current user', async () => {
      // Arrange
      const mockSubmissions = [
        {
          _id: '507f1f77bcf86cd799439012',
          data: 'test netlist data 1',
          user: mockUser._id,
          dateCreated: new Date(),
          deleted: false,
        },
        {
          _id: '507f1f77bcf86cd799439013',
          data: 'test netlist data 2',
          user: mockUser._id,
          dateCreated: new Date(),
          deleted: false,
        },
      ] as unknown as Submission[];

      mockSubmissionService.getForUser.mockResolvedValue(mockSubmissions);

      // Act
      const result = await controller.getSubmissionsForCurrentUser();

      // Assert
      expect(mockSubmissionService.getForUser).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
      expect(result).toEqual(mockSubmissions);
    });

    it('should return bad request when user is not found', async () => {
      // Arrange
      mockUserProvider.user = null as any;

      // Act
      const result = await controller.getSubmissionsForCurrentUser();

      // Assert
      expect(result).toHaveProperty(
        'message',
        JSON.stringify({ message: 'User not found' })
      );
      expect(mockSubmissionService.getForUser).not.toHaveBeenCalled();
    });

    it('should return bad request when user has no _id', async () => {
      // Arrange
      mockUserProvider.user = {
        username: 'testuser',
        firstname: 'Test',
        lastname: 'User',
      } as any;

      // Act
      const result = await controller.getSubmissionsForCurrentUser();

      // Assert
      expect(result).toHaveProperty(
        'message',
        JSON.stringify({ message: 'User not found' })
      );
      expect(mockSubmissionService.getForUser).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockSubmissionService.getForUser.mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(controller.getSubmissionsForCurrentUser()).rejects.toThrow(
        'Database error'
      );
      expect(mockSubmissionService.getForUser).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
    });
  });

  describe('create', () => {
    it('should create a new submission successfully', async () => {
      // Arrange
      const requestBody = {
        data: 'test netlist data',
        title: 'Test PCB',
      };

      const mockRequest = {
        body: requestBody,
      } as any;

      const mockCreatedSubmission = {
        _id: '507f1f77bcf86cd799439012',
        ...requestBody,
        user: mockUser._id,
        dateCreated: new Date(),
        deleted: false,
      } as unknown as Submission;

      mockSubmissionService.create.mockResolvedValue(mockCreatedSubmission);

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(mockSubmissionService.create).toHaveBeenCalledWith(
        requestBody,
        mockUser
      );
      expect(result).toEqual(mockCreatedSubmission);
    });

    it('should return bad request when submission data is missing', async () => {
      // Arrange
      const mockRequest = {
        body: null,
      } as any;

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(result).toHaveProperty(
        'message',
        JSON.stringify({ message: 'Missing Submission Request Body' })
      );
      expect(mockSubmissionService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when submission data property is missing', async () => {
      // Arrange
      const mockRequest = {
        body: {
          title: 'Test PCB',
          // Missing 'data' property
        },
      } as any;

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(result).toHaveProperty(
        'message',
        JSON.stringify({ message: 'Missing Submission Data Property' })
      );
      expect(mockSubmissionService.create).not.toHaveBeenCalled();
    });

    it('should return bad request when submission data is empty string', async () => {
      // Arrange
      const mockRequest = {
        body: {
          data: '',
          title: 'Test PCB',
        },
      } as any;

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(result).toHaveProperty(
        'message',
        JSON.stringify({ message: 'Missing Submission Data Property' })
      );
      expect(mockSubmissionService.create).not.toHaveBeenCalled();
    });

    it('should handle valid submission with minimal data', async () => {
      // Arrange
      const requestBody = {
        data: 'minimal netlist data',
      };

      const mockRequest = {
        body: requestBody,
      } as any;

      const mockCreatedSubmission = {
        _id: '507f1f77bcf86cd799439012',
        ...requestBody,
        user: mockUser._id,
        dateCreated: new Date(),
        deleted: false,
      } as unknown as Submission;

      mockSubmissionService.create.mockResolvedValue(mockCreatedSubmission);

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(mockSubmissionService.create).toHaveBeenCalledWith(
        requestBody,
        mockUser
      );
      expect(result).toEqual(mockCreatedSubmission);
    });

    it('should return internal server error when service throws an error', async () => {
      // Arrange
      const requestBody = {
        data: 'test netlist data',
      };

      const mockRequest = {
        body: requestBody,
      } as any;

      const serviceError = new Error('Database connection failed');
      mockSubmissionService.create.mockRejectedValue(serviceError);

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(mockSubmissionService.create).toHaveBeenCalledWith(
        requestBody,
        mockUser
      );
      expect(result).toHaveProperty('error', serviceError);
    });

    it('should handle complex submission data', async () => {
      // Arrange
      const requestBody = {
        data: 'complex netlist data with multiple components',
        title: 'Complex PCB Design',
        description: 'A complex PCB with multiple layers',
        metadata: {
          layers: 4,
          components: 150,
        },
      };

      const mockRequest = {
        body: requestBody,
      } as any;

      const mockCreatedSubmission = {
        _id: '507f1f77bcf86cd799439012',
        ...requestBody,
        user: mockUser._id,
        dateCreated: new Date(),
        deleted: false,
      } as unknown as Submission;

      mockSubmissionService.create.mockResolvedValue(mockCreatedSubmission);

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(mockSubmissionService.create).toHaveBeenCalledWith(
        requestBody,
        mockUser
      );
      expect(result).toEqual(mockCreatedSubmission);
    });
  });
});
