import { SubmissionService } from '../../src/services/submission.service';
import { TestContainer, createTestUser } from '../utils/test-container';
import { TYPES } from '../../src/constants/types';

describe('SubmissionService', () => {
  let submissionService: SubmissionService;
  let testContainer: TestContainer;
  let mockContext: any;

  beforeEach(() => {
    testContainer = new TestContainer();
    submissionService = testContainer.get<SubmissionService>(
      TYPES.SubmissionService
    );

    // Get the mock context to set up expectations
    mockContext = testContainer.get<any>(TYPES.Context);
  });

  describe('getForUser', () => {
    it('should return submissions for a specific user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockSubmissions = [
        { id: '1', data: 'test data 1', user: userId },
        { id: '2', data: 'test data 2', user: userId },
      ];

      mockContext.submissions.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSubmissions),
      });

      const result = await submissionService.getForUser(userId);

      expect(mockContext.submissions.find).toHaveBeenCalledWith({
        user: userId,
      });
      expect(result).toEqual(mockSubmissions);
    });
  });

  describe('create', () => {
    it('should create a new submission with dateCreated', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439011',
        ...createTestUser(),
      };
      const submissionData = {
        data: 'test netlist data',
      };
      const expectedSubmission = {
        ...submissionData,
        dateCreated: expect.any(Date),
        user: userData._id,
      };

      mockContext.submissions.create.mockResolvedValue(expectedSubmission);

      const result = await submissionService.create(
        submissionData as any,
        userData as any
      );

      expect(mockContext.submissions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...submissionData,
          dateCreated: expect.any(Date),
          user: userData._id,
        })
      );
      expect(result).toEqual(expectedSubmission);
    });
  });
});
