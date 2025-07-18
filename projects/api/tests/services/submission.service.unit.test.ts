import { SubmissionService } from '../../src/services/submission.service';
import { TestContainer, createTestSubmission } from '../utils/test-container';
import { TYPES } from '../../src/constants/types';
import { User } from '../../src/models/user';
import { Submission } from '../../src/models/submisssion';

describe('SubmissionService', () => {
  let submissionService: SubmissionService;
  let testContainer: TestContainer;
  let mockContext: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    firstname: 'Test',
    lastname: 'User',
    dateCreated: new Date(),
    deleted: false,
  } as unknown as User;

  beforeEach(() => {
    testContainer = new TestContainer();
    submissionService = testContainer.get<SubmissionService>(
      TYPES.SubmissionService
    );
    mockContext = testContainer.get<any>(TYPES.Context);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getForUser', () => {
    it('should retrieve submissions for a specific user', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockSubmissions = [
        createTestSubmission(userId),
        createTestSubmission(userId),
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockSubmissions),
      };
      mockContext.submissions.find.mockReturnValue(mockQuery);

      // Act
      const result = await submissionService.getForUser(userId);

      // Assert
      expect(mockContext.submissions.find).toHaveBeenCalledWith({
        user: userId,
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ dateCreated: -1 });
      expect(result).toEqual(mockSubmissions);
    });

    it('should handle empty result when user has no submissions', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      mockContext.submissions.find.mockReturnValue(mockQuery);

      // Act
      const result = await submissionService.getForUser(userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockContext.submissions.find).toHaveBeenCalledWith({
        user: userId,
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockContext.submissions.find.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(submissionService.getForUser(userId)).rejects.toThrow(
        'Database error'
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        sort: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new Error('Submissions lookup timeout after 5000ms')
                    ),
                  100
                )
              )
          ),
      };
      mockContext.submissions.find.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(submissionService.getForUser(userId)).rejects.toThrow(
        'Submissions lookup timeout after 5000ms'
      );
    });
  });

  describe('create', () => {
    it('should create a new submission successfully', async () => {
      // Arrange
      const submissionData = {
        data: 'test netlist data',
      } as Submission;

      const expectedSubmission = {
        ...submissionData,
        dateCreated: expect.any(Date),
        user: mockUser._id,
      };

      const mockCreatedSubmission = {
        ...expectedSubmission,
        _id: '507f1f77bcf86cd799439012',
      };

      mockContext.submissions.create.mockResolvedValue(mockCreatedSubmission);

      // Act
      const result = await submissionService.create(submissionData, mockUser);

      // Assert
      expect(mockContext.submissions.create).toHaveBeenCalledWith(
        expectedSubmission
      );
      expect(result).toEqual(mockCreatedSubmission);
    });

    it('should preserve existing submission data when creating', async () => {
      // Arrange
      const submissionData = {
        data: 'complex netlist data with multiple components',
      } as Submission;

      const expectedSubmission = {
        ...submissionData,
        dateCreated: expect.any(Date),
        user: mockUser._id,
      };

      mockContext.submissions.create.mockResolvedValue(expectedSubmission);

      // Act
      const result = await submissionService.create(submissionData, mockUser);

      // Assert
      expect(mockContext.submissions.create).toHaveBeenCalledWith(
        expectedSubmission
      );
      expect(result.data).toBe(submissionData.data);
    });

    it('should handle creation errors gracefully', async () => {
      // Arrange
      const submissionData = {
        data: 'test data',
      } as Submission;

      mockContext.submissions.create.mockRejectedValue(
        new Error('Creation failed')
      );

      // Act & Assert
      await expect(
        submissionService.create(submissionData, mockUser)
      ).rejects.toThrow('Creation failed');
    });

    it('should handle timeout during creation', async () => {
      // Arrange
      const submissionData = {
        data: 'test data',
      } as Submission;

      mockContext.submissions.create.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(new Error('Submission creation timeout after 10000ms')),
              100
            )
          )
      );

      // Act & Assert
      await expect(
        submissionService.create(submissionData, mockUser)
      ).rejects.toThrow('Submission creation timeout after 10000ms');
    });

    it('should set the correct user ID and creation date', async () => {
      // Arrange
      const submissionData = {
        data: 'test data',
      } as Submission;

      const dateBeforeCreation = new Date();

      mockContext.submissions.create.mockImplementation(data => {
        return Promise.resolve({ ...data, _id: 'created-id' });
      });

      // Act
      await submissionService.create(submissionData, mockUser);
      const dateAfterCreation = new Date();

      // Assert
      const createCall = mockContext.submissions.create.mock.calls[0][0];
      expect(createCall.user).toBe(mockUser._id);
      expect(createCall.dateCreated).toBeInstanceOf(Date);
      expect(createCall.dateCreated.getTime()).toBeGreaterThanOrEqual(
        dateBeforeCreation.getTime()
      );
      expect(createCall.dateCreated.getTime()).toBeLessThanOrEqual(
        dateAfterCreation.getTime()
      );
    });
  });
});
