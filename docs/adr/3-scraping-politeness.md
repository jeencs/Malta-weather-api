# ADR 3: Being Nice When Scraping Websites

## What I'm doing
Scraping weather data from https://www.malteseislandsweather.com but trying not to be annoying about it.

## Why this matters
I want to:
- Not overload their server
- Be a good internet citizen
- Not get blocked
- Do things ethically
- Keep it reliable

Weather doesn't change that fast anyway (takes minutes/hours), so I don't need to scrape constantly.

## My plan

### How often to scrape:
- **Every 30 minutes** (can change this in environment variables)
- Using node-cron with `*/30 * * * *`
- Scrape once when the app starts so there's data right away

### Being polite:

1. **Custom User-Agent**
   - Using: `MaltaWeatherAPI/1.0 (Educational Project; Respectful Scraping)`

2. **Request Timeout**
   - 15 seconds max per request
   - Don't want connections hanging forever
   - Fail fast if the site is down

3. **Exponential Backoff**
   - If it fails, try again up to 3 times
   - Wait 1s, then 2s, then 4s between retries
   - Gives their server time to recover if it's having issues

4. **Rate Limiting**
   - Only ONE scrape at a time
   - Skip the next scrape if the previous one is still running
   - No parallel requests

5. **Deduplication**
   - Database won't save the same data twice
   - Reduces unnecessary database writes
   - Could cache HTML too if needed

## Why I'm doing it this way

### Why 30 minutes?
Weather doesn't usually change drastically in 30 minutes. This seems like a good balance:
- Still pretty up-to-date (48 times per day)
- Not too much load on their server
- Balance between fresh data and being respectful
- Matches how often weather usually updates

### Why exponential backoff?
If I retry immediately when it fails, I might make things worse if their server is struggling. Waiting longer each time:
- Gives their server time to recover
- Is the standard way to do retries

### Why custom user-agent?
By identifying myself clearly:
- More professional
- Helps them understand their traffic

### Why 15 second timeout?
Sometimes requests can hang forever:
- 15 seconds is plenty of time for an HTML page
- Prevents connections piling up
- Let's me move on to the next cycle
- Better error handling

## Other options I thought about

### Scraping every 5-10 minutes
- Good: More current data
- Bad: Not really needed, 6-12x more load, might get blocked, not respectful
- Decision: 30 minutes is fine

### Scraping every 1-2 hours
- Good: Even less load, very respectful
- Bad: Data gets old, might miss quick weather changes
- Decision: Could work but 30 minutes is better

### Checking robots.txt automatically
- Good: Automated respect for rules
- Bad: Site might not have one, adds complexity, can just check manually
- Decision: I checked manually, don't need to automate it

### Using a throttling library
- Good: Professional rate limiting
- Bad: Overkill for one website at low frequency, extra dependency
- Decision: Not needed, cron is simple enough

## What this means

### Good:
- Doing the right thing ethically
- Low chance of getting blocked
- Minimal impact on their site
- Shows responsible development
- Easy to understand and maintain

### Bad:
- Data is max 30 minutes old
- Need to wait for first scrape on startup

### Other:
- Need to watch for failures
- Might need to adjust timing later

## How to set it up

### Config
```bash
SCRAPE_INTERVAL=*/30 * * * *  # Every 30 minutes
SCRAPE_TIMEOUT=15000          # 15 seconds
SCRAPE_RETRY_ATTEMPTS=3       # 3 tries
SCRAPE_RETRY_DELAY=1000       # Start with 1 second
SCRAPE_USER_AGENT=MaltaWeatherAPI/1.0 (Educational Project; Respectful Scraping)
```

### Monitoring
- Log every scrape (when it started, how long, success/fail)
- Track how often it succeeds vs fails
- Alert if too many failures
- Track metrics

### Backup plan
- If scraping stops working, can use saved HTML files
- Keep fixtures in `/testdata/html/`
- Can swap out scraper implementation

