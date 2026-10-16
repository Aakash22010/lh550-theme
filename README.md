# LAVNA LH550 - Hotel Smart Lock page

Shopify sections for the LH550 hotel smart lock landing page, built from the Figma design
"hotel page for dev" (desktop + mobile).

Store: webdesign-pkoydjgt.myshopify.com (Horizon base theme). Only the LH550 files and stock Horizon are in this theme.

## Files

- `sections/lh550-*.liquid` - one section per page block (header, hero, access, extensions, energy, software, applications, pricing, encoder, energy-pricing, rfid, dimensions, products, why, footer)
- `snippets/lh550-assets.liquid` - loads fonts, `lh550-base.css` and `lh550.js`; rendered at the top of every section
- `snippets/lh550-buy-button.liquid` - Buy now / Add to cart button linked to a product
- `snippets/lh550-image.liquid`, `snippets/lh550-stars.liquid` - image and rating helpers
- `assets/lh550-*` - section CSS, JS and images
- `layout/lh550.liquid` - standalone layout for the page
- `templates/page.lh550.json` - the LH550 page template (`/pages/<handle>` with the lh550 template)
- `preview-lh550.html` - local standalone preview of the full page

## Local Preview

Run the standalone preview server:
```bash
python tools/serve.py 8080
```
Then open `http://localhost:8080/preview-lh550.html`.

Or run Shopify CLI theme dev:
```bash
shopify theme dev --store https://webdesign-pkoydjgt.myshopify.com/
```
