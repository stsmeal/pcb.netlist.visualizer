import { controller, httpPost, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../constants/types';
import { BaseController } from './base.controller';
import { SubmissionService } from '../services/submission.service';
import { UserProvider } from '../providers/user-provider';

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Submission management endpoints
 */
@controller('/submissions')
export class SubmissionController extends BaseController {
  constructor(
    @inject(TYPES.SubmissionService) private submissions: SubmissionService,
    @inject(TYPES.UserProvider) private userProvider: UserProvider
  ) {
    super();
  }

  /**
   * @swagger
   * /submissions:
   *   get:
   *     summary: Get submissions for current user
   *     description: Retrieves all submissions belonging to the current authenticated user
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user's submissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SubmissionListResponse'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpGet('/')
  public async getSubmissionsForCurrentUser() {
    const user = this.userProvider.user;
    if (!user || !user._id) {
      return this.badRequest('User not found');
    }
    return await this.submissions.getForUser(user._id.toString());
  }

  /**
   * @swagger
   * /submissions:
   *   post:
   *     summary: Create a new submission
   *     description: Creates a new submission for the current authenticated user
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SubmissionRequest'
   *     responses:
   *       200:
   *         description: Submission created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SubmissionResponse'
   *       400:
   *         description: Bad request - Missing or invalid submission data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpPost('/')
  public async create(request: Request) {
    const submissionData = request.body;
    const user = this.userProvider.user;

    if (!submissionData) {
      return this.badRequest('Missing Submission Request Body');
    }

    if (!submissionData.data) {
      return this.badRequest('Missing Submission Data Property');
    }

    try {
      return await this.submissions.create(submissionData, user);
    } catch (error) {
      return this.internalServerError(error);
    }
  }
}
