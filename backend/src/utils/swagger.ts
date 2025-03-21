import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Web3 Marketplace API',
    version: '1.0.0',
    description: 'API for a Web3 Marketplace with blockchain integration',
    license: {
      name: 'MIT',
    },
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Item: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          itemId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
          seller: { type: 'string' },
          buyer: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['listed', 'sold'] },
          imageUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      VerifiedItem: {
        allOf: [
          { $ref: '#/components/schemas/Item' },
          {
            type: 'object',
            properties: {
              blockchainState: {
                type: 'object',
                properties: {
                  currentOwner: { type: 'string' },
                  currentPrice: { type: 'string' },
                  isForSale: { type: 'boolean' },
                  isSynced: { type: 'boolean' },
                },
              },
            },
          },
        ],
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          hash: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'success', 'failed'] },
          blockNumber: { type: 'integer', nullable: true },
          gasUsed: { type: 'string', nullable: true },
          timestamp: { type: 'string', format: 'date-time', nullable: true },
          eventType: { type: 'string', nullable: true },
          itemId: { type: 'string', nullable: true },
          seller: { type: 'string', nullable: true },
          buyer: { type: 'string', nullable: true },
          price: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BlockchainItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          seller: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
          isForSale: { type: 'boolean' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

/**
 * Configure Swagger middleware for Express app
 */
export const setupSwagger = (app: Express): void => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 