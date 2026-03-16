---
name: notion
description: |
  Publish work documents to Notion. Use this skill whenever you complete a piece of work that should be documented — research reports, strategy docs, engineering specs, analysis, plans. ALWAYS publish to Notion when your task produces a deliverable. After creating the page, share the Notion URL back in the chat so James can review it.
allowed-tools:
  - Bash(curl *api.notion.com*)
---

# Notion — Document Publishing

Publish your work to James's Notion workspace. The API key is pre-configured via `NOTION_API_KEY`.

## IMPORTANT: Always publish deliverables

When your task produces a document, report, strategy, analysis, or any substantive output:
1. Create a Notion page with the content
2. Share the URL back in the chat via `send_message`

## Parent pages (where to create documents)

Route documents to the correct parent page based on content:

| Content type | Parent page ID | Page name |
|-------------|----------------|-----------|
| Research, analysis, strategy, investigations, plans | `325abf79-4093-80e7-83a4-cdcc2b0ec0b4` | Claw > Strategy & Research |
| Marketing, growth, outreach, brand, campaigns | `325abf79-4093-80f1-823e-d649bc0053e6` | Claw > Marketing |
| Content, writing, LinkedIn, social media | `325abf79-4093-80e2-a4f8-efeab8dea038` | Claw > Content |
| Operations, processes, systems, engineering | `323abf79-4093-8013-9801-f4ac16e53420` | Ops |

If unsure, use Strategy & Research as the default.

## Creating a page

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "PARENT_PAGE_ID"},
    "properties": {
      "title": [{"text": {"content": "Your Page Title"}}]
    },
    "children": [
      CONTENT_BLOCKS
    ]
  }'
```

The response includes `"url"` — share this back in the chat.

## Content blocks

### Heading

```json
{"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Section Title"}}]}}
```

### Paragraph

```json
{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Your text here."}}]}}
```

### Bold text within a paragraph

```json
{"type": "text", "text": {"content": "bold text"}, "annotations": {"bold": true}}
```

### Bulleted list item

```json
{"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "List item"}}]}}
```

### Numbered list item

```json
{"object": "block", "type": "numbered_list_item", "numbered_list_item": {"rich_text": [{"type": "text", "text": {"content": "Step 1"}}]}}
```

### Callout (for key insights or recommendations)

```json
{"object": "block", "type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Key insight here"}}], "icon": {"emoji": "💡"}}}
```

### Divider

```json
{"object": "block", "type": "divider", "divider": {}}
```

### Toggle (collapsible section)

```json
{"object": "block", "type": "toggle", "toggle": {"rich_text": [{"type": "text", "text": {"content": "Click to expand"}}], "children": [NESTED_BLOCKS]}}
```

## Example: Create a research document

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "325abf79-4093-80e7-83a4-cdcc2b0ec0b4"},
    "properties": {
      "title": [{"text": {"content": "Competitor Analysis: AI Assistants Q1 2026"}}]
    },
    "children": [
      {"object": "block", "type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Research completed by Researcher agent on 2026-03-16"}}], "icon": {"emoji": "📋"}}},
      {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Executive Summary"}}]}},
      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Summary of findings..."}}]}},
      {"object": "block", "type": "divider", "divider": {}},
      {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Key Findings"}}]}},
      {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Finding 1"}}]}},
      {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Finding 2"}}]}}
    ]
  }'
```

## Tips

- Notion API limits blocks to 100 per request. For longer documents, create the page first, then append blocks in batches using the "Append block children" endpoint.
- Rich text content has a 2000 character limit per text object. Split longer text across multiple text objects or paragraphs.
- Always include a callout at the top with who created it and when.
- Use headings to structure the document — make it scannable.
- The URL in the response (`"url"` field) is what you share back in the chat.

## Appending blocks to an existing page

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/PAGE_ID/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"children": [CONTENT_BLOCKS]}'
```

## Searching for existing pages

```bash
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"query": "search term", "page_size": 5}'
```
