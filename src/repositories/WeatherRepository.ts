import { dbConnection } from './DatabaseConnection';
import {
  CurrentWeather,
  ForecastDay,
  CurrentWeatherEntity,
  ForecastDayEntity,
} from '../domain/WeatherTypes';
import { DatabaseError } from '../domain/ErrorTypes';

export class WeatherRepository {
  async saveCurrentWeather(
    weather: CurrentWeather,
    sourceUrl: string
  ): Promise<number> {
    const scrapedAt = new Date();

    try {
      const duplicateCheck = await dbConnection.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM current_weather 
         WHERE temperature = $1 
         AND humidity = $2 
         AND wind_speed = $3 
         AND condition = $4 
         AND scraped_at > NOW() - INTERVAL '1 hour'`,
        [
          weather.temperature,
          weather.humidity,
          weather.windSpeed,
          weather.condition,
        ]
      );

      if (parseInt(duplicateCheck[0].count) > 0) {
        return 0;
      }

      const result = await dbConnection.query<{ id: number }>(
        `INSERT INTO current_weather (
          temperature, humidity, wind_speed, wind_direction, 
          condition, icon_url, rainfall, feels_like, 
          pressure, visibility, uv_index, scraped_at, source_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          weather.temperature,
          weather.humidity,
          weather.windSpeed,
          weather.windDirection,
          weather.condition,
          weather.iconUrl || null,
          weather.rainfall,
          weather.feelsLike || null,
          weather.pressure || null,
          weather.visibility || null,
          weather.uvIndex || null,
          scrapedAt,
          sourceUrl,
        ]
      );

      return result[0].id;
    } catch (error) {
      throw new DatabaseError('Failed to save current weather data');
    }
  }

  async getCurrentWeather(): Promise<CurrentWeather | null> {
    try {
      const result = await dbConnection.query<CurrentWeatherEntity>(
        `SELECT * FROM current_weather 
         ORDER BY scraped_at DESC 
         LIMIT 1`
      );

      if (result.length === 0) {
        return null;
      }

      const entity = result[0];
      return {
        temperature: parseFloat(entity.temperature.toString()),
        humidity: entity.humidity,
        windSpeed: parseFloat(entity.wind_speed.toString()),
        windDirection: entity.wind_direction,
        condition: entity.condition,
        iconUrl: entity.icon_url || undefined,
        rainfall: parseFloat(entity.rainfall.toString()),
        feelsLike: entity.feels_like ? parseFloat(entity.feels_like.toString()) : undefined,
        pressure: entity.pressure ? parseFloat(entity.pressure.toString()) : undefined,
        visibility: entity.visibility ? parseFloat(entity.visibility.toString()) : undefined,
        uvIndex: entity.uv_index ? parseFloat(entity.uv_index.toString()) : undefined,
      };
    } catch (error) {
      throw new DatabaseError('Failed to retrieve current weather');
    }
  }

  async saveForecast(
    forecast: ForecastDay,
    sourceUrl: string
  ): Promise<number> {
    const scrapedAt = new Date();

    try {
      const duplicateCheck = await dbConnection.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM weather_forecast 
         WHERE forecast_date = $1 
         AND temp_high = $2 
         AND temp_low = $3 
         AND condition = $4 
         AND scraped_at > NOW() - INTERVAL '1 hour'`,
        [
          forecast.date,
          forecast.tempHigh,
          forecast.tempLow,
          forecast.condition,
        ]
      );

      if (parseInt(duplicateCheck[0].count) > 0) {
        return 0;
      }

      const result = await dbConnection.query<{ id: number }>(
        `INSERT INTO weather_forecast (
          forecast_date, temp_high, temp_low, condition, 
          icon_url, precipitation_chance, wind_speed, 
          humidity, scraped_at, source_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          forecast.date,
          forecast.tempHigh,
          forecast.tempLow,
          forecast.condition,
          forecast.iconUrl || null,
          forecast.precipitationChance,
          forecast.windSpeed || null,
          forecast.humidity || null,
          scrapedAt,
          sourceUrl,
        ]
      );

      return result[0].id;
    } catch (error) {
      throw new DatabaseError('Failed to save forecast data');
    }
  }

  async getForecast(days: number = 6): Promise<ForecastDay[]> {
    try {
      const latestScrape = await dbConnection.query<{ scraped_at: Date }>(
        `SELECT scraped_at FROM weather_forecast 
         ORDER BY scraped_at DESC 
         LIMIT 1`
      );

      if (latestScrape.length === 0) {
        return [];
      }

      const scrapedAt = latestScrape[0].scraped_at;

      const result = await dbConnection.query<ForecastDayEntity>(
        `SELECT * FROM weather_forecast 
         WHERE scraped_at >= ($1::timestamp - INTERVAL '10 seconds')
         AND scraped_at <= ($1::timestamp + INTERVAL '10 seconds')
         AND forecast_date >= CURRENT_DATE
         ORDER BY forecast_date ASC 
         LIMIT $2`,
        [scrapedAt, days]
      );

      return result.map((entity) => ({
        date: entity.forecast_date,
        tempHigh: parseFloat(entity.temp_high.toString()),
        tempLow: parseFloat(entity.temp_low.toString()),
        condition: entity.condition,
        iconUrl: entity.icon_url || undefined,
        precipitationChance: entity.precipitation_chance,
        windSpeed: entity.wind_speed ? parseFloat(entity.wind_speed.toString()) : undefined,
        humidity: entity.humidity || undefined,
      }));
    } catch (error) {
      throw new DatabaseError('Failed to retrieve forecast data');
    }
  }

  async getLatestScrapedAt(): Promise<Date | null> {
    try {
      const result = await dbConnection.query<{ scraped_at: Date }>(
        `SELECT scraped_at FROM current_weather 
         ORDER BY scraped_at DESC 
         LIMIT 1`
      );

      return result.length > 0 ? result[0].scraped_at : null;
    } catch (error) {
      return null;
    }
  }
}

export const weatherRepository = new WeatherRepository();

