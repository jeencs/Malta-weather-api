# ADR 6: Using Cheerio to Parse HTML

## What I'm doing
Need to extract weather data from HTML pages. Options range from running a full browser to simple parsing. I need to:
- Parse HTML efficiently
- Extract text, attributes, and data
- Handle different HTML structures
- Run in Docker
- Keep it simple

The website (https://www.malteseislandsweather.com) is just regular HTML, not a fancy JavaScript app.

## My choice
Using **Cheerio** for parsing HTML.

Cheerio is like jQuery but for Node.js. It's fast and easy to use.

## Why Cheerio?

1. **Like jQuery**: I know jQuery syntax so this is familiar
2. **Lightweight**: Just JavaScript, no browser (~200KB)
3. **Fast**: Parses HTML quickly
4. **Made for Node**: Works great on the server
5. **Flexible**: CSS selectors, can traverse the DOM, extract attributes
6. **Stable**: Lots of people use it, well maintained

### How to use it

**Selectors**:
```javascript
$('.temperature')           // Get by class
$('#weather-data')          // Get by ID
$('[data-temp]')            // Get by attribute
$('.forecast-day').slice(0, 6)  // Get first 6
```

**Getting data**:
```javascript
.text()                     // Get text
.attr('src')                // Get attribute
.find('.child')             // Find child elements
.each((i, el) => {})        // Loop through elements
```

**Loading HTML**:
```javascript
const $ = cheerio.load(htmlString);
```

### How it fits together

1. **Fetch HTML** with axios
2. **Parse it** with Cheerio (get the $ object)
3. **Extract data** with selectors
4. **Clean up data** into my data models
5. **Return objects**

## Other options I considered

### Puppeteer / Playwright
- Good: 
  - Full browser, can run JavaScript
  - Can interact with pages
  - Can take screenshots
- Bad: 
  - **Heavy**: Needs Chrome (~300MB+ container)
  - **Slow**: Starting a browser takes time
  - **Overkill**: The site is just HTML
  - **Complex**: Lots to set up
  - **Resource heavy**: Uses lots of CPU and memory
- Decision: Way too much for just parsing HTML


### Just using Regex
- Good: 
  - No dependencies
  - Really fast
  - Less code
- Bad: 
  - **Breaks easily**: HTML changes and regex breaks
  - **Hard to maintain**: Complex regex is a nightmare
  - **Limited**: Can't handle nested HTML well
  - **Unreadable**: Who can read complex regex?
- Decision: Too fragile

## How I'm making it robust

### Tricks to make it work better

1. **Try multiple selectors**: In case the HTML changes
   ```javascript
   extractNumber($, '.temperature, .temp, [class*="temp"]')
   ```

2. **Fallbacks**: Return null if not found instead of crashing
   ```javascript
   temperature || null
   ```

3. **Validation**: Check if the data makes sense
   ```javascript
   if (temperature === null || humidity === null) {
     logger.warn('Missing essential data');
     return null;
   }
   ```

4. **Logging**: Log everything for debugging
   ```javascript
   logger.debug('Extracted temperature', { value: temperature });
   ```

5. **Test with saved HTML**: Save HTML for testing
   - Store in `/testdata/html/`
   - Test parser against known HTML
   - Catch when website changes

### If the website changes

When the website HTML changes:
1. Tests will fail (gives me a heads up)
2. Logs will show extraction failures
3. Update the selectors
4. Update test files
5. Don't need to change the API or data models

Keeping things separated makes this easier.

## Example code

```typescript
import * as cheerio from 'cheerio';

const html = await fetchHtml(url);
const $ = cheerio.load(html);

// Get current weather
const temperature = extractNumber($, '.temperature');
const condition = extractText($, '.condition');
const iconUrl = extractAttribute($, '.weather-icon img', 'src');

// Get forecast
const forecastDays: ForecastDay[] = [];
$('.forecast-day').slice(0, 6).each((i, el) => {
  const $el = $(el);
  const tempHigh = extractNumber($el, '.temp-high');
  const tempLow = extractNumber($el, '.temp-low');
  // ... more stuff
  if (tempHigh && tempLow) {
    forecastDays.push({ /* ... */ });
  }
});
```

## What this means

### Good:
- Fast and lightweight
- Familiar jQuery syntax
- Small containers (no browser)
- Easy to test
- Low resource use
- Code is easy to read

### Bad:
- Can't handle JavaScript sites (but I don't need to)
- Need to update selectors when site changes (inevitable)
- Not as powerful as browser automation (don't need it)

### Other:
- Need to inspect the website to find selectors
- Should save HTML files for testing
- Might need to adjust selectors over time

## How to set it up

### Install
```bash
npm install cheerio
```

### Helper functions
```typescript
extractText($, selector): string | null
extractNumber($, selector): number | null
extractAttribute($, selector, attr): string | null
```

### Testing
- Save HTML in `/testdata/html/`
- Write unit tests with the saved HTML
- Catch changes early

### Monitoring
- Log successful extractions
- Alert on failures
- Track success rate

Right now, Cheerio works great.