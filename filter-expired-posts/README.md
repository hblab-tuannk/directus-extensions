# Filter Expired Posts Hook

A Directus API hook extension that automatically filters out expired posts from API queries based on the display end date field.

## Why It's Useful

When managing time-sensitive content, you need to automatically hide expired content from API responses. This hook extension:
- Automatically filters expired posts based on `display_end_date` field
- Works seamlessly with the Display End Date Interface extension
- Changes status of expired published items to draft
- Prevents expired content from appearing in frontend applications
- No need to manually add filters to every API query

## Installation

1. Navigate to the extension directory:
   ```bash
   cd filter-expired-posts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Copy the extension to Directus:
   - Copy the `dist` folder and `package.json` to:
   - `extensions/hooks/filter-expired-posts/`
   
   Structure:
   ```
   extensions/
     hooks/
       filter-expired-posts/
         dist/
           index.js
         package.json
   ```

5. Restart your Directus instance

## How It Works

The hook intercepts `items.read` operations and:
1. Detects if the collection has a `display_end_date` field (or similar field name containing "display", "end", "date")
2. Checks if items have an end date in the past
3. For published items with expired end dates, changes their status to `draft`
4. Returns filtered results

## Field Detection

The hook automatically detects the display end date field by looking for field names that contain:
- "display"
- "end" 
- "date"

Examples of detected field names:
- `display_end_date` ✅
- `displayEndDate` ✅
- `end_display_date` ✅
- `post_expiry_date` ❌ (doesn't contain "display")

## Usage

Once installed, the hook works automatically. No configuration needed!

### Example

If you have a `posts` collection with:
- Field: `display_end_date` (DateTime)
- Item with `display_end_date` = `2024-01-01` (past date)
- Item status: `published`

When querying via API:
```javascript
GET /items/posts
```

The expired post will automatically have its status changed to `draft` in the response, effectively hiding it from published content.

## Requirements

- Directus 10.1.0+ or 11.0.0+
- Node.js 18+
- A collection with a display end date field (use the Display End Date Interface extension)

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch for changes
npm run build -- --watch
```

## Notes

- The hook only affects items with `status: 'published'`
- Items without a display end date are not affected
- The hook logs actions for debugging (check Directus logs)
- Works with both single item and collection queries

## License

MIT

