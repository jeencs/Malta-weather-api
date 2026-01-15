export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://weather_user:weather_pass@localhost:5432/malta_weather',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  },
  scraper: {
    url: process.env.SCRAPE_URL || 'https://www.malteseislandsweather.com',
    interval: process.env.SCRAPE_INTERVAL || '*/30 * * * *',
    timeout: parseInt(process.env.SCRAPE_TIMEOUT || '15000', 10),
    userAgent: process.env.SCRAPE_USER_AGENT || 'MaltaWeatherAPI/1.0 (Educational Project; Respectful Scraping)',
    retryAttempts: parseInt(process.env.SCRAPE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.SCRAPE_RETRY_DELAY || '1000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
