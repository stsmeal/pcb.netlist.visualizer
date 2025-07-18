import 'reflect-metadata';
import { Container } from 'inversify';
import {
  InversifyExpressServer,
  interfaces,
  TYPE,
} from 'inversify-express-utils';
import { jwt } from './utils/authentication/authentication';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './swagger/config';
import { requestTimeoutMiddleware } from './utils/timeout-middleware';

import './controllers/auth.controller';
import './controllers/user.controller';
import './controllers/health.controller';
import './controllers/submission.controller';

import { TYPES } from './constants/types';
import { User } from './models/user';
import { connectDb } from './db';

import { Context } from './context/context';
import { AuthProvider } from './utils/authentication/auth-provider';
import { UserProvider } from './providers/user-provider';

import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { SubmissionService } from './services/submission.service';

// set up container
const bootstrap = async () => {
  let container = new Container();
  //set up bindings
  container.bind<AuthService>(TYPES.AuthService).to(AuthService);
  container.bind<UserService>(TYPES.UserService).to(UserService);
  container
    .bind<SubmissionService>(TYPES.SubmissionService)
    .to(SubmissionService);
  container
    .bind<Context>(TYPES.Context)
    .toDynamicValue(_ctx => {
      const context = new Context();
      context.setModels(connectDb());

      return context;
    })
    .inSingletonScope();

  container
    .bind<UserProvider>(TYPES.UserProvider)
    .toDynamicValue(ctx => {
      const httpContext = ctx.container.get<interfaces.HttpContext>(
        TYPE.HttpContext
      );
      let userProvider = new UserProvider();
      if (httpContext && httpContext.user && httpContext.user.details) {
        userProvider.user = <User>httpContext.user.details;
      } else {
        userProvider.user = null;
      }

      return userProvider;
    })
    .inRequestScope();

  const server = new InversifyExpressServer(
    container,
    null,
    null,
    null,
    AuthProvider
  );

  server.setConfig(app => {
    // Request timeout and logging middleware
    app.use(requestTimeoutMiddleware(30000)); // 30 second timeout

    app.use(
      cors({
        origin: [
          'http://localhost:5174',
          'https://localhost:5174',
          'http://dev.local',
          'https://dev.local',
        ],
        credentials: true,
      })
    );
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '50mb',
      })
    );
    app.use(bodyParser.json({ limit: '50mb' }));

    // Swagger UI setup - must be before JWT middleware
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'PCB Netlist Visualizer API Documentation',
      })
    );

    // Swagger JSON endpoint
    app.get('/swagger.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Custom middleware to conditionally apply JWT
    app.use((req, res, next) => {
      const publicPaths = [
        '/api-docs',
        '/swagger.json',
        '/health',
        '/health/ready',
        '/health/live',
        '/auth/token',
        '/auth/register',
      ];

      // Check if the path is public or starts with /api-docs/
      const isPublicPath = publicPaths.some(
        path => req.path === path || req.path.startsWith('/api-docs/')
      );

      if (isPublicPath) {
        return next();
      }

      // Apply JWT middleware for protected routes
      return jwt()(req, res, next);
    });

    app.use(compression());
    app.use((err, _req, res, next) => {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid or missing token',
          error: err.message,
        });
      }
      next(err);
    });
  });

  const app = server.build();

  // Configure server timeouts
  const httpServer = app.listen(config.port, () => {
    console.log(`API running at http://localhost:${config.port}`);
    console.log(`Environment: ${config.environment}`);
    console.log(
      `Database: mongodb://${config.connectionString}/${config.dbName}`
    );
  });

  // Set server timeout to 45 seconds
  httpServer.timeout = 45000;
  httpServer.keepAliveTimeout = 30000;
  httpServer.headersTimeout = 35000;
};

bootstrap();
