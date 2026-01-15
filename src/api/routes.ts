import { Router } from 'express';
import { WeatherController } from './weatherController';
import { healthCheck } from './healthController';

export function createRouter(weatherController: WeatherController): Router {
  const router = Router();

  router.get('/health', healthCheck);

  router.get('/weather/current', weatherController.getCurrentWeather);
  router.get('/weather/forecast', weatherController.getForecast);

  return router;
}

