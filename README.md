# Listado referencial FarmaJovi

Static GitHub Pages catalog. No build step or dependencies are needed to serve it.

## Data and presentation

- `catalog-data.js` contains the 529 original products from the register dated **19-02-2026**. All original keys and values are preserved.
- `index.html`, `listado.css` and `listado.js` provide the responsive view, matching the official FarmaJovi palette and logo.
- Searching supports multiple words and accent-insensitive matching across the original searchable fields. Stock/bioequivalence filters describe only historical records.
- Card and table views share the same search, filters and pagination. Each product opens a full keyboard-accessible record dialog and a product-specific WhatsApp link.
- Prices are formatted in CLP. The original unit-price formula is retained and explained in the record; it does not compare treatments or validate unit equivalence.
- Historical data and the project's paused status remain clearly labelled. This is not an order or payment interface, and does not claim current availability or medical advice.
- The existing PDF documents and verification file remain untouched.

## Verification

`node scripts/visual-qa.cjs` starts a loopback preview and an isolated headless Edge browser with the Codex bundled Playwright package. It compares the complete data against the original Git commit, tests searches, quick buttons, filters, sorting, paging, full records and table/card views, and checks eight viewport widths from 320 to 1440 pixels. Screenshots are stored in ignored `outputs/`. For a new clone, retrieve baseline commit `954875bc36ac056db9d8653cb9e0c46bb69178bc` before running the integrity test if it is not in local history.

Deploy by updating the default branch of `farmaciafarmajovi-max/LISTADO-PRECIOS-FARMAJOVI`. Keep the dated register unchanged unless a new, explicitly approved source is supplied.
