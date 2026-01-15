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
  uvIndex?: number;
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
  current: CurrentWeather;
  scrapedAt: Date;
  sourceUrl: string;
}

export interface WeatherForecast {
  id?: number;
  forecast: ForecastDay;
  scrapedAt: Date;
  sourceUrl: string;
}

export interface CurrentWeatherEntity {
  id: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  condition: string;
  icon_url: string | null;
  rainfall: number;
  feels_like: number | null;
  pressure: number | null;
  visibility: number | null;
  uv_index: number | null;
  scraped_at: Date;
  source_url: string;
  created_at: Date;
}

export interface ForecastDayEntity {
  id: number;
  forecast_date: Date;
  temp_high: number;
  temp_low: number;
  condition: string;
  icon_url: string | null;
  precipitation_chance: number;
  wind_speed: number | null;
  humidity: number | null;
  scraped_at: Date;
  source_url: string;
  created_at: Date;
}

export interface CurrentWeatherResponse {
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
  uvIndex?: number;
  scrapedAt: string;
  sourceUrl: string;
}

export interface ForecastResponse {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  iconUrl?: string;
  precipitationChance: number;
  windSpeed?: number;
  humidity?: number;
}

export interface ForecastListResponse {
  forecast: ForecastResponse[];
  scrapedAt: string;
  sourceUrl: string;
  days: number;
}

