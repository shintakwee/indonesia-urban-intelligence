import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import proof from '../docs/source-evidence/geoboundaries-metadata-index/IDN-ADM2-22746128.json' with {type:'json'};
import {validateBoundaryMetadata} from '../src/data/boundaryMetadata';
test('retained official metadata index confirms the exact dataset license/year and source names',()=>{
 const csv=readFileSync('docs/source-evidence/geoboundaries-metadata-index/geoBoundariesOpen-meta.csv');
 expect(createHash('sha256').update(csv).digest('hex')).toBe(proof.indexSha256);
 const m=validateBoundaryMetadata(proof.row);
 expect(m.boundaryId).toBe('IDN-ADM2-22746128');expect(m.boundaryYear).toBe('2020');
 expect(proof.row.boundaryLicense).toBe('Creative Commons Attribution 3.0 Intergovernmental Organisations (CC BY 3.0 IGO)');
 expect(m.sourceCredit).toBe('Badan Pusat Statistik (BPS - Statistics Indonesia), World Food Programme, OCHA ROAP');
 expect(proof.row.admUnitCount).toBe('519');
 expect(proof.row.staticDownloadLink).toContain('/4004e96/releaseData/gbOpen/IDN/ADM2/');
 const dataset=JSON.parse(readFileSync('public/data/boundaries.json','utf8'));
 expect(dataset.provenance.attribution).toContain(m.sourceCredit);
 expect(dataset.provenance.publicationStatus).toBe('pending-upstream-attribution');
});
