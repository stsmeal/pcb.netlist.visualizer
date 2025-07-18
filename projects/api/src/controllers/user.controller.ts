import { controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { TYPES } from '../constants/types';
import { BaseController } from './base.controller';
import { UserProvider } from '../providers/user-provider';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */
@controller('/user')
export class UserController extends BaseController {
  constructor(@inject(TYPES.UserProvider) private userProvider: UserProvider) {
    super();
  }

  /**
   * @swagger
   * /user:
   *   get:
   *     summary: Get current user information
   *     description: Retrieves the current authenticated user's information
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
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
  public async getCurrentUser() {
    return this.userProvider.user;
  }
}
