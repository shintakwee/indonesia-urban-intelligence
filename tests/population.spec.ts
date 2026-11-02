import {test,expect} from '@playwright/test';
import {populationDataset,validatePopulationDataset,validatePopulationEvidence} from '../src/data/indicators';
import {validateBoundaryMetadata,validateGeometryIdentity} from '../src/data/boundaryMetadata';
import {validateBoundaryDataset} from '../src/data/geospatial';
import {syntheticBoundaries} from './fixtures/boundaries';
import evidence from '../docs/source-evidence/bps-sp2020-independent-review.json' with {type:'json'};

test('SP2020 real observations match the supplied independent review and retain month precision',()=>{
 const data=validatePopulationDataset(populationDataset);
 expect(data.observations.map(o=>[o.regionId,o.value])).toEqual([['yogyakarta',373589],['sleman',1125804],['bantul',985770]]);
 for(const row of data.observations){expect(row.referencePeriod).toBe('2020-09');validatePopulationEvidence(row,evidence);}
 const wrongPeriod=structuredClone(data);wrongPeriod.observations[1].referencePeriod='2020-09-15';expect(()=>validatePopulationDataset(wrongPeriod)).toThrow(/reference period/);
 const wrongDefinition=structuredClone(data);wrongDefinition.observations[2].definitionId='civil-registration';expect(()=>validatePopulationDataset(wrongDefinition)).toThrow(/definitions/);
 const wrongGeography=structuredClone(data);wrongGeography.observations[2].geographyVersion='2024';expect(()=>validatePopulationDataset(wrongGeography)).toThrow(/geographies/);
 const duplicate=structuredClone(data);duplicate.observations[1].regionId='yogyakarta';expect(()=>validatePopulationDataset(duplicate)).toThrow();
 const wrongSource=structuredClone(data);wrongSource.observations[0].sourceUrl='https://example.invalid';expect(()=>validatePopulationDataset(wrongSource)).toThrow(/SP2020 source/);
 const changedCount=structuredClone(data.observations[0]);changedCount.value++;expect(()=>validatePopulationEvidence(changedCount,evidence)).toThrow(/count differs/);
});
test('IDN ADM2 license policy accepts 3.0 IGO and rejects incorrect 4.0, non-commercial and mismatched datasets',()=>{
 // Metadata and geometry identities here are expressly synthetic policy fixtures, not source evidence.
 const commit='a'.repeat(40),url=`https://raw.githubusercontent.com/wmgeolab/geoBoundaries/${commit}/releaseData/gbOpen/IDN/ADM2/geoBoundaries-IDN-ADM2_simplified.geojson`;
 const metadata={boundaryISO:'IDN',boundaryType:'ADM2',boundaryYearRepresented:'2020',boundaryID:'IDN-ADM2-SYNTHETIC-TEST',boundaryLicense:'CC BY 3.0 IGO',boundarySource:'Synthetic test attribution',simplifiedGeometryGeoJSON:url};
 expect(validateBoundaryMetadata(metadata).boundaryYear).toBe('2020');
 expect(validateGeometryIdentity(metadata,url).sourceCommit).toBe(commit);
 for(const license of ['CC BY 4.0','CC BY-NC 3.0','GADM','FAO GAUL'])expect(()=>validateBoundaryMetadata({...metadata,boundaryLicense:license})).toThrow(/license/);
 expect(()=>validateBoundaryMetadata({...metadata,boundaryISO:'USA'})).toThrow(/IDN ADM2/);
 expect(()=>validateBoundaryMetadata({...metadata,boundaryYearRepresented:'2017'})).toThrow(/2020/);
 expect(()=>validateGeometryIdentity(metadata,url.replace(commit,'main'))).toThrow();
 const wrong=structuredClone(syntheticBoundaries);if(wrong.status==='ready')wrong.provenance.license='CC-BY-4.0' as never;
 expect(()=>validateBoundaryDataset(wrong)).toThrow(/provenance/);
});
test('real comparison updates values, proportional bars, citations and both languages',async({page})=>{
 await page.goto('/#compare');
 await expect(page.locator('.population-chart')).toContainText('373.589');
 await expect(page.locator('.population-chart')).toContainText('1.125.804');
 const sizes=await page.locator('.chart-bar').evaluateAll(elements=>elements.map(e=>e.getBoundingClientRect().width));
 expect(sizes[0]/sizes[1]).toBeCloseTo(373589/1125804,2);
 await page.getByLabel('Pilih wilayah 2').selectOption('bantul');
 await expect(page.locator('.population-chart')).toContainText('985.770');
 await expect(page.locator('table')).toContainText('2020-09');
 await expect(page.locator('.population-chart')).not.toContainText('1.125.804');
 await expect(page.locator('.chart-sources a').first()).toHaveAttribute('href','https://sensus.bps.go.id/topik/tabular/sp2020/1/15/0');
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 await expect(page.locator('.population-chart')).toContainText('985,770');
 await expect(page.locator('.population-chart')).toContainText('September 2020');
 await expect(page.locator('.population-chart')).not.toContainText('Jumlah penduduk');
 await expect(page.locator('.population-chart [role="img"]')).toHaveAccessibleName(/373,589 persons.*985,770 persons/);
 await page.getByRole('navigation').getByRole('link',{name:'Data sources',exact:true}).click();
 await expect(page.locator('.integration-status')).toContainText('CC BY 3.0 IGO');
 await expect(page.locator('.integration-status a')).toHaveAttribute('href','https://creativecommons.org/licenses/by/3.0/igo/');
});
test('mobile population chart remains readable without page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#compare');
 await expect(page.locator('.chart-bar')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/sp2020-mobile.png',fullPage:true});
});
