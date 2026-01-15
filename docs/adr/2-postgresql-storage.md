# ADR 2: Using PostgreSQL for Database

## What I'm doing
Using PostgreSQL for storing the weather data.

## What is needed
A database that can:
- Store weather data in a structured way
- Query by date and time easily
- Not save the same data twice (deduplication)
- Keep data safe even if something crashes
- Work in Docker
- Actually be reliable

## Database tables:

### `current_weather` table
This stores the current weather observations that is scraped. Set it up so it won't save duplicate records if the data is the same within a minute. Also added an index on `scraped_at` so I can get the latest data quickly.

### `weather_forecast` table
This is for forecast data. Made sure it won't duplicate forecasts for the same date and hour. Indexed by forecast_date so I can query date ranges fast.

## Why PostgreSQL?

I picked PostgreSQL because:

1. **It's relational**: Weather data has a clear structure so relational makes sense
2. **Handles duplicates**: Can use UNIQUE constraints to prevent saving the same thing twice
3. **Has good features**: 
   - Date/time functions that make querying easier
   - Indexes make queries faster
4. **ACID stuff**: Keeps data consistent even if the scraper crashes halfway through
5. **Works with Docker**: There's official Docker images that are easy to use
6. **Good Node driver**: The `pg` library works well with Node.js and has connection pooling
7. **Battle-tested**: It's been around forever and everyone uses it

## How I'm setting it up

### Avoiding duplicates:
- Using UNIQUE constraints so the database won't save the same thing twice
- Using `ON CONFLICT DO NOTHING` in my queries which is pretty cool
- Saves space and avoids confusion

### Querying by time:
- Window functions help me get the latest forecast for each date
- Indexes on timestamp columns make it faster
- DATE_TRUNC for grouping by time periods

### Tracking metadata:
- `scraped_at`: When I actually got the data
- `source_url`: Where it came from
- `created_at`: When the record was created

### Cleaning up old data:
- Planning to delete stuff older than 30 days
- Keeps the database from getting too big

## Other options I thought about

### SQLite
- Good: Don't need a separate container, super easy setup
- Bad: Can't handle multiple writes at once, harder to debug, not as good for production
- Overall: Probably fine for a small project but PostgreSQL seems more professional

### MongoDB
- Good: Flexible, can change the structure easily
- Bad: Overkill for weather data which has a clear structure, harder to prevent duplicates
- My take: Don't need the flexibility, weather data fits relational model better

### MySQL
- Good: Pretty similar to PostgreSQL, widely used
- Bad: Date/time functions aren't as good, window functions aren't as mature
- My take: PostgreSQL just has better features for what I need

## What this means

### Good:
- Database handles deduplication for me
- SQL features make my queries easier
- Data stays consistent even if something crashes
- Easy to backup
- docker-compose works great for local dev

### Bad:
- Need a separate container which is a bit more complex than SQLite
- Have to figure out connection pooling
- Uses more resources than SQLite

## Setup details

### How I'm preventing duplicates
- Current weather: Unique by (temperature, humidity, wind_speed, condition, minute)
- Forecast: Unique by (forecast_date, hour of scrape)
- Use `ON CONFLICT DO NOTHING` to skip duplicates quietly

### Indexes
- `current_weather(scraped_at DESC)` - for getting latest observation
- `weather_forecast(forecast_date, scraped_at DESC)` - for getting latest forecast per day

### Cleanup
- Will make a scheduled job to delete data older than 30 days
- Keeps database from growing forever

