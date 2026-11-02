# Indonesia Urban Intelligence (IUI)

A working bilingual React + TypeScript + Vite application for exploring Indonesia's urban regions. The first study area is Kota Yogyakarta, Sleman, and Bantul.

## Phase 2 status

`feature/geospatial-integration` now displays the independently reviewed BPS SP2020 September 2020 counts supplied by the user: Kota Yogyakarta **373,589**, Sleman **1,125,804**, Bantul **985,770** persons. The chart and table cite the [primary BPS table](https://sensus.bps.go.id/topik/tabular/sp2020/1/15/0) and explicitly record the supplied review as the verification path; the page remains network-blocked here.

**Real boundary integration remains incomplete.** The supplied Indonesia ADM2 metadata review reports **2020 / CC BY 3.0 IGO**, not CC BY 4.0. No geometry has been supplied. The offline importer requires the matching original metadata, simplified GeoJSON, citation, license text, and reviewed source receipt. See [English provenance and exact upload checklist](docs/phase-2.en.md) or [Dokumentasi Bahasa Indonesia](docs/phase-2.id.md). No GADM/FAO GAUL data or fabricated statistics/polygons are included. BPS reuse terms remain separate and have not been retrieved.

## Run

Use Node.js 24+ (validated with Node 24.19.0). Native TypeScript execution is used by the data-import/validation scripts.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

Build output is in `dist/`. Deploy that directory to any static host. Hash-based page navigation requires no server rewrites. There are no required API keys or backend services.

## Implemented

- Original responsive homepage and study-area illustration, explicitly labeled conceptual.
- MapLibre GL JS map with OpenStreetMap raster basemap, three approximate reference markers, place selection, zoom, reset, expand, and layer visibility controls.
- Side-by-side selectors, real SP2020 population chart/table, and explicit missing-data states for other indicators.
- Indonesian and English translations across all pages, with persisted language preference.
- Data Sources, Methodology, About, and Collaboration pages.
- Accessible labels, keyboard controls, mobile navigation, and network/WebGL fallback messages.

## Data integrity and limitations

Three real SP2020 population observations are included via the supplied independent review. No administrative polygons are included. Reference coordinates in `src/data/catalog.ts` are approximate navigation aids, not verified administrative centroids. They cannot support area, population, or regional GIS calculations. The comparison displays no invented measurements, rankings, or differences.

OpenStreetMap provides the online basemap, with attribution and ODbL source link. Respect the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): no bulk downloading or offline prefetch. For a public service with substantial traffic, configure a suitable hosted or self-hosted tile provider before deployment. Tiles require access to `tile.openstreetmap.org`. Official source websites listed in the registry are candidates, not imported datasets. Outbound source and map domains were blocked in the development environment, so live source and tile delivery were not verified there. Offline map interaction was tested with requests intentionally blocked.

Collaboration links to this GitHub repository; no contact form or partnership service is implemented. The application has no analytics backend or spatial computation engine. Large MapLibre bundle warning is expected; the map is lazy-loaded separately from the main application.

## Integrating real data

- `src/data/catalog.ts`: study-area and source registry.
- `src/data/geospatial.ts`: boundary validation, extent calculation, and planned NDVI/LST contracts.
- `src/data/indicators.ts`: strict compatible-series population schema and validation.
- `public/data/boundaries.json`: explicitly blocked geometry; `src/data/population.json`: the supplied SP2020 observations and verification provenance.
- `scripts/import-boundaries.mjs`: offline-only import of original geoBoundaries files, checked against the reviewed receipt and dataset-specific CC BY 3.0 IGO identity.
- `src/components/PopulationChart.tsx`: real SP2020 comparison with localized values, source links, and verification/reuse limitations.
- `src/i18n.ts`: complete locale dictionaries.
- `src/MapView.tsx`: map sources, layers, selection, network fallback.
- `src/App.tsx`: existing navigation and page rendering; population comparison is active while density and environmental values remain unavailable.

For additional observations, follow the Phase 2 provenance checklist and retain publication/verification evidence, reference precision, units, definitions, and geography. The existing SP2020 review evidence is distinct from a directly downloaded primary-source snapshot. Do not replace missing values with zero. Introduce official boundary GeoJSON only after validating provenance, CRS (WGS84 for display), boundary version, and reuse rights. Derive indicators only from compatible geographies, time periods, and definitions. Keep translations in sync.

## Browser tests

```sh
# Install the browser on systems without Chromium:
npx playwright install chromium
# Set this to your installed Chromium executable:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome npm test
```

The cloud environment uses `/usr/bin/chromium` by default. Tests exercise bilingual navigation and persistence, comparison selection, reference markers and layer controls, blocked-tile fallback, and mobile navigation/overflow against the production build. Run `npm run build` before `npm test`. Browser-test artifacts are ignored. Additional GIS tests use synthetic geometry exclusively through request interception; it is not part of the production dataset and does not verify real administrative boundaries. Population tests use the supplied real SP2020 values, not mock counts.

Explicit checks: `npm run typecheck`, `npm run data:validate`, `npm run build`, and `npm test`. The boundary importer requires supplied originals; without them it exits with the exact file list and makes no network request.
