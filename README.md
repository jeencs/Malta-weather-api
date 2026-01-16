# Malta Weather API

A simple REST API that scrapes weather data from malteseislandsweather.com and serves it as JSON. Built with Node.js, Express, and PostgreSQL.

## What it does

This API automatically scrapes weather information from the Malta weather website every 30 minutes and stores it in a database. You can then get current weather and forecast data through simple HTTP endpoints.

## Features

- Scrapes weather data automatically every 30 minutes
- Stores data in PostgreSQL database
- REST API endpoints for current weather and forecast
- Health check endpoint
- API documentation with Swagger

## Tech Stack

- **Node.js** (v20+)
- **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Cheerio** - HTML parsing for scraping
- **Docker** - Containerization

## Prerequisites

Before you start, make sure you have:
- Node.js 20 or higher
- Docker and Docker Compose (for easy setup)
- Or PostgreSQL installed locally (if not using Docker)

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/jeencs/Malta-weather-api.git
cd Malta-weather-api
```

2. Start everything with Docker Compose:
```bash
docker-compose up -d
```

This will start both the PostgreSQL database and the API server. The API will be available at `http://localhost:3000`

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure PostgreSQL is running and create a database called `malta_weather`

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/v1`

### Health Check
```
GET /v1/health
```
Check if the API is running.

### Current Weather
```
GET /v1/weather/current
```
Get the most recent weather data.

### Weather Forecast
```
GET /v1/weather/forecast
```
Get weather forecast data.

### API Documentation
```
GET /v1/docs
```
Interactive Swagger documentation (when running).

## Project Structure

```
src/
├── api/              # API routes and controllers
├── config/           # Configuration settings
├── domain/           # Domain models and types
├── repositories/     # Database access layer
├── services/         # Business logic (scraping, scheduling)
├── middleware/       # Express middleware
└── utils/            # Utility functions
```

## Configuration

All configuration is in `src/config/index.ts`. The scraper runs every 30 minutes by default and stores data in PostgreSQL.

## Development

- Run linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Build: `npm run build`

## Notes

- The scraper respects the website by using a polite user agent and reasonable delays
- Data is scraped every 30 minutes automatically
- Make sure PostgreSQL is running before starting the API

## Author

Jeena Naibzada

## License

This is an educational project.
