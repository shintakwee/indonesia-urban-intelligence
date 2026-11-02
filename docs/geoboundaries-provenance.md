# geoBoundaries provenance review — IDN-ADM2-22746128

## Verified primary evidence

The official API entry `https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/` returned proxy CONNECT 403 on 2026-11-02. The failed request is retained as an **access observation**, not an API response or proof of dataset content.

A separate official source was successfully retrieved: the geoBoundaries repository's complete metadata index, pinned to commit `8ce2700661a28ee944350e2b329bbabb58d2ff83`:

https://raw.githubusercontent.com/wmgeolab/geoBoundaries/8ce2700661a28ee944350e2b329bbabb58d2ff83/releaseData/geoBoundariesOpen-meta.csv

Retained file: `docs/source-evidence/geoboundaries-metadata-index/geoBoundariesOpen-meta.csv`.

SHA256: `d6f81bc9d3239f63fc36a62c6e3774ae892cedd5c653b8873fe1148311929eea`.

Exactly one CSV row has `boundaryID=IDN-ADM2-22746128`. Its unchanged field values are retained in `IDN-ADM2-22746128.json`, explicitly identified as a **derived row from the official CSV**, not a fabricated original API response. `scripts/check-metadata-index.py` verifies the file hash and exact CSV-to-JSON agreement.

| Field | Exact source value |
| --- | --- |
| boundaryID | IDN-ADM2-22746128 |
| boundaryISO / boundaryType | IDN / ADM2 |
| boundaryCanonical | regency, city |
| boundaryYearRepresented | 2020 |
| boundaryLicense | Creative Commons Attribution 3.0 Intergovernmental Organisations (CC BY 3.0 IGO) |
| boundarySource | Badan Pusat Statistik (BPS - Statistics Indonesia), World Food Programme, OCHA ROAP |
| sourceDataUpdateDate | Thu Jan 19 07:31:04 2023 |
| buildDate | Dec 12, 2023 |
| admUnitCount | 519 |

The index snapshot commit identifies the **metadata index**; it is not assumed to be the geometry's source commit. The row's published archive link uses the shortened geometry revision `4004e96`:

https://github.com/wmgeolab/geoBoundaries/raw/4004e96/releaseData/gbOpen/IDN/ADM2/geoBoundaries-IDN-ADM2-all.zip

The row identifies this original source/license page:

https://data.humdata.org/dataset/indonesia-administrative-boundary-polygons-lines-and-places-levels-0-4b

No content from that page or archive is claimed as downloaded in this review. The represented year, build date and source update date are different concepts and must not be interchanged.

## License status and attribution

**Confirmed:** the official metadata index assigns this exact dataset **CC BY 3.0 IGO**, not the repository's generic CC BY 4.0 license. The application now credits the actual original source names from that row.

**Not cleared:** the complete original citation/source notices, possible third-party exclusions, exact source legal text, full geometry revision and uploaded-coordinate equality have not been inspected. The presence of a license field alone does not finish redistribution review. No GADM or FAO GAUL boundary data is used.

CC BY 3.0 IGO generally permits commercial sharing/adaptation subject to its applicable attribution, license-reference, retained-notice and modification terms. A use must not imply endorsement. The exact original notices must be preserved, and any third-party exceptions must be reviewed. Reference license URL: https://creativecommons.org/licenses/by/3.0/igo/ . The original legal text must be retained before marking a boundary release cleared.

Prepared **interim development attribution** (not a substitute for missing notices):

> Administrative boundaries: geoBoundaries gbOpen, Indonesia ADM2, dataset IDN-ADM2-22746128, represented year 2020. Original sources: Badan Pusat Statistik (BPS - Statistics Indonesia), World Food Programme, OCHA ROAP. CC BY 3.0 IGO. Three-region subset supplied by the user; original coordinates preserved, display IDs/names added. Original notices and exact upstream geometry comparison remain pending.

After complete review, append the upstream's required citation and retain every applicable source notice. Do not state that the index commit proves the geometry snapshot. BPS SP2020 statistical counts have their own cited source and supplied-review evidence; no boundary license is assigned to those statistics.

## Remaining manual source bundle

1. **`CITATION-AND-USE-geoBoundaries.txt`** from the `IDN-ADM2-22746128` geometry snapshot, including any citation mandated by the archive.
2. **Original HDX source/license notices** for the source page linked above, including attribution, reuse terms, file/resource metadata and any exclusions. Save the original page/export and any linked notice files; do not write a new summary in place of the originals.
3. **`CC-BY-3.0-IGO-legalcode.html`**, the applicable complete legal text, with its source URL and retrieval date.
4. **Matching upstream geometry/archive** from the metadata row's archive link, or a verifiable export record that enables an exact comparison with the retained three-region subset. Preserve original shape IDs. An original API JSON with matching dataset ID/download URLs is helpful, but the official index already verifies the metadata fields above; a response for a different current dataset must not be relabeled.
5. **`source-receipt.json`** with actual retrieval dates, original URLs, SHA256 hashes, resolved full geometry commit and extraction/transform steps. Unknown values must remain unknown. Record the results of the source-notice and commercial-reuse review only once performed.

The uploaded subset and official CSV do not need to be supplied again. The remaining documents must link to this exact dataset/snapshot; a different release's notices do not complete the chain.

## Release decision and preview

The feature-branch development build retains its three polygons with `publicationStatus: pending-upstream-attribution`. The release data check remains blocked. No merge, public upload or deployment has been performed.

Because complete provenance is unavailable, the Hostinger package uses a separate **private-preview** profile. It physically excludes `public/` and emits only a null boundary placeholder. The package audit verifies no original geometry, source evidence, source maps or boundary-coordinate fingerprints are distributed. Bilingual navigation, approximate reference points and SP2020 comparisons remain available.

The package defaults to `Require all denied`. It is not a working authenticated Hostinger site until the owner configures and tests site-specific password protection after deployment approval. `noindex` is supplementary and is not access control.

## Ringkasan Bahasa Indonesia

Indeks metadata resmi geoBoundaries berhasil diambil dan memuat tepat satu baris `IDN-ADM2-22746128`. Bukti primer tersebut mengonfirmasi tahun representasi 2020, **CC BY 3.0 IGO**, dan kredit sumber **Badan Pusat Statistik (BPS - Statistics Indonesia), World Food Programme, OCHA ROAP**. Berkas CSV asli, hash, dan baris turunannya disimpan; berkas turunan tidak diberi label sebagai tanggapan API asli.

Tinjauan izin rilis belum selesai: kutipan/pemberitahuan asli dari snapshot yang sama, ketentuan sumber HDX, teks hukum lisensi, serta perbandingan geometri unggahan dengan sumber masih diperlukan. Commit indeks metadata tidak membuktikan commit geometri. Paket Hostinger memakai profil pratinjau privat yang **tidak menyertakan poligon administrasi**, dengan akses ditolak secara bawaan sampai autentikasi situs baru dikonfigurasi. Tidak ada penggabungan ke main atau penerapan publik.
