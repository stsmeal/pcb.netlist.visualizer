import { controller, httpPost } from 'inversify-express-utils';
import { Request } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../constants/types';
import { BaseController } from './base.controller';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */
@controller('/auth')
export class AuthController extends BaseController {
  constructor(@inject(TYPES.AuthService) private auth: AuthService) {
    super();
  }

  /**
   * @swagger
   * /auth/token:
   *   post:
   *     tags: [Authentication]
   *     summary: Authenticate user and get JWT token
   *     description: Authenticate with username and password to receive a JWT token
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: User's username
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       200:
   *         description: Authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - missing credentials or invalid login
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpPost('/token')
  public async authenticate(req: Request) {
    const { username, password } = req.body;

    if (!username) {
      return this.badRequest('Missing Username');
    }

    if (!password) {
      return this.badRequest('Missing Password');
    }

    try {
      return await this.auth.authenticate(username, password);
    } catch (error) {
      return this.badRequest('Invalid Username or Password');
    }
  }

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user
   *     description: Create a new user account
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *               - firstname
   *               - lastname
   *             properties:
   *               username:
   *                 type: string
   *                 description: Desired username
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *               firstname:
   *                 type: string
   *                 description: User's first name
   *               lastname:
   *                 type: string
   *                 description: User's last name
   *     responses:
   *       200:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - missing required fields or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpPost('/register')
  public async register(request: Request) {
    const { password, ..._user } = request.body;
    const user = <User>{ ..._user };

    if (!password) {
      return this.badRequest('Missing Password');
    }

    if (!user) {
      return this.badRequest('Missing User Information');
    }

    if (!user.username) {
      return this.badRequest('Missing Username');
    }

    if (!user.firstname) {
      return this.badRequest('Missing First Name');
    }

    if (!user.lastname) {
      return this.badRequest('Missing Last Name');
    }

    try {
      return await this.auth.create(user, password);
    } catch (error) {
      return this.badRequest(error);
    }
  }
}
