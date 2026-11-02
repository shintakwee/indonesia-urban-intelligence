# Phase 2 — SP2020 population and pending administrative geometry

Work remains on `feature/geospatial-integration`, preserving `d888569` and the original bilingual design. **Population comparison is integrated; real administrative geometry is not yet integrated.**

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

## Boundary identity and licensing correction

The independently reviewed primary metadata endpoint is:
https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/

The review reports:

- Country/level: **IDN / ADM2**.
- `boundaryYearRepresented`: **2020**.
- `boundaryLicense`: **CC BY 3.0 IGO**.
- License: https://creativecommons.org/licenses/by/3.0/igo/

This is dataset-specific information. **Do not label this Indonesia dataset CC BY 4.0.** The previously inspected repository-level license and v6 Git LFS pointers do not establish this API dataset's identity or license. Historical snapshots remain in `docs/source-evidence/` for audit history; the current importer no longer uses their old hashes or assumes a v6 release. The user-supplied metadata-field review is separately recorded in `geoboundaries-idn-adm2-independent-review.json`; it is not represented as the original API response.

CC BY 3.0 IGO allows commercial reuse subject to its actual terms: appropriate source/creator credit, the license reference/link, retained source notices, and identification of changes/adaptations. It does not authorize implied endorsement or unrestricted use of an organization's identity/logo. Any third-party exclusions in the source metadata/citation also need review. The exact original source attribution cannot be reconstructed without the original metadata and citation, so **no geometry is redistributed yet**. No GADM or FAO GAUL boundaries are used.

The supplied metadata URL also returned proxy CONNECT 403 on the one attempt made in this continuation. No blocked download was retried and no alternative dataset was sought.

## Exact upload bundle required for polygons

Upload a ZIP containing the following **original files**, with a reviewed receipt. The simplified file is preferred to keep the upload manageable; it must come from the same API response/snapshot.

| Filename | Obtain from / requirements |
| --- | --- |
| `geoBoundaries-IDN-ADM2-api.json` | Save the complete, unedited JSON response from the metadata endpoint above. It must contain the dataset ID, ISO/level, represented year, license, original boundary sources and download links. A hand-written summary is not sufficient. |
| `geoBoundaries-IDN-ADM2_simplified.geojson` | Download the **exact file linked by `simplifiedGeometryGeoJSON` in that response**, preserving all Indonesia ADM2 features, properties, shape IDs, and WGS84 coordinates. Do not substitute another release or manually draw boundaries. |
| `CITATION-AND-USE-geoBoundaries.txt` | Obtain from the same geoBoundaries repository snapshot/dataset directory as that geometry. Retain all original credit and notices. |
| `CC-BY-3.0-IGO-legalcode.html` | Save the applicable full legal text from https://creativecommons.org/licenses/by/3.0/igo/legalcode . Include any additional dataset-specific notices referenced by the metadata/citation in the archive. |
| `source-receipt.json` | Record actual download URLs/time, SHA256 hashes, the externally verified full repository commit, exact attribution, and commercial-reuse/third-party-notice review as described below. |

The receipt is a review record, not an upstream signature. Compute hashes from the actual downloaded bytes. Do not fill any unknown field with an invented value. A metadata geometry URL may use a shortened commit; resolve it to the actual full commit using the official repository and record that resolution. The importer requires the full commit to match the original URL's revision prefix.

Receipt structure (replace every placeholder with verified information):

```json
{
  "metadataUrl": "https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/",
  "geometryUrl": "EXACT simplifiedGeometryGeoJSON URL from the original response",
  "sourceCommit": "EXTERNALLY VERIFIED FULL 40-CHARACTER COMMIT",
  "boundaryID": "EXACT boundaryID FROM THAT RESPONSE",
  "retrievedAt": "ACTUAL YYYY-MM-DD",
  "license": "CC-BY-3.0-IGO",
  "licenseUrl": "https://creativecommons.org/licenses/by/3.0/igo/",
  "attribution": "VERIFIED geoBoundaries AND ORIGINAL SOURCE CREDIT, including boundarySource verbatim",
  "reviewedForCommercialReuse": true,
  "thirdPartyNoticesReviewed": true,
  "sha256": {
    "metadata": "SHA256 OF API JSON",
    "geometry": "SHA256 OF GEOJSON",
    "citation": "SHA256 OF CITATION FILE",
    "license": "SHA256 OF LEGAL TEXT FILE"
  }
}
```

Set review flags to true **only after** the original notices and license have actually been checked. Do not edit source geometry to make validation pass. An unsupported license, mismatched year/identity, ambiguous region, malformed geometry, or conflicting notice must stop ingestion for review.

## Offline ingestion and validation

Once those files are supplied, extract them outside the checkout and retain the original archive for audit. Optional topology tooling is isolated in a virtual environment:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries -- /absolute/path/to/upload-directory
npm run typecheck
npm run data:validate
npm run build
npm test
```

`data:boundaries` is now **offline-only**: with no input directory it exits with the exact file list and makes no network request. It checks the original API's 2020 IDN ADM2 identity and CC BY 3.0 IGO, the metadata-linked official download revision, reviewed receipt hashes/attribution, source feature identity and count, unique regional matches, closed rings and expected geographic extents. Shapely must then verify nonempty valid topology and no overlapping study polygons. Geometry is subsetted without coordinate changes; original shape IDs are retained. Metadata, citation, license, receipt, and geometry audit are retained before the app's boundary asset is atomically replaced.

These checks establish structural/topological consistency and the supplied evidence chain; they do not constitute independent remote verification of uploaded files or legal/cartographic certification. Source hash receipt trust is explicitly the independent review's trust. The real-file ingestion and successful topology path remain **unexecuted** because no original geometry was supplied. After ingestion, inspect all three extents and update bilingual boundary status text before publishing. Matching year labels alone do not prove census/boundary geographic equivalence.

MapLibre hover highlight, click/keyboard selection, bilingual tooltip, full-extent fitting, visibility toggle, and license/attribution rendering are implemented. Their browser tests use clearly synthetic geometry only through request interception. **No synthetic polygon is shipped as a real administrative boundary.**

## Future layers and current limitations

NDVI/LST definitions remain planned and disabled. Future scenes need acquisition dates, original licenses, cloud/QA masking, units, scale/offset, no-data convention and reproducible processing. NDVI is unitless; LST must use explicit temperature units and is not air temperature. Rendered colors are never scientific observations.

Current checks cover the real supplied population counts, evidence/count agreement, month precision, inconsistent definitions/geographies, bilingual chart updates and accessible names, proportional bar lengths, source/license links, mobile overflow, original navigation, and synthetic GIS interactions. The validator reports **three population observations and zero real polygons**. Remaining work is the original boundary bundle, successful real geometry validation/visual review, census-to-boundary reconciliation, and primary BPS snapshot/reuse evidence. Do not merge into main without approval.
