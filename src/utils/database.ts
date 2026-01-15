import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', () => {
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const dbPool = getPool();
    const result = await dbPool.query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  const dbPool = getPool();
  
  const currentWeatherTable = `
    CREATE TABLE IF NOT EXISTS current_weather (
      id SERIAL PRIMARY KEY,
      temperature DECIMAL(5,2) NOT NULL,
      humidity INTEGER NOT NULL,
      wind_speed DECIMAL(5,2) NOT NULL,
      wind_direction VARCHAR(50) NOT NULL,
      condition VARCHAR(255) NOT NULL,
      icon_url VARCHAR(500),
      rainfall DECIMAL(5,2) NOT NULL DEFAULT 0,
      feels_like DECIMAL(5,2),
      pressure DECIMAL(7,2),
      visibility DECIMAL(5,2),
      uv_index DECIMAL(3,1),
      scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
      source_url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  const weatherForecastTable = `
    CREATE TABLE IF NOT EXISTS weather_forecast (
      id SERIAL PRIMARY KEY,
      forecast_date DATE NOT NULL,
      temp_high DECIMAL(5,2) NOT NULL,
      temp_low DECIMAL(5,2) NOT NULL,
      condition VARCHAR(255) NOT NULL,
      icon_url VARCHAR(500),
      precipitation_chance INTEGER NOT NULL DEFAULT 0,
      wind_speed DECIMAL(5,2),
      humidity INTEGER,
      scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
      source_url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  const indexCurrentWeather = `
    CREATE INDEX IF NOT EXISTS idx_current_weather_scraped_at 
    ON current_weather(scraped_at DESC)
  `;

  const indexForecast = `
    CREATE INDEX IF NOT EXISTS idx_weather_forecast_date 
    ON weather_forecast(forecast_date, scraped_at DESC)
  `;

  try {
    await dbPool.query(currentWeatherTable);
    await dbPool.query(weatherForecastTable);
    await dbPool.query(indexCurrentWeather);
    await dbPool.query(indexForecast);
  } catch (error) {
    throw error;
  }
}

