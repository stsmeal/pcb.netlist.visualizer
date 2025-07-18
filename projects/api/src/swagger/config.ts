import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PCB Netlist Visualizer API',
      version: '1.0.0',
      description: 'API for PCB Netlist Visualizer application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.dev.local',
        description: 'Local development with ingress',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/controllers/*.ts',
    './src/swagger/schemas/*.ts',
    './dist/src/controllers/*.js',
    './dist/src/swagger/schemas/*.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
