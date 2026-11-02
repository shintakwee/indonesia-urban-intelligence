import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {normalizeSuppliedBoundaries,SUPPLIED_BOUNDARY_SHA256,SUPPLIED_BOUNDARY_PATH} from '../src/data/suppliedBoundaries.ts';
import {validateBoundaryDataset} from '../src/data/geospatial.ts';
import {validateGeometryIdentity} from '../src/data/boundaryMetadata.ts';
import {validatePopulationDataset,validatePopulationEvidence} from '../src/data/indicators.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const sha=body=>createHash('sha256').update(body).digest('hex');
const dataset=validateBoundaryDataset(JSON.parse(await readFile(resolve(root,'public/data/boundaries.json'),'utf8')));
const population=validatePopulationDataset(JSON.parse(await readFile(resolve(root,'src/data/population.json'),'utf8')));
if(dataset.status==='ready'&&dataset.provenance.verification==='reviewed-originals'){
 const directory=resolve(root,'docs/source-evidence/geoboundaries-idn-adm2');
 const metadata=await readFile(resolve(directory,'geoBoundaries-IDN-ADM2-api.json'));
 const citation=await readFile(resolve(directory,'CITATION-AND-USE-geoBoundaries.txt'));
 const license=await readFile(resolve(directory,'CC-BY-3.0-IGO-legalcode.html'));
 const receipt=await readFile(resolve(directory,'source-receipt.json'));
 const p=dataset.provenance,r=JSON.parse(receipt),m=JSON.parse(metadata),identity=validateGeometryIdentity(m,r.geometryUrl,r.sourceCommit);
 if(sha(metadata)!==p.metadataSha256||sha(citation)!==p.citationSha256||sha(license)!==p.licenseSha256||sha(receipt)!==p.receiptSha256)throw new Error('Source evidence checksum mismatch');
 if(r.license!==p.license||r.licenseUrl!==p.licenseUrl||r.metadataUrl!==p.metadataUrl||r.retrievedAt!==p.retrievedAt||r.sha256.metadata!==sha(metadata)||r.sha256.citation!==sha(citation)||r.sha256.license!==sha(license)||p.boundaryId!==identity.boundaryId||p.sourceCommit!==identity.sourceCommit||p.sourceUrl!==identity.resolvedGeometryUrl||r.sha256.geometry!==p.sourceSha256||r.attribution!==p.attribution||r.reviewedForCommercialReuse!==true||r.thirdPartyNoticesReviewed!==true)throw new Error('Boundary provenance differs from reviewed original evidence');
 const audit=JSON.parse(await readFile(resolve(directory,'geometry-audit.json'),'utf8'));
 if(audit.sha256!==p.sourceSha256||JSON.stringify(audit.shapeIds)!==JSON.stringify(dataset.collection.features.map(f=>f.properties.sourceShapeId)))throw new Error('Boundary source identities differ from geometry audit');
}
if(dataset.status==='ready'&&dataset.provenance.verification==='supplied-subset'){
 const p=dataset.provenance,raw=await readFile(resolve(root,SUPPLIED_BOUNDARY_PATH));
 if(sha(raw)!==SUPPLIED_BOUNDARY_SHA256||sha(raw)!==p.sourceSha256)throw new Error('Uploaded source checksum mismatch');
 if(!isDeepStrictEqual(normalizeSuppliedBoundaries(JSON.parse(raw)),dataset.collection))throw new Error('Application geometries or properties differ from uploaded source');
 const record=await readFile(resolve(root,'docs/source-evidence/uploaded/provenance.json'));
 const savedReport=await readFile(resolve(root,'docs/source-evidence/uploaded/validation-report.json'));
 if(sha(record)!==p.uploadRecordSha256||sha(savedReport)!==p.validationReportSha256)throw new Error('Upload evidence checksum mismatch');
 const report=JSON.parse(execFileSync(process.env.IUI_GIS_PYTHON||'python3',[resolve(root,'scripts/check-geometry.py'),resolve(root,SUPPLIED_BOUNDARY_PATH)],{encoding:'utf8'}));
 if(!isDeepStrictEqual(report,JSON.parse(savedReport)))throw new Error('Geometry validation differs from retained report; investigate before regenerating it');
 console.log('Supplied geometry: exact upload checksum, original coordinates/properties, WGS84 range/order, Shapely topology, no interior overlaps, and region IDs validated.');
 console.log('Publication remains pending: original upstream metadata, source attribution and snapshot equivalence have not been verified.');
 if(process.argv.includes('--require-publishable'))throw new Error('Release validation blocked: uploaded subset is not independently verified against upstream source and attribution notices');
}
for(const observation of population.observations){
 const path=resolve(root,observation.evidenceFile);
 if(!path.startsWith(resolve(root,'docs/source-evidence')+'/'))throw new Error('Unsafe BPS evidence path');
 const evidence=JSON.parse(await readFile(path,'utf8'));
 validatePopulationEvidence(observation,evidence);
}
console.log(`Boundaries: ${dataset.status}; ${dataset.status==='ready'?dataset.collection.features.length:0} features.`);
console.log(`Population: ${population.status}; ${population.observations.length} observations (${population.provenance?.verification??'none'}).`);
if(dataset.status==='blocked')console.log('Real administrative geometry remains unavailable. Upload originals listed in docs/phase-2.en.md; no network retries or alternatives are needed.');
if(population.status==='ready')console.log('Population uses the supplied SP2020 review; direct BPS retrieval and detailed reuse terms remain unverified in this environment.');
