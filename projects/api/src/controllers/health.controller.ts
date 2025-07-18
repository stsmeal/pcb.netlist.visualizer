import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */
@controller('/health')
export class HealthController {
  /**
   * @swagger
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Check API health status
   *     description: Returns the health status of the API. This endpoint is not protected by authentication.
   *     security: []
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  @httpGet('/')
  public async getHealth(_req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      status: 'success',
      message: 'API is healthy',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  /**
   * @swagger
   * /health/ready:
   *   get:
   *     tags: [Health]
   *     summary: Check if API is ready to serve requests
   *     description: Returns readiness status of the API. This endpoint is not protected by authentication.
   *     security: []
   *     responses:
   *       200:
   *         description: API is ready
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  @httpGet('/ready')
  public async getReadiness(_req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      status: 'success',
      message: 'API is ready',
      data: {
        timestamp: new Date().toISOString(),
        ready: true,
      },
    });
  }

  /**
   * @swagger
   * /health/live:
   *   get:
   *     tags: [Health]
   *     summary: Check if API is alive
   *     description: Returns liveness status of the API. This endpoint is not protected by authentication.
   *     security: []
   *     responses:
   *       200:
   *         description: API is alive
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  @httpGet('/live')
  public async getLiveness(_req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      status: 'success',
      message: 'API is alive',
      data: {
        timestamp: new Date().toISOString(),
        alive: true,
      },
    });
  }
}
