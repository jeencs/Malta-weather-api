import { WeatherScraper } from './scraper';
import { weatherRepository } from '../repositories/WeatherRepository';
import { config } from '../config';

export class WeatherService {
  private scraper: WeatherScraper;

  constructor() {
    this.scraper = new WeatherScraper();
  }

  async scrapeAndStore(): Promise<void> {
    try {
      const scrapedData = await this.scraper.scrape();

      if (scrapedData.current) {
        await weatherRepository.saveCurrentWeather(
          scrapedData.current,
          config.scraper.url
        );
      }

      let forecastSaved = 0;
      for (const forecastDay of scrapedData.forecast) {
        const saved = await weatherRepository.saveForecast(
          forecastDay,
          config.scraper.url
        );
        if (saved > 0) {
          forecastSaved++;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async getCurrentWeather() {
    return weatherRepository.getCurrentWeather();
  }

  async getForecast(days: number) {
    return weatherRepository.getForecast(days);
  }

}

