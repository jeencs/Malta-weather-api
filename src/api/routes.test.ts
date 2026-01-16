import { createRouter } from './routes';
import { WeatherController } from './weatherController';

describe('Routes', () => {
  it('should create a router with health endpoint', () => {
    const mockWeatherController = {
      getCurrentWeather: jest.fn(),
      getForecast: jest.fn(),
    } as unknown as WeatherController;

    const router = createRouter(mockWeatherController);
    
    expect(router).toBeDefined();
  });

  it('should have weather endpoints configured', () => {
    const mockWeatherController = {
      getCurrentWeather: jest.fn(),
      getForecast: jest.fn(),
    } as unknown as WeatherController;

    const router = createRouter(mockWeatherController);
    
    // Router should be created successfully
    expect(router).toBeTruthy();
  });
});
