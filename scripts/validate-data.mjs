import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateBoundaryDataset} from '../src/data/geospatial.ts';
import {validatePopulationDataset} from '../src/data/indicators.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const dataset=validateBoundaryDataset(JSON.parse(await readFile(resolve(root,'public/data/boundaries.json'),'utf8')));
const population=validatePopulationDataset(JSON.parse(await readFile(resolve(root,'src/data/population.json'),'utf8')));
if(dataset.status==='ready'){
 const metadata=await readFile(resolve(root,'docs/source-evidence/geoboundaries-v6/geoBoundaries-IDN-ADM2-metaData.json'));
 const citation=await readFile(resolve(root,'docs/source-evidence/geoboundaries-v6/CITATION-AND-USE-geoBoundaries.txt'));
 if(createHash('sha256').update(metadata).digest('hex')!=='509074e115dcabd5f2a61e525e465af53075c0272f9e0375a031af82d4c78867'||createHash('sha256').update(citation).digest('hex')!=='f6ea7572bea6036c4cdcacf8c0ca7bf09098d4e600d19546d7432533e9a290d5')throw new Error('Source evidence checksum mismatch');
 const m=JSON.parse(metadata.toString('utf8'));
 if(dataset.provenance.boundaryId!==m.boundaryID||dataset.provenance.boundaryYear!==String(m.boundaryYear)||dataset.provenance.release!=='v6.0.0'||dataset.provenance.sourceSha256!=='02244eae72a37d304e68975ff0cabd507881dfa4390cdc7c6738d56ad4274234')throw new Error('Boundary provenance differs from pinned release evidence');
}
for(const observation of population.observations){
 const path=resolve(root,observation.evidenceFile);
 if(!path.startsWith(resolve(root,'docs/source-evidence')+'/')||(await readFile(path)).length===0)throw new Error('Missing local BPS source evidence');
}
console.log(`Boundaries: ${dataset.status}; ${dataset.status==='ready'?dataset.collection.features.length:0} features.`);
console.log(`Population: ${population.status}; ${population.observations.length} observations.`);
if(dataset.status==='blocked'||population.status==='blocked')console.log('Source access remains blocked; real-data integration is incomplete.');
