# LAVNA LH400 - Hotel Smart Lock page

Shopify sections for the LH400 hotel smart lock page, built from the Figma frames "Hotel door lh400"
(desktop) and "Hotel door 400 mob" (mobile). Horizon 4.3.0 is the base theme.

Like LH500, this is a page on the lh510 store, next to the LH510 home page:
`templates/page.lh400.json` with layout `lh400`. In the admin, create a page and pick the `page.lh400` template.

## Files

- `sections/lh400-*.liquid` - the page sections (header, hero, access, extensions, energy, software, applications,
  pricing, encoder, rfid, dimensions, products, why, footer)
- `snippets/lh400-*.liquid` - assets loader, buy button, image and star rating helpers
- `assets/lh400-*` - css, js and images
- `layout/lh400.liquid` - page layout without the theme header/footer
- `templates/page.lh400.json` - the page

## Products

The buttons use these product handles:

- `lh400-hotel-smart-lock` - hero and pricing table
- `lh500-hotel-smart-lock`, `lh510-hotel-smart-lock`, `lh550-hotel-smart-lock` - pricing table and the Products menu
- `energy-saver-lite`, `energy-saver-pro` - energy saver prices

## Upload

Push only the LH400 files. Everything else in the store's theme belongs to the other pages, and a full push
would delete it.

```bash
shopify theme push --store lh510.myshopify.com --theme <theme id> --path . \
  --only "assets/lh400*" --only "sections/lh400-*" --only "snippets/lh400-*" \
  --only layout/lh400.liquid --only templates/page.lh400.json
```
