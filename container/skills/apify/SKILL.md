---
name: apify
description: |
  Web scraping and automation via Apify actors. Use when you need structured data extraction at scale, scraping specific platforms (Google, Amazon, Instagram, LinkedIn, YouTube, Twitter/X, TikTok, etc.), or running pre-built scrapers. Triggers on "scrape", "extract data from", "get reviews from", "crawl", "get leads", "scrape Google", "scrape LinkedIn", "get product data", or any platform-specific data extraction. Apify has 2000+ pre-built actors for specific sites. Use Apify over Firecrawl when you need platform-specific structured data (e.g., Google Maps results, Amazon products, social media profiles).
allowed-tools:
  - Bash(apify *)
  - Bash(curl *api.apify.com*)
---

# Apify — Web Scraping & Automation

Apify provides 2000+ pre-built actors (scrapers) for specific websites and platforms. The API token is pre-configured via `APIFY_TOKEN`.

## When to use Apify vs Firecrawl

- **Firecrawl**: General web scraping, search, content extraction as markdown
- **Apify**: Platform-specific structured data (Google Maps, Amazon, social media, etc.), large-scale scraping, complex automation

## Using the Apify API directly (recommended)

The most reliable way to run actors from the container:

### Run an actor and get results

```bash
# Start an actor run
curl -s -X POST "https://api.apify.com/v2/acts/ACTOR_ID/runs" \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": {...}}'

# The response includes a run ID. Wait for it to finish:
curl -s "https://api.apify.com/v2/actor-runs/RUN_ID?token=$APIFY_TOKEN"

# Get the results from the default dataset:
curl -s "https://api.apify.com/v2/actor-runs/RUN_ID/dataset/items?token=$APIFY_TOKEN"
```

### Run synchronously (waits for results, up to 5 min)

```bash
curl -s -X POST "https://api.apify.com/v2/acts/ACTOR_ID/run-sync-get-dataset-items" \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": {...}}'
```

## Using the Apify CLI

```bash
# Login (uses APIFY_TOKEN env var automatically)
apify login --token "$APIFY_TOKEN"

# Run an actor
apify call ACTOR_ID -i '{"key": "value"}'

# List your runs
apify runs ls
```

## Popular actors

| Actor | ID | Use case |
|-------|-----|---------|
| Google Search | `apify/google-search-scraper` | Search results, SERP data |
| Google Maps | `compass/crawler-google-places` | Business listings, reviews |
| Amazon Products | `junglee/amazon-crawler` | Product data, prices, reviews |
| Instagram | `apify/instagram-scraper` | Posts, profiles, hashtags |
| YouTube | `bernardo/youtube-scraper` | Video data, comments, channels |
| Twitter/X | `apidojo/tweet-scraper` | Tweets, profiles, search |
| TikTok | `clockworks/free-tiktok-scraper` | Videos, profiles, hashtags |
| LinkedIn | `anchor/linkedin-people-search` | People profiles, companies |
| Web Scraper | `apify/web-scraper` | Custom scraping with selectors |
| Cheerio Scraper | `apify/cheerio-scraper` | Fast HTML scraping |
| Puppeteer Scraper | `apify/puppeteer-scraper` | JS-rendered pages |

### Finding actors

Search the Apify Store for the right actor:

```bash
curl -s "https://api.apify.com/v2/store?token=$APIFY_TOKEN&search=SEARCH_TERM&limit=10" | jq '.data.items[] | {name, username, title, description}'
```

## Example: Scrape Google Search results

```bash
curl -s -X POST "https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items" \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": "best AI tools 2026",
    "maxPagesPerQuery": 1,
    "resultsPerPage": 10
  }'
```

## Example: Scrape Google Maps businesses

```bash
curl -s -X POST "https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items" \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "searchStringsArray": ["coffee shops in London"],
    "maxCrawledPlacesPerSearch": 20
  }'
```

## Tips

- Use `run-sync-get-dataset-items` for quick jobs (returns results directly, max ~5 min)
- Use async `runs` + polling for longer jobs
- Check actor README on Apify Store for input schema — each actor has different parameters
- Results are JSON arrays — pipe through `jq` for formatting
- Save large results to files: `> /workspace/group/results.json`
