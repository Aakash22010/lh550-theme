# LAVNA LH500 - Hotel Smart Lock page

Shopify sections for the LH500 hotel smart lock page, built from the Figma frames "Hotel door lh500 web"
(desktop) and "Hotel door 500 mob" (mobile). Horizon 4.3.0 is the base theme.

This one is a page, not the home page. It goes on the lh510 store next to the LH510 home page:
`templates/page.lh500.json` with layout `lh500`. In the admin, create a page and pick the `page.lh500` template.

## Files

- `sections/lh500-*.liquid` - the page sections (header, hero, access, extensions, energy, software, applications,
  pricing, encoder, rfid, dimensions, products, why, footer)
- `snippets/lh500-*.liquid` - assets loader, buy button, image and star rating helpers
- `assets/lh500-*` - css, js and images
- `layout/lh500.liquid` - page layout without the theme header/footer
- `templates/page.lh500.json` - the page

## Products

The buttons use these product handles:

- `lh500-hotel-smart-lock` - hero and pricing table
- `lh400-hotel-smart-lock`, `lh510-hotel-smart-lock`, `lh550-hotel-smart-lock` - pricing table and the Products menu
- `energy-saver-lite`, `energy-saver-pro` - energy saver prices

## Upload

Push only the LH500 files. Everything else in the store's theme belongs to the LH510 page, and a full push
would delete it.

```bash
shopify theme push --store lh510.myshopify.com --theme <theme id> --path . \
  --only "assets/lh500*" --only "sections/lh500-*" --only "snippets/lh500-*" \
  --only layout/lh500.liquid --only templates/page.lh500.json
```
