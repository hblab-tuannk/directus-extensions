# Directus Display End Date Interface

A custom Directus interface extension that provides a date/time picker for setting when content should stop being displayed. Posts with an end date in the past will be automatically filtered out from API queries.

## Why It's Useful

When managing time-sensitive content like blog posts, news articles, or promotional content, you need to control when content should stop being displayed. This extension solves this problem by:
- Providing an intuitive date/time picker for setting display end dates
- Warning users when an end date has already passed
- Enabling automatic filtering of expired content via Directus API queries
- Supporting both date-only and date-time selections
- Preventing expired content from appearing in your frontend applications

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Copy the `dist` folder to your Directus extensions directory:
   - For local development: `extensions/interfaces/display-end-date/`
   - The folder structure should be: `extensions/interfaces/display-end-date/dist/index.js`
5. Restart your Directus instance
6. The "Display End Date" interface will be available in the interface options when editing fields

## Usage

### 1. Setup Field in Collection

1. **Create or edit a field** in your Directus collection (e.g., `posts`)
2. **Set the field type** to "DateTime" or "Timestamp"
3. **Select "Display End Date"** as the Interface
4. **Configure options** (optional):
   - **Include Time**: Toggle to include time in the date picker (enabled by default)
   - **Minimum Date**: Set a minimum date constraint (optional)

### 2. Using the Interface

- Click the date/time picker to select when content should stop being displayed
- If the selected date has passed, a warning message will appear
- Leave empty if the content should always be displayed (no expiration)

### 3. Filtering Expired Content via API

When querying your collection via Directus API, use query filters to exclude expired posts:

#### Using Directus SDK (JavaScript/TypeScript):

```javascript
import { createDirectus, rest, readItems } from '@directus/sdk';

const directus = createDirectus('https://your-instance.com').with(rest());

// Get only active posts (display_end_date is null or in the future)
const activePosts = await directus.request(
  readItems('posts', {
    filter: {
      _or: [
        { display_end_date: { _null: true } },
        { display_end_date: { _gte: '$NOW' } }
      ]
    }
  })
);
```

#### Using REST API:

```bash
GET /items/posts?filter[_or][0][display_end_date][_null]=true&filter[_or][1][display_end_date][_gte]=$NOW
```

Or using JSON filter:

```json
{
  "filter": {
    "_or": [
      { "display_end_date": { "_null": true } },
      { "display_end_date": { "_gte": "$NOW" } }
    ]
  }
}
```

**Note:** `$NOW` is a dynamic variable in Directus that represents the current timestamp.

#### GraphQL Query:

```graphql
query {
  posts(
    filter: {
      _or: [
        { display_end_date: { _null: true } }
        { display_end_date: { _gte: "$NOW" } }
      ]
    }
  ) {
    id
    title
    display_end_date
  }
}
```

## Features

- ✅ Date/Time picker interface (similar to Published At)
- ✅ Support for date-only or date-time selection
- ✅ Warning indicator when end date has passed
- ✅ Works with DateTime and Timestamp field types
- ✅ Optional minimum date constraint
- ✅ Clean, intuitive UI matching Directus design system
- ✅ Easy API filtering using Directus query filters

## API Filtering Examples

### Get all active posts (not expired):

```javascript
filter: {
  _or: [
    { display_end_date: { _null: true } },
    { display_end_date: { _gte: '$NOW' } }
  ]
}
```

### Get only expired posts:

```javascript
filter: {
  display_end_date: { _lt: '$NOW' }
}
```

### Get posts expiring within 7 days:

```javascript
filter: {
  _and: [
    { display_end_date: { _gte: '$NOW' } },
    { display_end_date: { _lte: '$NOW(+7d)' } }
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch for changes (if using directus-extension CLI)
npm run build -- --watch
```

## Requirements

- Directus 10.1.0+ or 11.0.0+
- Node.js 18+

## License

MIT
