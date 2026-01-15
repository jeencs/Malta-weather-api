import cron from 'node-cron';
import { WeatherService } from './weatherService';
import { config } from '../config';

export class WeatherScheduler {
  private cronJob: cron.ScheduledTask | null = null;
  private weatherService: WeatherService;
  private isRunning = false;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  start(): void {
    if (this.cronJob) {
      return;
    }

    this.cronJob = cron.schedule(config.scraper.interval, async () => {
      if (this.isRunning) {
        return;
      }

      this.isRunning = true;
      try {
        await this.weatherService.scrapeAndStore();
      } catch (error) {
      } finally {
        this.isRunning = false;
      }
    });

    this.runInitialScrape();
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  async runManualScrape(): Promise<void> {
    await this.weatherService.scrapeAndStore();
  }

  private async runInitialScrape(): Promise<void> {
    try {
      await this.weatherService.scrapeAndStore();
    } catch (error) {
    }
  }

  getStatus(): { running: boolean; jobActive: boolean } {
    return {
      running: this.isRunning,
      jobActive: this.cronJob !== null,
    };
  }
}

