# Phase 2 — SP2020 population and pending administrative geometry

Work remains on `feature/geospatial-integration`, preserving `d888569` and the original bilingual design. **The supplied real three-region geometry and SP2020 population comparison are integrated for feature-branch review. Geometry/UI validation passes; upstream snapshot and original attribution verification remain incomplete.**

## Population source, definitions, and verification

Primary source: **Badan Pusat Statistik (BPS), Sensus Penduduk 2020 (SP2020)**.
https://sensus.bps.go.id/topik/tabular/sp2020/1/15/0

| Census reporting area | September 2020 population (persons) |
| --- | ---: |
| Kota Yogyakarta | 373,589 |
| Kabupaten Sleman | 1,125,804 |
| Kabupaten Bantul | 985,770 |

The user supplied these exact values as verified by an independent research review. That review is the acquisition/verification path used here. On 2026-11-02 the supplied BPS URL returned proxy CONNECT 403 in this environment; no downloaded primary table is claimed. The review transcription is retained in `docs/source-evidence/bps-sp2020-independent-review.json`. It explicitly identifies itself as user-supplied review evidence, not an HTML/PDF/CSV captured from BPS.

All three observations use the same source URL, SP2020 census-count series, year, month, and unit. Reference precision is **September 2020 (`2020-09`)**; no reference day was supplied, so none was invented. `recordedAt` records receipt of the review, not retrieval of the primary source. These are historical counts, not current estimates or civil-registration totals. BPS reporting geographies are not yet spatially reconciled with geoBoundaries. Density, zonal statistics, and environmental indicators remain unavailable.

The chart uses the two selected real observations, locale-aware number formatting, a zero baseline, and a common scale whose maximum is the largest selected count. The table shows the same values and reference period. Original source links and the verification limitation appear beside the chart. BPS attribution is retained. Detailed BPS redistribution/reuse terms were not supplied or retrieved; **no blanket Creative Commons or commercial-use license is asserted for the BPS material**. The boundary license must never be assigned to the statistics. An original table export and the applicable BPS reuse notice can be uploaded later to strengthen the evidence record.

## Uploaded boundary geometry: actual validation

Original user-uploaded file: `docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson` (**25,850 bytes**).

SHA256: `ba842977bb78f645c1d05a05132a90a0fbfd9a258ba652c6560a89ffd36ff12c`.

The original bytes are retained verbatim. The application adds stable IUI feature IDs, display names and `sourceShapeId`; original properties and all coordinate values remain unchanged. No repair, reprojection, simplification, or rounding was applied.

| Uploaded administrative name | Original shape ID | Geometry | Vertices including closure |
| --- | --- | --- | ---: |
| Kota Yogyakarta | `22746128B9761158776103` | Polygon | 77 |
| Sleman | `22746128B68764842139539` | Polygon | 263 |
| Bantul | `22746128B15956982783625` | Polygon | 316 |

Every feature declares `shapeGroup=IDN` and `shapeType=ADM2`; all shape IDs carry the `22746128` prefix. This verifies **internal consistency with the supplied boundary ID `IDN-ADM2-22746128`**. Those self-declared identifiers do not independently establish that the coordinates are identical to a particular upstream download. The upload contains no original API metadata, geometry repository commit, source retrieval date, citation or license notice. Those fields remain unavailable. A separate official metadata-index row has now been retrieved and retained; it confirms the dataset identity/year/license and credits BPS–Statistics Indonesia, World Food Programme and OCHA ROAP. See [the provenance review](geoboundaries-provenance.md).

The file has no explicit `crs` member. Under RFC 7946 it is interpreted as WGS84 longitude/latitude (OGC:CRS84). Finite 2D coordinates, plausible Yogyakarta extents, axis order, ring closure and exterior/hole winding were checked. Collection extent is approximately 110.204–110.547° E, 8.028–7.542° S. This confirms consistency with that interpretation; it is not independent proof of the source's original CRS. Projected or ambiguous declared CRS inputs are rejected.

Shapely **2.1.2** checked the actual file: all polygons are valid, nonempty, have positive planar area, and contain the app's corresponding reference marker. Every pair has zero interior-overlap area and shared boundary segments. Their union is a valid Polygon. Planar degree-based checks are used only for topology; **no square-kilometre area or population density is derived**. Full machine-readable results and actual interior points used by browser tests are retained in `docs/source-evidence/uploaded/validation-report.json`.

## Source, version, attribution and commercial reuse

Original claimed dataset source: **geoBoundaries gbOpen, Indonesia / IDN ADM2**.
https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/

Version identity supplied by the user: **`IDN-ADM2-22746128`**. The independently retrieved official metadata-index row now confirms `boundaryYearRepresented=2020` and **CC BY 3.0 IGO**:
https://creativecommons.org/licenses/by/3.0/igo/

The map displays that dataset ID/year and a license link, and credits geoBoundaries gbOpen and the supplied extract. It preserves the distinction between an uploaded subset with validated identifiers/topology and reviewed original source files. The upload's source commit, primary-source retrieval date, and hashes of nonexistent metadata/citation/license files are explicitly `null`. The date `2026-11-02` is receipt of the upload, not upstream retrieval.

CC BY 3.0 IGO permits commercial reuse subject to its actual terms, including applicable original creator/source credit, license reference, retained notices and change/adaptation statements; no endorsement is implied. **The exact original attribution notices and third-party exclusions were not supplied**, so full commercial-publication review is pending. The repository-level CC BY 4.0 license must not be substituted for the Indonesia dataset's reported CC BY 3.0 IGO. No GADM or FAO GAUL data are used.

Current development-map credit explicitly identifies geoBoundaries gbOpen, the dataset ID, user-supplied subset, reported year/license, and pending original attribution. It is a transparent interim credit, **not a claim that all original license obligations have been established**. The UI shows this source-review limitation in both languages. Public-release validation deliberately rejects the pending state; nothing is merged or deployed.

To complete provenance, supply the **original API response for `IDN-ADM2-22746128`**, the same snapshot's **`CITATION-AND-USE-geoBoundaries.txt` and source notices**, applicable **CC BY 3.0 IGO legal text**, and a **traceable download/export record** (original geometry URL/revision and hashes, or original upstream geometry for an exact subset comparison). The three-region file is already retained and does not need to be uploaded again. No inaccessible source was repeatedly requested during this integration.

## Reproduce the actual-file checks

Node 24+ runs the app and structural validation. Python with pinned Shapely is required for topology checks:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries:upload
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:validate
npm run typecheck
npm run build
npm test
```

`data:boundaries:upload` imports only the exact retained/upload-hashed three-region file. It reruns topology checks and records the supplied-file provenance and validation report before updating the map asset. `data:validate` checks source/evidence hashes, deep equality of the normalized original geometry/properties with the served collection, identity/CRS/rings, and a freshly recomputed Shapely report. It separately verifies the unchanged SP2020 counts against their review record.

```sh
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:validate:release
```

The release command was run and **exits nonzero as expected**, because original upstream attribution/snapshot verification remains pending. This is separate from the passing development geometry/data validator and browser tests. `status: ready` means renderable development data; `publicationStatus: pending-upstream-attribution` must not be interpreted as a completed source/publication review.

The earlier `data:boundaries` importer for complete reviewed-original bundles remains available. Its `reviewed-originals` provenance mode still requires the original metadata, citation/license notices, receipt and source identity; supplied-subset mode does not manufacture those documents or weaken that path.

## Actual-file browser validation

All **16 tests pass**, including the preserved bilingual navigation, population values, mobile layout, malformed-data rejection and synthetic edge-case tests. Four additional tests use the actual retained/served uploaded file:

- Assert the accepted SHA256, exact original names/shape IDs, coordinate/property preservation, and retained topology report.
- Reject renamed regions, EPSG:3857 declarations, altered dataset IDs and out-of-envelope coordinates.
- Fetch the real production boundary asset without intercepting/substituting it. Use interior points derived from those real polygons to hover/highlight, click/select and fit **all three regions**; compare canvas renders, check selected extents, switch tooltip language and toggle boundaries. Check the CC BY 3.0 IGO link and source-review message.
- Exercise the real polygons on mobile, expanded-map/Escape behavior and unchanged SP2020 comparison.

The reviewed screenshot `test-results/real-boundary-map.png` shows the actual three-region geometry rendered by MapLibre. External basemap requests were intentionally blocked during those tests, demonstrating that the bundled polygons do not depend on live map tiles. No synthetic geometry replaced the production asset in these real-file tests.

## Future layers and current limitations

NDVI/LST definitions remain planned and disabled. Future scenes need acquisition dates, original licenses, cloud/QA masking, units, scale/offset, no-data convention and reproducible processing. NDVI is unitless; LST must use explicit temperature units and is not air temperature. Rendered colors are never scientific observations.

The current validator reports **three supplied polygons and three population observations**. Remaining limitations: upstream snapshot equality and full original attribution/license-notice review, independent original CRS confirmation, BPS primary-page/reuse evidence, census-to-boundary geographic reconciliation, and live basemap availability. NDVI/LST, density and other derived statistics remain unavailable. Keep the work on the feature branch; no main merge or public release is authorized by these development checks.

## Deployment preparation

The API remains inaccessible, but the official repository CSV provides exact-ID primary metadata. Full source notices and upstream geometry comparison are pending. A separate boundary-free private-preview build and audited ZIP are prepared for an isolated Hostinger PHP/HTML website. See [Hostinger instructions](deployment-hostinger.md). No public deployment is authorized or performed.
