import { config } from './index';

describe('Config', () => {
  it('should have correct server configuration', () => {
    expect(config.server.port).toBe(3000);
    expect(config.server.apiVersion).toBe('v1');
    expect(config.server.corsOrigin).toBe('*');
  });

  it('should have correct database configuration', () => {
    expect(config.database.url).toContain('postgresql://');
    expect(config.database.poolSize).toBe(10);
  });

  it('should have correct scraper configuration', () => {
    expect(config.scraper.url).toBe('https://www.malteseislandsweather.com');
    expect(config.scraper.timeout).toBe(15000);
    expect(config.scraper.retryAttempts).toBe(3);
  });
});
