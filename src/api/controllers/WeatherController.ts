import { Request, Response } from 'express';
import { weatherRepository } from '../../repositories/WeatherRepository';
import { NotFoundError } from '../../domain/ErrorTypes';
import { CurrentWeatherResponse, ForecastListResponse } from '../../domain/WeatherTypes';

export class WeatherController {
  async getCurrentWeather(_req: Request, res: Response): Promise<void> {
    const weather = await weatherRepository.getCurrentWeather();

    if (!weather) {
      throw new NotFoundError('No current weather data available. Please try again later.');
    }

    const scrapedAt = await weatherRepository.getLatestScrapedAt();

    const response: CurrentWeatherResponse = {
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      condition: weather.condition,
      iconUrl: weather.iconUrl,
      rainfall: weather.rainfall,
      feelsLike: weather.feelsLike,
      pressure: weather.pressure,
      visibility: weather.visibility,
      uvIndex: weather.uvIndex,
      scrapedAt: scrapedAt?.toISOString() || new Date().toISOString(),
      sourceUrl: 'https://www.malteseislandsweather.com',
    };

    res.json(response);
  }

  async getForecast(req: Request, res: Response): Promise<void> {
    const days = parseInt(req.query.days as string) || 6;

    const forecast = await weatherRepository.getForecast(days);

    if (forecast.length === 0) {
      throw new NotFoundError('No forecast data available. Please try again later.');
    }

    const scrapedAt = await weatherRepository.getLatestScrapedAt();

    const response: ForecastListResponse = {
      forecast: forecast.map((day) => ({
        date: day.date.toISOString().split('T')[0],
        tempHigh: day.tempHigh,
        tempLow: day.tempLow,
        condition: day.condition,
        iconUrl: day.iconUrl,
        precipitationChance: day.precipitationChance,
        windSpeed: day.windSpeed,
        humidity: day.humidity,
      })),
      scrapedAt: scrapedAt?.toISOString() || new Date().toISOString(),
      sourceUrl: 'https://www.malteseislandsweather.com',
      days: forecast.length,
    };

    res.json(response);
  }
}

export const weatherController = new WeatherController();

