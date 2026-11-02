# Phase 2 — geospatial integration status

This branch extends commit `db62c97`; it preserves the bilingual homepage, navigation, region selectors, and responsive styling. **Real-data integration is incomplete.** No production administrative polygons or population observations are included.

## Source and license investigation (2026-11-02)

| Source | Evidence retrieved | Result |
| --- | --- | --- |
| BIG, `https://tanahair.indonesia.go.id` | Proxy connection result | HTTP CONNECT 403; no geometry, version, terms, or attribution could be inspected. No BIG data redistributed. |
| BPS, `https://yogyakarta.bps.go.id` | Proxy connection result | HTTP CONNECT 403; no population table or statistical definition could be inspected. No BPS values transcribed. |
| geoBoundaries official GitHub repository | Repository license and v6.0.0 Git LFS pointers | Source identity, release commit, expected object hashes and sizes established. Geometry and dataset-specific metadata/citation unavailable. |
| geoBoundaries media download | Standard pinned media URL | HTTP 403. The importer failed before replacing application data. |
| geoBoundaries Git LFS download | Standard Git LFS smudge | `Resource not accessible by integration`. No credential extraction or networking bypass attempted. |

A read-only Git operation resolved official release **v6.0.0** to `1289e40e366c7b320550be1ee0614a9472d572d4`. Target dataset: **gbOpen / IDN / ADM2** (district/city level). This is a selected release, **not a verified boundary reference year**. The reference year and dataset-specific boundary ID remain unknown until metadata is retrieved.

Official target directory:
https://github.com/wmgeolab/geoBoundaries/tree/1289e40e366c7b320550be1ee0614a9472d572d4/releaseData/gbOpen/IDN/ADM2

Expected LFS objects, as recorded in the official release's raw pointer files:

| Asset | Size (bytes) | Expected SHA256 |
| --- | --- | --- |
| Metadata JSON | 1,049 | `509074e115dcabd5f2a61e525e465af53075c0272f9e0375a031af82d4c78867` |
| Simplified GeoJSON | 9,691,803 | `02244eae72a37d304e68975ff0cabd507881dfa4390cdc7c6738d56ad4274234` |
| Citation and use text | 4,316 | `f6ea7572bea6036c4cdcacf8c0ca7bf09098d4e600d19546d7432533e9a290d5` |

The expected hashes identify objects; **they do not mean those objects were downloaded or verified**. Pointer snapshots are in `docs/source-evidence/`.

The inspected repository license, pinned at commit `8ce2700661a28ee944350e2b329bbabb58d2ff83`, is CC BY 4.0. It permits commercial reuse with appropriate attribution, a license link, indication of modifications, and no implied endorsement or additional restrictions. A copy is retained in `docs/source-evidence/geoboundaries-repository-LICENSE.txt` (SHA256 `c6e6f4f2cc8aa4fe74aa536570af16f0ffafd56c5878822043b4851fb858d1d1`). This repository-level evidence does **not** replace checking the dataset's metadata, original sources, and citation file. No commercial-use claim is made for uninspected BIG or BPS material.

## Implemented, but gated on verified data

- MapLibre GeoJSON source and polygon fill/outline layers, hover feature state and highlight, click selection, localized DOM tooltips, full Polygon/MultiPolygon extent fitting, and a boundary-visibility control.
- Existing reference markers and keyboard-accessible region buttons share the same selection path; full-extent reset and Escape to leave expanded mode are supported.
- Boundary assets load from the application's own origin, independently of OpenStreetMap availability. Invalid, missing, or provenance-free assets fail closed with a localized message. The shipped boundary toggle is disabled.
- Population schema requires three distinct regions, one common year/date/definition/unit/geography vintage, primary HTTPS BPS URLs, table citations, and evidence-file references. Counts must be positive integer persons; missing values never become zeros.
- A responsive, zero-baseline comparison bar-chart component and table bindings are implemented. They render actual values only when the validated series is ready. **No real chart has been rendered or validated against BPS data.**
- Planned NDVI/LST registry uses a discriminated contract. A ready raster requires tile URLs and processing provenance; planned entries cannot have tiles. Both controls remain disabled. No raster processing or analytical values are implemented.

## Reproducible boundary ingestion

Requires Node 24+, curl with trusted TLS/proxy configuration, and Python with the pinned Shapely dependency for topology validation:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries
npm run data:validate
npm run typecheck
npm run build
npm test
```

The importer uses standard HTTPS downloads with TLS verification and the inherited proxy. It pins the official commit and all three object hashes, rejects an unexpected license/geography, requires unique exact region-name matches, retains original shape IDs, checks rings and geographic extents, and uses Shapely to reject invalid topology or overlapping study polygons. It does not repair or invent geometry. The simplified upstream coordinates are retained unchanged. Original metadata and citation are retained with checksums; only then is the application dataset atomically replaced. Full legal/cartographic accuracy still requires independent review; automated topology checks cannot establish legal administrative limits.

The download step was executed and failed with HTTP 403; the successful-download, real metadata parsing, and real topology-validation paths are **unverified**. They must be run once access is available. Do not describe the importer as a completed data acquisition.

## Population ingestion requirements

`src/data/population.json` deliberately contains `status: blocked` and an empty list. Before changing it to ready:

1. Retrieve a primary BPS table or publication that covers all three regions with one reference year and one statistical series (e.g. one census release or one projection vintage). Record reference date, counting definition, original units, page/table number, source URL, retrieval date, and geographic vintage.
2. Preserve source evidence under `docs/source-evidence/` when reuse terms permit. Verify any unit conversion explicitly (thousands of persons are not persons). Resolve city/regency and administrative-code matches; do not join by ambiguous names alone.
3. Have the observations checked against those sources. The TypeScript schema checks compatibility, **not the truth of a manually entered count**. Never mix civil registry, census and projection series.
4. Populate the declared observation fields, run validation tests/build, inspect the real chart/table, and update bilingual source/status documentation. There is no verified BPS import adapter in this release.

## Future NDVI and land surface temperature

Keep imagery processing outside the browser. Record provider/scene ID, acquisition time, license, cloud and QA masking, geometry version, no-data values, scale/offset, processing time, algorithm, and units. NDVI is unitless with an expected range of −1 to 1; LST must explicitly convert the provider's scaled temperatures to °C. Do not confuse LST with air temperature. Reproject display tiles to Web Mercator; retain analysis-ready georeferenced values separately for zonal statistics. Never derive scientific values from rendered tile colors. `RasterLayerDefinition` is the integration contract; no synthetic scenes or raster results are included.

## Validation and remaining work

The production build, explicit TypeScript check, and data-status validator pass. Eight Playwright tests cover prior bilingual/mobile behavior, missing-data UI, schema rejection, and MapLibre interactions. **GIS interaction tests intercept the boundary request with explicitly synthetic rectangles in `tests/fixtures/boundaries.ts`; these are never shipped in the app.** They test UI wiring, not real administrative accuracy. No statistical test fixtures or production mock values are supplied.

Source access is the blocker for actual polygons and population results. Required public domains were saved in the environment configuration draft. Review/save those settings and publish the environment to activate them; a saved draft is not applied runtime access. Then rerun acquisition and verification. Other existing domains and the package-manager preset were preserved. No secrets are needed for the boundary download; any BPS API requirement must be established from the actual chosen endpoint, not assumed.
