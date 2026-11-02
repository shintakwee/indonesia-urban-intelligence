/** Offline, supplied-originals importer. No network requests, repairs or inferred geometry.
 * Usage: npm run data:boundaries -- /absolute/path/to/upload-directory
 * See docs/phase-2.en.md for the exact five required files and reviewed receipt.
 */
import {createHash} from 'node:crypto';
import {mkdir,writeFile,rename,readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateBoundaryDataset} from '../src/data/geospatial.ts';
import {validateGeometryIdentity,BOUNDARY_METADATA_URL,BOUNDARY_LICENSE,BOUNDARY_LICENSE_URL} from '../src/data/boundaryMetadata.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const files={metadata:'geoBoundaries-IDN-ADM2-api.json',geometry:'geoBoundaries-IDN-ADM2_simplified.geojson',citation:'CITATION-AND-USE-geoBoundaries.txt',license:'CC-BY-3.0-IGO-legalcode.html',receipt:'source-receipt.json'};
const sha=body=>createHash('sha256').update(body).digest('hex');
try{
 const input=process.argv[2];
 if(!input)throw new Error('Supply an upload directory containing: '+Object.values(files).join(', ')+'. No download was attempted.');
 const assets=Object.fromEntries(await Promise.all(Object.entries(files).map(async([key,name])=>[key,await readFile(resolve(input,name))])));
 const metadata=JSON.parse(assets.metadata),receipt=JSON.parse(assets.receipt);
 const identity=validateGeometryIdentity(metadata,receipt.geometryUrl,receipt.sourceCommit);
 if(!identity.simplified)throw new Error('This upload contract requires the upstream simplified geometry; use its exact metadata link');
 if(receipt.metadataUrl!==BOUNDARY_METADATA_URL||receipt.boundaryID!==identity.boundaryId||receipt.license!=='CC-BY-3.0-IGO'||receipt.licenseUrl!==BOUNDARY_LICENSE_URL||receipt.reviewedForCommercialReuse!==true||receipt.thirdPartyNoticesReviewed!==true||typeof receipt.attribution!=='string'||!receipt.attribution.includes(identity.sourceCredit)||!/^\d{4}-\d{2}-\d{2}$/.test(receipt.retrievedAt))throw new Error('Missing reviewed identity, license, attribution, or retrieval receipt');
 for(const key of ['metadata','geometry','citation','license'])if(receipt.sha256?.[key]!==sha(assets[key]))throw new Error(`Supplied receipt checksum mismatch: ${key}`);
 const citation=assets.citation.toString('utf8'),license=assets.license.toString('utf8');
 if(!citation.trim()||!/(?:3\.0 IGO|3\.0 Intergovernmental|by\/3\.0\/igo)/i.test(license))throw new Error('Missing citation or original IGO license text');
 const source=JSON.parse(assets.geometry);
 if(source.type!=='FeatureCollection'||!Array.isArray(source.features)||!source.features.length||source.features.some(f=>f.properties?.shapeGroup!=='IDN'||f.properties?.shapeType!=='ADM2'))throw new Error('Geometry is not a complete IDN ADM2 source collection');
 if(metadata.admUnitCount!==undefined&&Number(metadata.admUnitCount)!==source.features.length)throw new Error('Feature count differs from original API metadata');
 const names={yogyakarta:['Yogyakarta','Kota Yogyakarta','Yogyakarta City'],sleman:['Sleman','Kabupaten Sleman'],bantul:['Bantul','Kabupaten Bantul']};
 const collection={type:'FeatureCollection',features:Object.entries(names).map(([id,aliases])=>{
  const matches=source.features.filter(f=>aliases.includes(f.properties?.shapeName));
  if(matches.length!==1)throw new Error(`Ambiguous or missing source region: ${id}`);
  const f=matches[0];
  return {type:'Feature',id,properties:{regionId:id,name:id==='yogyakarta'?'Kota Yogyakarta':id==='sleman'?'Sleman':'Bantul',sourceShapeId:f.properties.shapeID},geometry:f.geometry};
 })};
 const changes='Subset of three ADM2 features from the source-linked upstream simplified geometry. Coordinates unchanged; stable IUI IDs and display names added. Not a legal boundary determination.';
 const dataset=validateBoundaryDataset({status:'ready',collection,provenance:{provider:'geoBoundaries',release:`gbOpen snapshot ${identity.sourceCommit}`,boundaryYear:'2020',boundaryId:identity.boundaryId,sourceCommit:identity.sourceCommit,sourceUrl:identity.resolvedGeometryUrl,metadataUrl:BOUNDARY_METADATA_URL,license:BOUNDARY_LICENSE,licenseUrl:BOUNDARY_LICENSE_URL,attribution:receipt.attribution,retrievedAt:receipt.retrievedAt,sourceSha256:sha(assets.geometry),metadataSha256:sha(assets.metadata),citationSha256:sha(assets.citation),licenseSha256:sha(assets.license),receiptSha256:sha(assets.receipt),changes}});
 // Structural validation cannot establish topology or cartographic/legal accuracy.
 const staging=await mkdtemp(join(tmpdir(),'iui-geometry-check-')),path=join(staging,'subset.json');await writeFile(path,JSON.stringify(collection));
 execFileSync(process.env.IUI_GIS_PYTHON||'python3',['-c',`import json,sys
from shapely.geometry import shape
features=json.load(open(sys.argv[1]))['features']
for f in features:
 g=shape(f['geometry'])
 assert g.is_valid and not g.is_empty and g.area>0, 'Invalid polygon topology'
for i,a in enumerate(features):
 for b in features[i+1:]:
  assert shape(a['geometry']).intersection(shape(b['geometry'])).area<1e-10, 'Overlapping study boundaries'
`,path],{stdio:'pipe'});
 const evidence=join(root,'docs/source-evidence/geoboundaries-idn-adm2');await mkdir(evidence,{recursive:true});
 // Keep the original geometry as a local audit artifact outside tracked evidence (it may be large).
 for(const key of ['metadata','citation','license','receipt'])await writeFile(join(evidence,files[key]),assets[key]);
 await writeFile(join(evidence,'geometry-audit.json'),JSON.stringify({sourceUrl:receipt.geometryUrl,sha256:sha(assets.geometry),sourceFeatureCount:source.features.length,shapeIds:collection.features.map(f=>f.properties.sourceShapeId)},null,2)+'\n');
 const pending=join(root,'public/data/boundaries.json.pending');await writeFile(pending,JSON.stringify(dataset,null,2)+'\n');await rename(pending,join(root,'public/data/boundaries.json'));
 console.log('Imported three validated study polygons from supplied originals. Review attribution, bilingual source status, and visual alignment; then rebuild and test before publication.');
}catch(error){
 console.error('Boundary import incomplete. Existing application boundary data was preserved.');console.error(error.message);process.exitCode=1;
}
