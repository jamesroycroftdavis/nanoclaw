---
name: research
description: >
  Multi-faceted research agent skill. Use when any agent needs to research a topic — markets,
  competitors, technologies, people, companies, trends, regulations, or anything else.
  Trigger when: "research X", "look into X", "find out about X", "what do we know about X",
  "deep dive on X", "competitive analysis", "who is X", "what's happening with X".
  Supports three depth modes (quick/standard/deep) and multiple output formats
  (Telegram, Notion, CSV, local markdown).
---

# Research Skill

## When to use
Any time an agent needs to gather external information to answer a question, inform a decision,
or build context for a task. This includes:
- Market research, competitive analysis
- Technology evaluation, framework comparison
- People/company research, due diligence
- Trend analysis, industry landscape
- Fact-checking, verification
- Pre-meeting prep, background research

## Depth modes

Infer from context or specify explicitly:

| Mode | Time | Method | Output |
|---|---|---|---|
| `quick` | 1-2 min | Search + summarise | Telegram reply only |
| `standard` | 5-10 min | Search → scrape top sources → synthesise | Telegram + Notion page |
| `deep` | 15-30 min | Multi-pass research loop with gap analysis | Telegram + Notion + Supabase index |

## Methodology

```
1. Check intelligence repo first (what do we already know?)
2. Frame the question precisely
3. Search broadly (firecrawl search, varied queries)
4. Evaluate sources (authority, recency, relevance)
5. Scrape best 3-5 sources (firecrawl scrape)
6. Cross-reference findings
7. Identify and fill gaps
8. Synthesise — patterns, conclusions, uncertainties
```

## Tools (in priority order)

1. `intelligence` skill — check existing knowledge FIRST
2. `firecrawl-search` — discover sources
3. `firecrawl-scrape` — extract from specific URLs
4. `firecrawl-map` — find specific pages on large sites
5. `firecrawl-agent` — complex multi-step extraction
6. `firecrawl-browser` — interactive/JS-heavy sites
7. Context7 — library/framework docs
8. Playwright — fallback browser
9. Direct APIs — GitHub, etc.

## Firecrawl discipline

- Credits are limited. Be surgical, not exhaustive
- Cache all results: `-o .firecrawl/research/[topic]/`
- Search first, scrape selectively
- Parallelise independent scrapes
- Use `firecrawl-map --search` before crawling entire sites

## Output routing

| Request | Where |
|---|---|
| Quick answer | Telegram reply only |
| Standard research | Telegram summary + Notion page under Ops > Research |
| Deep research | Telegram + Notion + Supabase intelligence row |
| "Give me a table" | Notion database or local CSV |
| "Save locally" | `.firecrawl/research/[topic]/report.md` |

**Notion Research page ID**: 324abf79-4093-81e4-af16-ca1fb6a4695a

**Supabase intelligence entry** (deep only): one lean row with topic, summary (max 500 chars), tags, notion_url, depth, source_count. The catalogue, not the report.

## Output structure (Notion pages)

```markdown
# [Topic] — Research [YYYY-MM-DD]

## Executive Summary
3-5 sentences. What matters. Confidence level.

## Key Findings
Bulleted. Each finding with supporting evidence.

## Sources & Evidence
Numbered list. URL, what was found, credibility note.

## Open Questions
What couldn't be answered. Where to look next.
```
