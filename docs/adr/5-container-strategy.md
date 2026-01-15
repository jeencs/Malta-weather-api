# ADR 5: Docker Container Setup

## What I'm doing
Putting the app in Docker containers. Need to make it:
- Small
- Secure (don't run as root)
- Have health checks
- Configurable with environment variables
- Build the same way every time
- Separate build stuff from runtime stuff

## My plan

### Base Image
Using **node:20-alpine** for running.

### Docker Compose
Setting up multiple containers:
- PostgreSQL database (postgres:15-alpine)
- My app
- Volumes to save data
- Health checks so containers wait for dependencies

## Why I'm doing it this way

### Why node:20-alpine?

1. **Tiny**: Alpine Linux is like 5MB vs 100MB for Debian images
2. **Secure**: Less stuff means less stuff that can break
3. **Official**: Docker and Node.js teams maintain it
4. **LTS**: Node 20 is supported until April 2026
5. **Has node user**: Don't need to create a user manually


## My Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Docker Compose setup

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: malta_weather
      POSTGRES_USER: weather_user
      POSTGRES_PASSWORD: weather_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://weather_user:weather_pass@postgres:5432/malta_weather
      PORT: 3000
      NODE_ENV: production

volumes:
  postgres_data:
```

## How to run?

```bash
npm install
npm run build
docker-compose build
docker-compose up -d
```

## What this means

### Good:
- Small images
- Fast to build and deploy
- Secure (non-root, minimal stuff)
- Health checks help it self-heal
- Builds the same way every time
- Easy to develop locally with docker-compose
- Ready for production

### Bad:
- Alpine can sometimes have issues with native libraries (rarely happens with Node though)
- Multi-stage is a bit more complex
- Health check uses a tiny bit of resources

### Other:
- Need curl in the image for health checks (adds ~2MB)
- Need to make sure any native dependencies work on Alpine

## Security checklist
- Minimal Alpine base
- No secrets hardcoded
- Health check
- Explicit ports
- Reproducible builds with package-lock.json

