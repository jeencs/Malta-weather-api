export const config = {
  server: {
    port: 3000,
    apiVersion: 'v1',
    corsOrigin: '*',
  },
  database: {
    url: 'postgresql://weather_user:weather_pass@localhost:5432/malta_weather',
    poolSize: 10,
  },
  scraper: {
    url: 'https://www.malteseislandsweather.com',
    interval: '*/30 * * * *',
    timeout: 15000,
    userAgent: 'MaltaWeatherAPI/1.0 (Educational Project; Respectful Scraping)',
    retryAttempts: 3,
    retryDelay: 1000,
  },
};
