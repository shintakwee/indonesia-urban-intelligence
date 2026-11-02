# Indonesia Urban Intelligence (IUI)

A working bilingual React + TypeScript + Vite application for exploring Indonesia's urban regions. The first study area is Kota Yogyakarta, Sleman, and Bantul.

## Phase 2 status

Work continues on `feature/geospatial-integration` from `db62c97`. Polygon interactions, validated data contracts, and a gated population-chart component are implemented, but **real boundary and BPS population integration is blocked by source access**. The shipped data remains empty and explicitly labeled. See [English provenance and methodology](docs/phase-2.en.md) or [Dokumentasi Bahasa Indonesia](docs/phase-2.id.md) for evidence, licensing limits, import commands, and remaining work. No GIS or population results are fabricated.

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
- Side-by-side region selectors and comparison table with explicit missing-data states.
- Indonesian and English translations across all pages, with persisted language preference.
- Data Sources, Methodology, About, and Collaboration pages.
- Accessible labels, keyboard controls, mobile navigation, and network/WebGL fallback messages.

## Data integrity and limitations

No statistical observations or administrative polygons are included. Reference coordinates in `src/data/catalog.ts` are approximate navigation aids, not verified administrative centroids. They cannot support area, population, or regional GIS calculations. The comparison displays no invented measurements, rankings, or differences.

OpenStreetMap provides the online basemap, with attribution and ODbL source link. Respect the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): no bulk downloading or offline prefetch. For a public service with substantial traffic, configure a suitable hosted or self-hosted tile provider before deployment. Tiles require access to `tile.openstreetmap.org`. Official source websites listed in the registry are candidates, not imported datasets. Outbound source and map domains were blocked in the development environment, so live source and tile delivery were not verified there. Offline map interaction was tested with requests intentionally blocked.

Collaboration links to this GitHub repository; no contact form or partnership service is implemented. The application has no analytics backend or spatial computation engine. Large MapLibre bundle warning is expected; the map is lazy-loaded separately from the main application.

## Integrating real data

- `src/data/catalog.ts`: study-area and source registry.
- `src/data/geospatial.ts`: boundary validation, extent calculation, and planned NDVI/LST contracts.
- `src/data/indicators.ts`: strict compatible-series population schema and validation.
- `public/data/boundaries.json`, `src/data/population.json`: explicitly blocked production data.
- `scripts/import-boundaries.mjs`: pinned, checksum-protected boundary acquisition (blocked before data retrieval in this environment).
- `src/components/PopulationChart.tsx`: real-observation chart component, currently showing the explicit unavailable state.
- `src/i18n.ts`: complete locale dictionaries.
- `src/MapView.tsx`: map sources, layers, selection, network fallback.
- `src/App.tsx`: navigation and page rendering; comparison currently uses explicit unavailable states.

Before adding observations, follow the Phase 2 provenance checklist and verify primary publications and record source title and URL, retrieval date, reference year, units, methodology, and geography version. Implement an import adapter with validation and connect verified observations to the comparison view. Do not replace missing values with zero. Introduce official boundary GeoJSON only after validating provenance, CRS (WGS84 for display), boundary version, and reuse rights. Derive indicators only from compatible geographies, time periods, and definitions. Keep translations in sync.

## Browser tests

```sh
# Install the browser on systems without Chromium:
npx playwright install chromium
# Set this to your installed Chromium executable:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome npm test
```

The cloud environment uses `/usr/bin/chromium` by default. Tests exercise bilingual navigation and persistence, comparison selection, reference markers and layer controls, blocked-tile fallback, and mobile navigation/overflow against the production build. Run `npm run build` before `npm test`. Browser-test artifacts are ignored. Additional GIS tests use synthetic geometry exclusively through request interception; it is not part of the production dataset and does not verify real administrative boundaries. No population values or statistical mocks are included.

Explicit checks: `npm run typecheck`, `npm run data:validate`, `npm run build`, and `npm test`. The boundary importer is expected to fail while source access remains blocked.
