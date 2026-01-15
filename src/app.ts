import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { createRouter } from './api/routes';
import { WeatherController } from './api/weatherController';
import { config } from './config';

export function createApp(weatherController: WeatherController): Application {
  const app = express();

  app.use(cors({ origin: config.server.corsOrigin }));

  const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
  let openApiSpec;
  try {
    openApiSpec = YAML.load(openApiPath);
  } catch (error) {
  }

  if (openApiSpec) {
    app.use(`/${config.server.apiVersion}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Malta Weather API Documentation',
    }));
  }

  const apiRouter = createRouter(weatherController);
  app.use(`/${config.server.apiVersion}`, apiRouter);

  return app;
}
