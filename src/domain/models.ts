export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  iconUrl?: string;
  rainfall: number;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
}

export interface ForecastDay {
  date: Date;
  tempHigh: number;
  tempLow: number;
  condition: string;
  iconUrl?: string;
  precipitationChance: number;
  windSpeed?: number;
  humidity?: number;
}

export interface WeatherObservation {
  id?: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  iconUrl?: string;
  rainfall: number;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
  scrapedAt: Date;
  sourceUrl: string;
}

export interface WeatherForecast {
  id?: number;
  forecastDate: Date;
  tempHigh: number;
  tempLow: number;
  condition: string;
  iconUrl?: string;
  precipitationChance: number;
  windSpeed?: number;
  humidity?: number;
  scrapedAt: Date;
  sourceUrl: string;
}


