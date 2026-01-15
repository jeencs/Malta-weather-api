import cron from 'node-cron';
import { weatherScraper } from './WeatherScraper';
import { weatherRepository } from '../repositories/WeatherRepository';
import { config } from '../config';

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;
  private isRunning = false;

  start(): void {
    const intervalMinutes = config.scraper.interval;
    
    const cronExpression = `*/${intervalMinutes} * * * *`;

    this.runScrapeJob().catch(() => {
    });

    this.task = cron.schedule(cronExpression, async () => {
      await this.runScrapeJob();
    });
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
  }

  async runScrapeJob(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const result = await weatherScraper.scrape();

      await weatherRepository.saveCurrentWeather(
        result.current,
        result.sourceUrl
      );

      for (const day of result.forecast) {
        await weatherRepository.saveForecast(day, result.sourceUrl);
      }
    } catch (error) {
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): { running: boolean; interval: number } {
    return {
      running: this.task !== null,
      interval: parseInt(config.scraper.interval) || 30,
    };
  }
}

export const schedulerService = new SchedulerService();

