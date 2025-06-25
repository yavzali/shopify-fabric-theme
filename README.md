# Shopify Fabric Theme

This is a custom Shopify theme based on the Fabric theme, set up for local development.

## Setup

1. **Prerequisites**
   - [Shopify CLI](https://shopify.dev/themes/tools/cli) installed
   - Node.js and npm (for any custom build processes)

2. **Development**
   ```bash
   # Start development server with live reload
   shopify theme dev
   
   # Push changes to your store
   shopify theme push
   
   # Pull latest changes from store
   shopify theme pull
   ```

3. **Theme Structure**
   - `assets/` - CSS, JavaScript, images, and other static files
   - `config/` - Theme settings and configuration
   - `layout/` - Theme layout files (theme.liquid, etc.)
   - `locales/` - Translation files for internationalization
   - `sections/` - Reusable theme sections
   - `snippets/` - Small reusable code snippets
   - `templates/` - Page templates (product, collection, etc.)
   - `blocks/` - App blocks and extensions

## Important Notes

⚠️ **This theme is connected to a live store** - Be careful when pushing changes as they will affect the live site.

## Development Workflow

1. Make changes locally
2. Test with `shopify theme dev`
3. Commit changes to Git
4. Push to GitHub for backup
5. Deploy to live store with `shopify theme push`

## Store Information

- **Theme**: Fabric (#178667716978)
- **Store**: dmrggj-28.myshopify.com 