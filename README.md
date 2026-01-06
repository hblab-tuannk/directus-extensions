# Directus Extensions: Display End Date

This repository contains two complementary Directus extensions that work together to manage time-sensitive content: a **Display End Date Interface** that provides a date picker (time optional) for setting when content should expire, and a **Filter Expired Posts Hook** that automatically changes expired published items to draft and excludes them from responses.

## Why It's Useful

Managing time-sensitive content like blog posts, news articles, promotional campaigns, or event listings requires controlling when content should stop being displayed. Manually tracking expiration dates and updating item statuses is time-consuming and error-prone. These extensions solve this problem by providing a complete solution: the interface extension allows content creators to easily set expiration dates with visual feedback, while the hook extension automatically changes expired published items to draft in the database, so you can rely on the status field in your own queries and business logic.

## How to Install/Use It

### Installation

1. **Clone this repository:**
   ```bash
   git clone <repository-url>
   cd directus-extensions
   ```

2. **Install and build Display End Date Interface:**
   ```bash
   cd extensions/interfaces/display-end-date
   npm install
   npm run build
   ```

3. **Install and build Filter Expired Posts Hook:**
   ```bash
   cd ../hooks/filter-expired-posts
   npm install
   npm run build
   ```

4. **(Optional) bundle auto-load:** Place the provided extensions/package.json file into the extensions/ directory of your Directus project so Directus loads both the interface and the hook as a bundle.

5. **Restart Directus** (to ensure the extensions are loaded).

### How It Works: Step-by-Step Process

The hook extension follows a systematic process to automatically manage expired content:

#### Step 1: Install Extension
After building and restarting Directus, the hook extension is loaded and initialized with configuration from environment variables.

#### Step 2: Loop Through Environment Variables
The hook reads the `FILTER_EXPIRED_COLLECTIONS` environment variable:
- If set (e.g., `FILTER_EXPIRED_COLLECTIONS=posts,news,events`), only those collections are processed
- If empty or not set, all collections in your Directus instance are eligible for processing

#### Step 3: Find Out Collections
On startup, the hook:
- Retrieves the full schema from Directus
- Identifies all collections (or filters to the allow-list if configured)
- Checks each collection for the presence of the `display_end_date` field

#### Step 4: Migrate Schema
If `FILTER_EXPIRED_AUTOCREATE_FIELD=true` (default), the hook automatically:
- Creates the `display_end_date` field on all eligible collections that don't already have it
- Configures the field as:
  - **Type:** `date` (configurable via `FILTER_EXPIRED_FIELD_TYPE`)
  - **Interface:** `display-end-date` (configurable via `FILTER_EXPIRED_INTERFACE`)
  - **Required:** `false` (optional field)
  - **Nullable:** `true`

This migration runs:
- **On startup:** For all existing collections
- **On collection creation:** Automatically when new collections are created (via `collections.create` hook)

#### Step 5: New Input `display_end_date` = Date & Optional
Once migrated, each eligible collection now has:
- A new `display_end_date` field of type `date`
- The field is **optional** (not required), allowing content creators to:
  - Leave it empty for content that never expires
  - Set a date for time-sensitive content
- The field uses the custom "Display End Date" interface for an intuitive date picker experience

### Testing Guide

Follow these steps to test the extension functionality:

#### Step 1: Configure Environment Variables

**Option A: Using docker-compose.yml (Recommended for Docker)**

Edit `docker-compose.yml` and set the environment variables:

```yaml
environment:
  FILTER_EXPIRED_COLLECTIONS: "posts,news"  # Only process these collections (empty = all)
  FILTER_EXPIRED_AUTOCREATE_FIELD: "true"   # Auto-create display_end_date field
  FILTER_EXPIRED_DISPLAY_FIELD: "display_end_date"
  FILTER_EXPIRED_STATUS_FIELD: "status"
  FILTER_EXPIRED_STATUS_PUBLISHED: "published"
  FILTER_EXPIRED_STATUS_DRAFT: "draft"
```

**Option B: Using .env File**

1. Copy `.env.sample` to `.env`:
   ```bash
   cp .env.sample .env
   ```

2. Edit `.env` and configure:
   ```env
   FILTER_EXPIRED_COLLECTIONS=posts,news
   FILTER_EXPIRED_AUTOCREATE_FIELD=true
   ```

3. Update `docker-compose.yml` to use `.env`:
   ```yaml
   services:
     directus:
       env_file:
         - .env
   ```

#### Step 2: Start/Restart Directus

```bash
docker compose up -d
# or if already running:
docker compose restart directus
```

#### Step 3: Verify Extension is Loaded

Check logs to confirm initialization:

```bash
docker compose logs directus | Select-String -Pattern "Hook initialised"
```

Expected output:
```
[filter-expired-posts] Hook initialised with config: displayEndDateField="display_end_date", statusField="status"
```

#### Step 4: Test Environment Variable Configuration

**Test Case A: Process All Collections**

1. Set `FILTER_EXPIRED_COLLECTIONS=""` (empty)
2. Restart Directus
3. Check logs for startup migration:
   ```bash
   docker compose logs directus | Select-String -Pattern "Startup migration"
   ```
4. All collections should be processed

**Test Case B: Process Specific Collections Only**

1. Set `FILTER_EXPIRED_COLLECTIONS="posts,news"`
2. Restart Directus
3. Only `posts` and `news` collections will be processed

#### Step 5: Test Schema Migration

**Test Case A: Auto-create Field on Existing Collection**

1. Ensure `FILTER_EXPIRED_AUTOCREATE_FIELD=true`
2. Create a collection `posts` in Directus Admin Panel (Settings → Data Model)
3. Restart Directus
4. Check logs:
   ```bash
   docker compose logs directus | Select-String -Pattern "Startup migration.*posts"
   ```
5. Verify in UI:
   - Go to **Settings** → **Data Model** → `posts`
   - You should see `display_end_date` field automatically created
   - Field properties:
     - Type: `date`
     - Interface: `display-end-date`
     - Required: `false` (optional)
     - Nullable: `true`

**Test Case B: Auto-create Field on New Collection**

1. Ensure `FILTER_EXPIRED_AUTOCREATE_FIELD=true`
2. Create a new collection `events` in Directus Admin Panel
3. Check logs immediately:
   ```bash
   docker compose logs directus -f | Select-String -Pattern "events"
   ```
4. Verify `display_end_date` field was created automatically

#### Step 6: Test Field Properties

1. Go to **Content** → `posts` (or your test collection)
2. Create a new item
3. Verify:
   - `display_end_date` field appears
   - Field is **optional** (no red asterisk indicating required)
   - You can leave it empty
   - Date picker works correctly
   - Interface shows "Display End Date"

#### Step 7: Test Expired Items Status Change

**Test Case A: Item with Past Date**

1. Create a new item:
   - Set `status` = `published`
   - Set `display_end_date` = yesterday's date (e.g., 2024-01-01)
   - Save

2. View the item (triggers read request)

3. Check logs:
   ```bash
   docker compose logs directus | Select-String -Pattern "expired and was updated"
   ```

4. Verify in UI:
   - Refresh the item
   - `status` should now be `draft` (changed automatically)

**Test Case B: Item with Future Date**

1. Create a new item:
   - Set `status` = `published`
   - Set `display_end_date` = tomorrow's date
   - Save

2. View the item

3. Verify:
   - `status` remains `published` (not expired yet)

**Test Case C: Item without display_end_date**

1. Create a new item:
   - Set `status` = `published`
   - Leave `display_end_date` empty
   - Save

2. Verify:
   - Item remains `published`
   - No expiration check performed

#### Step 8: Test API Behavior

Query published items via API:

```bash
curl http://localhost:8055/items/posts?filter[status][_eq]=published
```

Expected:
- Only items with `status=published` AND `display_end_date` >= today are returned
- Expired items (status changed to draft) are excluded

### Usage

#### Step 1: Setup Display End Date Field

1. Open Directus Admin Panel
2. Go to **Settings** → **Data Model**
3. Select your collection (e.g., `posts`)
4. Click **Create Field**
5. Configure the field:
  Field Name: display_end_date
  Field Type: Date (recommended), or DateTime / Timestamp if you also need time
  Interface: Select "Display End Date"
  Options:
  Include Time: optional (default OFF, enable if you need hours/minutes)
  Save

#### Step 2: Use the Interface

1. When creating or editing items, use the **Display End Date** field
2. Click the date/time picker to select when content should expire
3. If you select a date in the past, a warning will appear
4. Leave empty if content should never expire

Step 3: Automatic status change & filtering
When the hook is loaded:
It automatically detects the display_end_date field
On any items read request (list/detail), published items with display_end_date earlier than today will have their status changed to draft in the database
The response payload will no longer contain expired items (because they’ve been moved to draft)
You can verify the hook is running via logs:
docker compose logs directus | Select-String -Pattern "filter-expired-posts"

### Example API Usage

The hook works automatically - no special query needed:

```javascript
// Simple query - expired posts are automatically filtered
const posts = await directus.request(
  readItems('posts', {
    filter: {
      status: { _eq: 'published' }
    }
  })
);
```

## Features & Screenshots

### Before & After Comparison

The following screenshots demonstrate how these extensions improve content management for time-sensitive posts:

#### Before: Without Extensions

![Before Extensions](./screenshots/before.png)
*Without the extensions, there's no way to set display end dates, and expired content continues to appear in API responses, requiring manual filtering in every query.*

**Problems:**
- No interface to set expiration dates
- Expired content still appears in API queries
- Manual filtering required in frontend code
- Risk of showing outdated content to users

#### After: With Extensions

![After Extensions](./screenshots/after.png)
*With both extensions installed, content creators can easily set display end dates using the intuitive date picker interface, and expired posts are automatically filtered out from API responses without any code changes.*

**Solutions:**
- ✅ **Display End Date Interface** provides an easy-to-use date/time picker
- ✅ Visual warning when expired dates are selected
- ✅ **Filter Expired Posts Hook** automatically filters expired content at API level
- ✅ No frontend code changes required
- ✅ Expired published items automatically change to draft status
- ✅ Prevents outdated content from appearing in applications

### Key Features Demonstrated

1. **Intuitive Date Picker**: The Display End Date interface makes it simple to set when content should expire
2. **Automatic Filtering**: The hook extension works behind the scenes to ensure expired content never reaches your frontend
3. **Visual Feedback**: Warning messages help content creators identify expired dates immediately
4. **Zero Configuration**: Once installed, the extensions work automatically without additional setup

## Requirements

- Directus 10.1.0+ or 11.0.0+
- Node.js 18+

## Extension Details

### Display End Date Interface
- **Type:** Interface Extension
- **Location:** `extensions/interfaces/display-end-date/`
- **Documentation:** [View Details](./extensions/interfaces/README.md)

### Filter Expired Posts Hook
- **Type:** API Hook Extension
- **Location:** `extensions/hooks/filter-expired-posts/`
- **Documentation:** [View Details](./extensions/hooks/filter-expired-posts/README.md)

## License

MIT
