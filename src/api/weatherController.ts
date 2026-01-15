import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weatherService';
import { ApiError } from '../middleware/errorHandler';

export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  getCurrentWeather = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentWeather = await this.weatherService.getCurrentWeather();

      if (!currentWeather) {
        throw new ApiError(404, 'No current weather data available');
      }

      res.json({
        data: currentWeather,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 6;

      const forecast = await this.weatherService.getForecast(days);

      if (forecast.length === 0) {
        throw new ApiError(404, 'No forecast data available');
      }

      res.json({
        data: forecast,
        metadata: {
          timestamp: new Date().toISOString(),
          days: forecast.length,
          requestedDays: days,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

