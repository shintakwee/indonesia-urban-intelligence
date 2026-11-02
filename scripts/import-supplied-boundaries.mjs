/** Integrates the user's exact three-region upload for feature-branch development.
 * No upstream verification, source version, retrieval date or license notices are fabricated.
 * This mode cannot authorize public redistribution; that status stays explicit.
 */
import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {normalizeSuppliedBoundaries,SUPPLIED_BOUNDARY_ID,SUPPLIED_BOUNDARY_SHA256,SUPPLIED_BOUNDARY_PATH} from '../src/data/suppliedBoundaries.ts';
import {validateBoundaryDataset} from '../src/data/geospatial.ts';
import {BOUNDARY_METADATA_URL,BOUNDARY_LICENSE,BOUNDARY_LICENSE_URL} from '../src/data/boundaryMetadata.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(resolve(root,SUPPLIED_BOUNDARY_PATH));
if(sha(raw)!==SUPPLIED_BOUNDARY_SHA256)throw new Error('Uploaded source bytes differ from the accepted file');
const collection=normalizeSuppliedBoundaries(JSON.parse(raw));
const indexProof=JSON.parse(execFileSync(process.env.IUI_GIS_PYTHON||'python3',[resolve(root,'scripts/check-metadata-index.py')],{encoding:'utf8'}));
const report=JSON.parse(execFileSync(process.env.IUI_GIS_PYTHON||'python3',[resolve(root,'scripts/check-geometry.py'),resolve(root,SUPPLIED_BOUNDARY_PATH)],{encoding:'utf8'}));
const reportBytes=JSON.stringify(report,null,2)+'\n';
const record={evidenceType:'user-supplied-three-region-extract',fileName:'iui-yogyakarta-boundaries.geojson',receivedAt:'2026-11-02',sha256:sha(raw),claimedSource:'geoBoundaries gbOpen IDN ADM2',claimedBoundaryId:SUPPLIED_BOUNDARY_ID,verifiedBoundaryYear:indexProof.row.boundaryYearRepresented,verifiedMetadataLicense:BOUNDARY_LICENSE,metadataIndexSource:indexProof.sourceUrl,metadataIndexSha256:indexProof.indexSha256,originalSourceCredit:indexProof.row.boundarySource,licenseUrl:BOUNDARY_LICENSE_URL,originalMetadataUrl:BOUNDARY_METADATA_URL,verification:{internalIdentifiers:'All three feature shapeIDs have the 22746128 dataset prefix and exact expected region IDs; shapeGroup=IDN, shapeType=ADM2.',geometry:'Shapely topology, closed rings, winding, extent, reference-marker containment and no overlapping interiors passed.',crs:'RFC7946 WGS84 longitude/latitude default; no explicit CRS member or original CRS metadata supplied.',upstreamComparison:'Not performed: original API response and upstream geometry snapshot are unavailable.',originalAttribution:'Source names and CC BY 3.0 IGO are confirmed by the official metadata index. The complete original citation/source notices and third-party reuse review remain pending.'},sourceCommit:null,upstreamRetrievedAt:null,publicationStatus:'pending-upstream-attribution'};
const recordBytes=JSON.stringify(record,null,2)+'\n';
const dataset=validateBoundaryDataset({status:'ready',collection,provenance:{provider:'geoBoundaries',verification:'supplied-subset',publicationStatus:'pending-upstream-attribution',release:SUPPLIED_BOUNDARY_ID,boundaryYear:'2020',boundaryId:SUPPLIED_BOUNDARY_ID,sourceUrl:BOUNDARY_METADATA_URL,metadataUrl:BOUNDARY_METADATA_URL,license:BOUNDARY_LICENSE,licenseUrl:BOUNDARY_LICENSE_URL,attribution:`geoBoundaries gbOpen — Indonesia ADM2, IDN-ADM2-22746128 (2020). Original sources: ${indexProof.row.boundarySource}. CC BY 3.0 IGO, confirmed by the official metadata index. Supplied subset; original source notices and upstream geometry comparison remain pending.`,retrievedAt:null,receivedAt:'2026-11-02',sourceSha256:sha(raw),sourceCommit:null,metadataSha256:null,citationSha256:null,licenseSha256:null,receiptSha256:null,metadataIndex:{url:indexProof.sourceUrl,commit:indexProof.repositoryCommit,sha256:indexProof.indexSha256,rowEvidenceFile:'docs/source-evidence/geoboundaries-metadata-index/IDN-ADM2-22746128.json'},uploadEvidenceFile:SUPPLIED_BOUNDARY_PATH,uploadRecordSha256:sha(recordBytes),validationReportSha256:sha(reportBytes),changes:'Input geometries and original shape properties preserved. IUI IDs, display names and sourceShapeId added. No repair, reprojection, simplification, or rounding applied.'}});
await writeFile(resolve(root,'docs/source-evidence/uploaded/validation-report.json'),reportBytes);
await writeFile(resolve(root,'docs/source-evidence/uploaded/provenance.json'),recordBytes);
const path=resolve(root,'public/data/boundaries.json');await writeFile(path+'.pending',JSON.stringify(dataset,null,2)+'\n');await rename(path+'.pending',path);
console.log('Integrated 3 supplied polygons for development. Identifier and topology checks passed. Upstream equivalence and original attribution/publication review remain pending.');
