import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { CurrentWeather, ForecastDay } from '../domain/models';
import { config } from '../config';

export interface ScrapedData {
  current: CurrentWeather | null;
  forecast: ForecastDay[];
}

export class WeatherScraper {
  private userAgent: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.userAgent = config.scraper.userAgent;
    this.timeout = config.scraper.timeout;
    this.retryAttempts = config.scraper.retryAttempts;
    this.retryDelay = config.scraper.retryDelay;
  }

  private async fetchHtml(url: string, attempt = 1): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.timeout,
        validateStatus: (status) => status === 200,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.message || 'Unknown error';

      if (attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchHtml(url, attempt + 1);
      }

      throw new Error(`Failed to fetch HTML after ${this.retryAttempts} attempts: ${errorMessage}`);
    }
  }

  private parseCurrentWeather($: cheerio.CheerioAPI): CurrentWeather | null {
    try {
      const tempElement = $('.current-conditions-temp .lws-widget-med-value').first();
      const temperature = tempElement.length > 0 ? parseFloat(tempElement.text().trim()) : null;
      
      const humidityElement = $('[title="Humidity"] .lws-widget-med-value').first();
      const humidity = humidityElement.length > 0 ? parseInt(humidityElement.text().trim()) : null;
      
      const windElement = $('[title*="Wind"] .lws-widget-med-value').first();
      const windSpeed = windElement.length > 0 ? parseFloat(windElement.text().trim()) : null;
      
      const windTitle = $('[title*="Wind from"]').attr('title');
      const windDirection = windTitle ? windTitle.replace('Wind from ', '').trim() : 'Unknown';
      
      const rainElement = $('[title="Rainfall"] .lws-widget-med-value').first();
      const rainfall = rainElement.length > 0 ? parseFloat(rainElement.text().trim()) : 0;
      
      const conditionText = $('.detailed-forecast-details p').first().text();
      const conditionMatch = conditionText.match(/Weather:\s*([^.]+)/i);
      const condition = conditionMatch ? conditionMatch[1].trim() : 'Unknown';
      
      const iconUrl = $('.lws-widget-outer-outdoor-694ee418a684e').css('background-image')?.match(/url\("(.+?)"\)/)?.[1];

      if (temperature === null || humidity === null || windSpeed === null) {
        return null;
      }

      const currentWeather: CurrentWeather = {
        temperature,
        humidity,
        windSpeed,
        windDirection,
        condition,
        rainfall,
        iconUrl: iconUrl || undefined,
      };

      return currentWeather;
    } catch (error) {
      return null;
    }
  }

  private parseForecast($: cheerio.CheerioAPI): ForecastDay[] {
    const forecast: ForecastDay[] = [];

    try {
      const forecastElements = $('.day-forecast').slice(0, 6);

      forecastElements.each((index, element) => {
        const $element = $(element);
        
        const day = $element.find('.date .day').text().trim();
        const month = $element.find('.date .month').text().trim();
        const year = new Date().getFullYear();
        
        const dateStr = `${day} ${month} ${year}`;
        const forecastDate = new Date(dateStr);
        
        if (isNaN(forecastDate.getTime())) {
          forecastDate.setTime(Date.now());
          forecastDate.setDate(forecastDate.getDate() + index + 1);
        }
        forecastDate.setHours(0, 0, 0, 0);
        
        const tempHighText = $element.find('.max-temp .degrees .mgt-counter-value').attr('data-to');
        const tempLowText = $element.find('.min-temp .degrees .mgt-counter-value').attr('data-to');
        const tempHigh = tempHighText ? parseFloat(tempHighText) : null;
        const tempLow = tempLowText ? parseFloat(tempLowText) : null;
        
        const condition = $element.find('.condition-name span').text().trim() || 'Unknown';
        
        const precipText = $element.find('.rain .col2:first-child .mgt-counter-value').attr('data-to');
        const precipitationChance = precipText ? parseInt(precipText) : 0;
        
        const iconUrl = $element.find('.general-condition-image').attr('src');

        if (tempHigh !== null && tempLow !== null) {
          forecast.push({
            date: forecastDate,
            tempHigh,
            tempLow,
            condition,
            precipitationChance,
            iconUrl: iconUrl || undefined,
          });
        }
      });
    } catch (error) {
    }

    return forecast;
  }

  async scrape(url?: string): Promise<ScrapedData> {
    const targetUrl = url || config.scraper.url;

    const html = await this.fetchHtml(targetUrl);
    const $ = cheerio.load(html);

    const current = this.parseCurrentWeather($);
    const forecast = this.parseForecast($);

    return {
      current,
      forecast,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

