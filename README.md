# LAVNA LH510 - Hotel Smart Lock page

Shopify sections for the LH510 hotel smart lock landing page, built from the Figma design
"Hotel door lh510" (Lavna Locks UI, desktop + mobile). Horizon is the base theme; the LH510 page is the
home page (`templates/index.json`, layout `lh510`).

## Files

- `sections/lh510-*.liquid` - one section per page block: header, hero, access, extensions, energy, software,
  applications, pricing (also used for the energy saver prices), encoder, rfid, dimensions, products, why, footer
- `snippets/lh510-assets.liquid` - loads the fonts, `lh510-base.css` and `lh510.js`; rendered at the top of every section
- `snippets/lh510-buy-button.liquid` - Buy now / Add to cart button for a product
- `snippets/lh510-image.liquid`, `snippets/lh510-stars.liquid` - image and rating helpers
- `assets/lh510-*` - section CSS, JS and images
- `layout/lh510.liquid` - layout for the page
- `sections/header-group.json`, `sections/footer-group.json` - the LH510 header and footer on every page

## Products

The buttons buy or add these products (by handle), so create them on the store or pick others in the theme editor:

- `lh510-hotel-smart-lock` - hero and pricing table
- `lh400-hotel-smart-lock`, `lh500-hotel-smart-lock`, `lh550-hotel-smart-lock` - pricing table and the Products menu
- `energy-saver-lite`, `energy-saver-pro` - energy saver prices

## Upload

```bash
shopify theme push --store <store>.myshopify.com --path . --unpublished
```
