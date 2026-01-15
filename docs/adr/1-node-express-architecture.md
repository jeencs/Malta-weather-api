# ADR 1: Choosing Node.js, Express, and TypeScript

I need to pick what tech to use for this weather scraping project. Basically I need something that can:
- Scrape HTML from websites
- Save data in a database
- Make an API
- Run in Docker containers
- Has libraries for HTTP related operations and parsing HTML

## What I decided to use:
- Node.js for running JavaScript
- Express.js as the web framework
- TypeScript instead of plain JavaScript
- npm for managing packages

## Why Node.js?
I picked Node.js because:
- It's really good for I/O stuff like web scraping and making API calls
- There's various of packages on npm for everything is needed
- Docker images for Node are smaller (like node:20-alpine)
- Version 20 is supported until 2026 so I don't need to worry about it
- It's fast enough for supporting the proccess.

## Why Express?
Express seems like the most popular choice for making APIs in Node:
- It is fimiliar for everyone so there's lots of tutorials online
- It's simple and doesn't force you to structure your code a certain way
- Lots of middleware available for logging and error handling
- Works well with Swagger for API docs
- Easy to organize my code into controllers and routes

## Why TypeScript?
I decided to use TypeScript even though it's a bit harder:
- Catches errors before I even run the code
- My code editor (VS Code) gives better autocomplete
- Makes my code easier to understand because everything has types
- Less bugs with weather data if I define the types properly
- Strict mode catches even more potential issues

## Other options I looked at

### Python with FastAPI
- Good stuff: Python is great for data, FastAPI is modern
- Bad stuff: Docker images are bigger, takes longer to start, I'm more familiar with JavaScript
- Decision: No, still sticking with Node

### Java with Spring Boot
- Good stuff: Really robust, lots of features
- Bad stuff: Way too heavy, takes forever to start, complicated setup
- Decision: Definitely not, seems overkill for this project

## What this means

### Good things:
- Development should be pretty fast with all the npm packages
- Cheerio library for parsing HTML is really good
- Small Docker images
- TypeScript will help me avoid dumb bugs
- Should work well for scraping

### Bad things:
- Node is single-threaded but it may not matter here.
- npm can be confusing sometimes with all the dependencies
- TypeScript means I need to compile before running

### Other stuff:
- Need to be careful with async/await to avoid mess it up
- Need to compile TypeScript to JavaScript

## How it'll be built
- Use TypeScript strict mode
- Use repository pattern
- Try to keep controllers, services separate
- Use async/await when needed.

