/** Node 24+. Downloads only pinned, checksum-verified official source assets.
 * No files in the application are replaced unless all validation succeeds.
 * A reviewed result is still required: source metadata is not proof of legal accuracy.
 */
import {createHash} from 'node:crypto';
import {mkdir,writeFile,rename,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateBoundaryDataset} from '../src/data/geospatial.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const revision='1289e40e366c7b320550be1ee0614a9472d572d4';
const base=`https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/${revision}/releaseData/gbOpen/IDN/ADM2/`;
const hashes={
 'geoBoundaries-IDN-ADM2-metaData.json':'509074e115dcabd5f2a61e525e465af53075c0272f9e0375a031af82d4c78867',
 'geoBoundaries-IDN-ADM2_simplified.geojson':'02244eae72a37d304e68975ff0cabd507881dfa4390cdc7c6738d56ad4274234',
 'CITATION-AND-USE-geoBoundaries.txt':'f6ea7572bea6036c4cdcacf8c0ca7bf09098d4e600d19546d7432533e9a290d5',
};
const staging=await mkdtemp(join(tmpdir(),'iui-boundary-import-'));
try{
 const assets={};
 for(const [name,hash] of Object.entries(hashes)){
  const target=join(staging,name);
  // curl honors the inherited managed proxy and CA trust; TLS verification stays on.
  execFileSync('curl',['--fail','--location','--silent','--show-error','--max-time','90','--output',target,base+name],{stdio:['ignore','ignore','pipe']});
  const {readFile}=await import('node:fs/promises');const body=await readFile(target);
  if(createHash('sha256').update(body).digest('hex')!==hash)throw new Error(`Checksum mismatch: ${name}`);
  assets[name]=body.toString('utf8');
 }
 const metadata=JSON.parse(assets['geoBoundaries-IDN-ADM2-metaData.json']);
 if(metadata.boundaryISO!=='IDN'||metadata.boundaryType!=='ADM2'||!metadata.boundaryID||!metadata.boundaryYear)throw new Error('Unexpected metadata geography');
 if(!/CC BY 4\.0|Creative Commons Attribution 4\.0/i.test(metadata.boundaryLicense??''))throw new Error('Dataset license requires separate review; only verified CC BY 4.0 is supported by this importer');
 const source=JSON.parse(assets['geoBoundaries-IDN-ADM2_simplified.geojson']);
 const names={yogyakarta:['Yogyakarta','Kota Yogyakarta','Yogyakarta City'],sleman:['Sleman','Kabupaten Sleman'],bantul:['Bantul','Kabupaten Bantul']};
 const collection={type:'FeatureCollection',features:Object.entries(names).map(([id,aliases])=>{
  const matches=source.features.filter(f=>aliases.includes(f.properties?.shapeName));
  if(matches.length!==1)throw new Error(`Ambiguous or missing source region: ${id}`);
  const f=matches[0];
  return {type:'Feature',id,properties:{regionId:id,name:id==='yogyakarta'?'Kota Yogyakarta':id==='sleman'?'Sleman':'Bantul',sourceShapeId:f.properties.shapeID},geometry:f.geometry};
 })};
 const citation=assets['CITATION-AND-USE-geoBoundaries.txt'];
 const dataset=validateBoundaryDataset({status:'ready',collection,provenance:{provider:'geoBoundaries',release:'v6.0.0',boundaryYear:String(metadata.boundaryYear),boundaryId:metadata.boundaryID,sourceUrl:base+'geoBoundaries-IDN-ADM2_simplified.geojson',metadataUrl:base+'geoBoundaries-IDN-ADM2-metaData.json',license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',attribution:`geoBoundaries (William & Mary geoLab), gbOpen IDN ADM2. Original sources: ${String(metadata.boundarySource)}. ${metadata.boundaryID}. See retained CITATION-AND-USE-geoBoundaries.txt.`,retrievedAt:new Date().toISOString().slice(0,10),sourceSha256:hashes['geoBoundaries-IDN-ADM2_simplified.geojson'],changes:'Subset of three ADM2 features from the upstream simplified release; original geometry retained; stable IUI region IDs and display names added.'}});
 // Require actual topology checking in addition to structural checks.
 const collectionPath=join(staging,'subset.json');await writeFile(collectionPath,JSON.stringify(collection));
 execFileSync(process.env.IUI_GIS_PYTHON||'python3',['-c',`import json,sys
from shapely.geometry import shape
features=json.load(open(sys.argv[1]))['features']
for f in features:
 g=shape(f['geometry'])
 assert g.is_valid and not g.is_empty and g.area>0, 'Invalid polygon topology'
for i,a in enumerate(features):
 for b in features[i+1:]:
  assert shape(a['geometry']).intersection(shape(b['geometry'])).area<1e-10, 'Overlapping study boundaries'
`,collectionPath],{stdio:'pipe'});
 const evidence=join(root,'docs/source-evidence/geoboundaries-v6');await mkdir(evidence,{recursive:true});
 for(const name of ['geoBoundaries-IDN-ADM2-metaData.json','CITATION-AND-USE-geoBoundaries.txt'])await writeFile(join(evidence,name),assets[name]);
 await writeFile(join(evidence,'source-checksums.json'),JSON.stringify({revision,sha256:hashes},null,2)+'\n');
 const pending=join(root,'public/data/boundaries.json.pending');await writeFile(pending,JSON.stringify(dataset,null,2)+'\n');
 await rename(pending,join(root,'public/data/boundaries.json'));
 console.log('Imported three checked study boundaries. Review metadata/citation and visual extents, then rebuild and run all GIS tests.');
}catch(error){
 console.error('Boundary import incomplete. Existing application boundary data was preserved.');
 console.error(error.message);process.exitCode=1;
}
