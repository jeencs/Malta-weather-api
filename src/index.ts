import { createApp } from './app';
import { WeatherController } from './api/weatherController';
import { WeatherService } from './services/weatherService';
import { WeatherScheduler } from './services/scheduler';
import { initializeDatabase, closePool } from './utils/database';
import { dbConnection } from './repositories/DatabaseConnection';
import { config } from './config';

async function startServer(): Promise<void> {
  try {
    await dbConnection.connect();
    await initializeDatabase();

    const weatherService = new WeatherService();
    const weatherController = new WeatherController(weatherService);
    const weatherScheduler = new WeatherScheduler(weatherService);

    const app = createApp(weatherController);

    const server = app.listen(config.server.port, () => {
    });

    weatherScheduler.start();

    const shutdown = async (_signal: string) => {
      weatherScheduler.stop();

      server.close(() => {
      });

      await dbConnection.disconnect();
      await closePool();

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    process.exit(1);
  }
}

startServer();
