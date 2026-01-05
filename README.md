# Directus Slug Generator Interface

A custom Directus interface extension that automatically generates URL-friendly slugs from text input. This interface provides a convenient way to create SEO-friendly URL slugs with options for customization, including separator choice (hyphen or underscore) and automatic lowercase conversion.

## Why It's Useful

When managing content in Directus, creating URL-friendly slugs from titles or names is a common task. Manually creating slugs can be time-consuming and error-prone. This extension solves this problem by:
- Providing an intuitive interface for slug input with automatic formatting
- Offering customization options (separator, lowercase conversion)
- Auto-formatting user input on blur to ensure valid slug format
- One-click format button to convert any text to a proper slug
- Saving time and reducing errors in content management workflows

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
   - For local development: `extensions/interfaces/slug-generator/`
   - The folder structure should be: `extensions/interfaces/slug-generator/dist/index.js`
5. Restart your Directus instance
6. The "Slug Generator" interface will be available in the interface options when editing fields

## Usage

1. **Create or edit a field** in your Directus collection
2. **Set the field type** to "String"
3. **Select "Slug Generator"** as the Interface
4. **Configure options**:
   - **Separator**: Choose between hyphen (-) or underscore (_)
   - **Lowercase**: Toggle to automatically convert to lowercase (enabled by default)
5. **Use in your collection**:
   - Type text directly into the field
   - The slug will automatically format on blur (when you click away)
   - Or click the "Format" button to manually convert the current text to a slug

## Features

- ✅ Automatic slug formatting on blur
- ✅ Manual format button for instant conversion
- ✅ Configurable separator (hyphen/underscore)
- ✅ Optional lowercase conversion
- ✅ Removes special characters automatically
- ✅ Clean, intuitive UI matching Directus design system

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

