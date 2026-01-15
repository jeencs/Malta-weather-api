# ADR 4: API Versioning and Error Formatting

## What I'm doing
Making a REST API that can change over time without breaking things, with a clear versioning strategy and good error messages.

## The plan

### API Versioning
Using **URL-based versioning** - putting the version in the URL path.

**Format**: `/v{major}/resource`

**Examples**:
- `/v1/health`
- `/v1/weather/current`
- `/v1/weather/forecast`

### Error Messages

**Content-Type**: `application/problem+json`

## Why I'm doing it this way

### Why put version in URL?

1. **Super obvious**: You can see the version right in the URL
2. **Easy to route**: Express handles this naturally with router prefixes
3. **Cacheable**: Different versions can cache differently
4. **Documentation**: Swagger groups by version automatically
5. **Easy to test**: Can just type it in the browser

### Why API versioning + API error handling

**Why it's good**:
1. **Standard**: Everyone uses it so people know what to expect
2. **Machine-readable**: Code can parse it easily
3. **Human-readable**: Clear messages help with debugging
4. **Flexible**: Can add more fields if I need to
5. **Type system**: Can categorize errors

**What the fields mean**:
- `type`: What kind of error (can link to docs)
- `title`: Short description (same for all errors of this type)
- `status`: HTTP status code
- `detail`: Specific explanation for this error
- `instance`: Which request caused it

**Other formats I considered**:
- **Custom JSON**: 
  - Good: Total control
  - Bad: Reinventing the wheel, no standard
- **Plain text**:
  - Good: Simple
  - Bad: Can't parse it easily, looks unprofessional
- **JSend**:
  - Good: Simple, some people use it
  - 
  
  Bad: Not an official standard, less features

## How versioning works

### v1 is my first version
- It's stable
- Promises:
  - Won't remove endpoints
  - Won't break response formats
  - Query parameters stay compatible

### Future versions
- **Breaking changes** = need v2
- **Adding stuff** = can add to v1
- **Deprecation**: Mark as deprecated first, give people time to migrate

### What counts as breaking?
- Deleting an endpoint
- Removing a field from responses
- Changing a field's data type
- Renaming a field
- Changing required vs optional parameters
- Changing error format

### What's NOT breaking?
- Adding new endpoints
- Adding optional parameters
- Adding new fields (clients should just ignore unknown fields)
- Making error messages better

## Example errors

### Validation Error (400)
```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Invalid query parameter",
  "status": 400,
  "detail": "Parameter 'days' must be between 1 and 6.",
  "instance": "/v1/weather/forecast"
}
```

### Not Found (404)
```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource '/v1/unknown' was not found",
  "instance": "/v1/unknown"
}
```

### No Data (404)
```json
{
  "type": "https://example.com/problems/no-data",
  "title": "No Data Available",
  "status": 404,
  "detail": "No current weather data available. The system may not have scraped data yet.",
  "instance": "/v1/weather/current"
}
```

### Server Error (500)
```json
{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred",
  "instance": "/v1/weather/current"
}
```

## What this means

### Good:
- Clear versioning that makes sense
- Can run multiple versions at once if needed
- Standard error format is easier to use
- Errors actually help you figure out what's wrong
- Looks professional

### Bad:
- URLs are a bit longer with /v1 in them
- Need to keep v1 backward compatible
- Might have duplicate code for multiple versions

### Other:
- Need to document the versioning policy
- Need to think about v2 eventually

## How to implement

### Express routing
```typescript
app.use('/v1', v1Router);
// Later: app.use('/v2', v2Router);
```

### Error handler
```typescript
// Make a custom error class
class ApiError extends Error {
  constructor(status, title, detail, type = 'about:blank') {
    // ...
  }
}

// Middleware to convert errors to RFC 7807
function errorHandler(err, req, res, next) {
  res.type('application/problem+json').json({
    type: err.type,
    title: err.title,
    status: err.status,
    detail: err.detail,
    instance: req.path
  });
}
```

### Documentation
- Document API in `docs/openapi.yaml`
- Include error schemas
- Set version in info.version

### Logging
- Log all errors with context
- Include path, method, error details
- Don't log sensitive stuff
