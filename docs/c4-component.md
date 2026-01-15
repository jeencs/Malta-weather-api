# C4 Component Diagram - Malta Weather API

This diagram shows the internal components of the Express API container and how they interact.

```mermaid
graph TB
    User[User]
    ExternalWebsite[External Website]
    Database[(PostgreSQL)]
    
    subgraph ExpressAPIContainer[Express API Container]
        subgraph Middleware[Middleware Layer]
            RequestLogger[Request Logger]
            ErrorHandler[Error Handler]
            Validator[Request Validator]
        end
        
        subgraph APILayer[API Layer]
            Routes[Routes<br/>/v1/*]
            HealthController[Health Controller<br/>/v1/health]
            WeatherController[Weather Controller<br/>/v1/weather/*]
            SwaggerUI[Swagger UI<br/>/v1/docs]
        end
        
        subgraph ServiceLayer[Service Layer]
            WeatherService[Weather Service<br/>Business Logic]
            WeatherScheduler[Weather Scheduler<br/>Cron Jobs]
            WeatherScraper[Weather Scraper<br/>HTML Parsing]
        end
        
        subgraph DataLayer[Data Access Layer]
            WeatherRepository[Weather Repository<br/>Database Operations]
        end
        
        subgraph DomainLayer[Domain Layer]
            DomainModels[Domain Models<br/>Types & Interfaces]
        end
        
        subgraph UtilsLayer[Utilities]
            Logger[Logger JSON]
            Metrics[Metrics Collector<br/>In-Memory]
            DBPool[Database Pool<br/>pg connection pool]
        end
    end
    
    User -->|HTTP Request| Routes
    Routes --> RequestLogger
    RequestLogger --> Validator
    Validator --> HealthController
    Validator --> WeatherController
    Validator --> SwaggerUI
    
   
    HealthController --> Metrics
    WeatherController --> WeatherService
    
    WeatherService --> WeatherRepository
    WeatherService --> Logger
    
    WeatherScheduler -->|Triggers| WeatherService
    WeatherService --> WeatherScraper
    WeatherScraper -->|Fetches HTML| ExternalWebsite
    WeatherScraper --> Logger
    WeatherScraper --> Metrics
    
    WeatherRepository --> DBPool
    WeatherRepository --> Logger
    DBPool -->|SQL Queries| Database
    
    WeatherController --> ErrorHandler
    HealthController --> ErrorHandler
    ErrorHandler -->|JSON Response| User
    
    WeatherService -.Uses.-> DomainModels
    WeatherScraper -.Uses.-> DomainModels
    WeatherRepository -.Uses.-> DomainModels
    
    style ExpressAPIContainer fill:#f9f9f9,stroke:#333,stroke-width:2px
    style APILayer fill:#e3f2fd
    style ServiceLayer fill:#fff3e0
    style DataLayer fill:#f3e5f5
    style Middleware fill:#e8f5e9
    style UtilsLayer fill:#fce4ec
    style DomainLayer fill:#fff9c4
```

## Component Descriptions

### API Layer (Controllers & Routes)

**Routes** (`src/api/routes.ts`)
- Maps HTTP endpoints to controller methods
- Applies middleware (validation, logging)
- Defines v1 API structure

**Health Controller** (`src/api/healthController.ts`)
- Endpoint: `GET /v1/health`
- Checks database connectivity
- Returns scraper metrics
- Status: 200 (healthy) or 503 (unhealthy)

**Weather Controller** (`src/api/weatherController.ts`)
- Endpoint: `GET /v1/weather/current`
- Endpoint: `GET /v1/weather/forecast?days=1-6`
- Retrieves data from WeatherService
- Returns JSON responses
- Handles errors with ApiError

**Swagger UI** (`src/app.ts`)
- Endpoint: `GET /v1/docs`
- Serves interactive API documentation
- Loads OpenAPI specification from YAML
- Provides API testing interface

### Middleware Layer

**Error Handler** (`src/middleware/errorHandler.ts`)
- Catches all errors in the application
- Converts to RFC 7807 Problem Details format
- Sets content-type: `application/problem+json`
- Logs errors with full context

**Validator** (`src/middleware/validation.ts`)
- Validates query parameters using Joi
- Enforces constraints (e.g., days: 1-6)
- Returns 400 errors for invalid input
- Sanitizes user input

### Service Layer

**Weather Service** (`src/services/weatherService.ts`)
- Orchestrates scraping and data persistence
- Coordinates between scraper and repository
- Handles business logic
- Tracks metrics (success/failure rates)
- Entry point for scheduled and manual scrapes

**Weather Scheduler** (`src/services/scheduler.ts`)
- Uses node-cron for scheduling
- Triggers scraping every 30 minutes
- Runs initial scrape on startup
- Prevents concurrent scrapes
- Provides manual trigger capability

**Weather Scraper** (`src/services/scraper.ts`)
- Fetches HTML from external website
- Parses HTML with Cheerio
- Extracts current weather and forecast
- Normalizes data to domain models
- Implements retry logic with exponential backoff
- Respects timeout and User-Agent settings

### Data Access Layer

**Weather Repository** (`src/repositories/weatherRepository.ts`)
- Abstracts database operations
- CRUD operations for weather data
- Implements deduplication logic
- Uses PostgreSQL connection pool
- Methods:
  - `saveCurrentWeather()`: Insert with deduplication
  - `getCurrentWeather()`: Get latest observation
  - `saveForecast()`: Insert forecast day
  - `getForecast(days)`: Get N-day forecast
  - `cleanupOldData()`: Delete data >30 days

### Domain Layer

**Domain Models** (`src/domain/models.ts`)
- TypeScript interfaces for data structures
- `CurrentWeather`: Current conditions
- `ForecastDay`: Single day forecast
- `WeatherObservation`: Database entity
- `WeatherForecast`: Database entity
- `ScraperMetrics`: Performance metrics
- Pure data structures, no business logic

### Utilities

**Logger** (`src/utils/logger.ts`)
- Winston-based structured logging
- JSON format for parsing
- Multiple transports (console, file)
- Log levels: info, warn, error
- Includes timestamps and context

**Metrics Collector** (`src/utils/metrics.ts`)
- In-memory metrics storage
- Tracks:
  - `scrape_success_total`
  - `scrape_failure_total`
  - `scrape_duration_seconds`
  - Last scrape time and status
- Extensible to Prometheus

**Database Pool** (`src/utils/database.ts`)
- PostgreSQL connection pooling
- Pool size: 10 connections
- Connection timeout: 10s
- Idle timeout: 30s
- Database initialization (create tables)
- Health check utility

## Data Flow

### Scraping Flow
1. **Scheduler** triggers **WeatherService** every 30 minutes
2. **WeatherService** calls **WeatherScraper**
3. **WeatherScraper** fetches HTML from **External Website**
4. **WeatherScraper** parses HTML and creates **Domain Models**
5. **WeatherService** passes models to **WeatherRepository**
6. **WeatherRepository** inserts data into **PostgreSQL** (with deduplication)
7. **Metrics** are updated (success/failure, duration)
8. **Logger** records the operation

### API Request Flow
1. **User** makes HTTP request to **Routes**
2. **Request Logger** logs the request
3. **Validator** validates query parameters
4. **Controller** receives validated request
5. **Controller** calls **WeatherService**
6. **WeatherService** calls **WeatherRepository**
7. **WeatherRepository** queries **PostgreSQL**
8. Data flows back through layers to **Controller**
9. **Controller** formats JSON response
10. **Error Handler** catches any errors
11. Response sent to **User**

## Design Patterns

- **Repository Pattern**: Abstracts data access (WeatherRepository)
- **Service Layer**: Business logic separated from controllers
- **Dependency Injection**: Services receive dependencies in constructor
- **Middleware Chain**: Request processing pipeline
- **Strategy Pattern**: Scraper implementation is swappable
- **Singleton**: Logger, Metrics, Database Pool

