import {test,expect} from '@playwright/test';
import {syntheticBoundaries} from './fixtures/boundaries';
import {validateBoundaryDataset,boundaryBounds,collectionBounds,rasterLayers} from '../src/data/geospatial';
import {validatePopulationDataset} from '../src/data/indicators';
import {boundaryLayers} from '../src/map/boundaryLayers';

test('boundary schema rejects missing provenance, wrong geography, duplicate IDs and unclosed rings',()=>{
 expect(validateBoundaryDataset(syntheticBoundaries).status).toBe('ready');
 const noProvenance=structuredClone(syntheticBoundaries);noProvenance.provenance=null as never;
 expect(()=>validateBoundaryDataset(noProvenance)).toThrow(/provenance/);
 const wrongRegion=structuredClone(syntheticBoundaries);if(wrongRegion.status==='ready')wrongRegion.collection.features[0].properties.regionId='unknown' as never;
 expect(()=>validateBoundaryDataset(wrongRegion)).toThrow(/identity/);
 const duplicate=structuredClone(syntheticBoundaries);if(duplicate.status==='ready')duplicate.collection.features[1]=duplicate.collection.features[0];
 expect(()=>validateBoundaryDataset(duplicate)).toThrow(/identity/);
 const ring=structuredClone(syntheticBoundaries);if(ring.status==='ready'&&ring.collection.features[0].geometry.type==='Polygon')ring.collection.features[0].geometry.coordinates[0].pop();
 expect(()=>validateBoundaryDataset(ring)).toThrow(/ring/);
 const outside=structuredClone(syntheticBoundaries);if(outside.status==='ready'&&outside.collection.features[0].geometry.type==='Polygon')outside.collection.features[0].geometry.coordinates[0][1][0]=120;
 expect(()=>validateBoundaryDataset(outside)).toThrow(/envelope/);
 if(syntheticBoundaries.status==='ready'){
  expect(boundaryBounds(syntheticBoundaries.collection.features[2])).toEqual([[110.27,-7.99],[110.43,-7.84]]);
  expect(collectionBounds(syntheticBoundaries.collection)).toEqual([[110.27,-7.99],[110.46,-7.61]]);
 }
});
test('population stays blocked without complete primary-source observations; raster layers stay planned',()=>{
 expect(validatePopulationDataset({status:'blocked',reason:'source-access',observations:[]}).observations).toEqual([]);
 expect(()=>validatePopulationDataset({status:'ready',observations:[]})).toThrow(/three-region/);
 expect(()=>validatePopulationDataset({status:'ready',observations:[{}, {}, {}]})).toThrow();
 expect(rasterLayers.every(layer=>layer.status==='planned'&&!layer.tiles)).toBe(true);
 expect(JSON.stringify(boundaryLayers)).toContain('feature-state');
 expect(JSON.stringify(boundaryLayers)).toContain('hover');
 expect(JSON.stringify(boundaryLayers)).toContain('selected');
});
test('SP2020 population is shown while real geometry stays unavailable',async({page})=>{
 await page.goto('/');
 await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeDisabled();
 await expect(page.getByText(/Integrasi batas belum selesai/)).toBeVisible();
 await page.getByRole('navigation').getByRole('link',{name:'Bandingkan',exact:true}).click();
 await expect(page.locator('.chart-bar')).toHaveCount(2);
 await expect(page.locator('.population-chart')).toContainText('373.589');
 await expect(page.locator('.population-chart')).toContainText('1.125.804');
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 await expect(page.locator('.population-chart')).toContainText('373,589');
 await expect(page.locator('.population-chart')).toContainText('independent research review');
});
test('synthetic polygons exercise actual MapLibre hover, click, fit, toggle and bilingual tooltip',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/data/boundaries.json',route=>route.fulfill({json:syntheticBoundaries}));
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
 await page.goto('/');
 const boundaryToggle=page.getByLabel('Batas administrasi',{exact:true});await expect(boundaryToggle).toBeEnabled();
 await expect(page.locator('.boundary-attribution')).toContainText('Synthetic geometry');
 await page.getByLabel('Peta dasar OpenStreetMap').uncheck();
 // Capture the projected Sleman marker center, then hide markers so the canvas receives input.
 const marker=page.locator('.place-marker').filter({hasText:'2'});await expect(marker).toBeVisible();
 // fitBounds is immediate on data load, but rendering and source worker updates are asynchronous.
 await page.getByRole('button',{name:'Atur ulang tampilan'}).click();
 const box=await marker.boundingBox();expect(box).not.toBeNull();
 await page.getByLabel('Titik referensi',{exact:true}).uncheck();
 await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
 await expect(page.locator('.boundary-tooltip')).toBeVisible();
 await expect(page.locator('.boundary-tooltip')).toContainText('Sleman');
 await expect(page.locator('.boundary-tooltip')).toContainText('Wilayah administrasi');
 await page.mouse.down();await page.mouse.up();
 await expect(page.locator('.map-selection h3')).toHaveText('Sleman');
 await expect(page.locator('.place-option').filter({hasText:'Sleman'})).toHaveAttribute('aria-pressed','true');
 // Fitting the selected Sleman extent moves its marker away from the initial overview position.
 await page.getByLabel('Titik referensi',{exact:true}).check();
 await expect(page.locator('.place-marker').filter({hasText:'2'})).toBeVisible();
 await expect.poll(async()=>{const after=await marker.boundingBox();return after?Math.abs(after.y-box!.y):0;}).toBeGreaterThan(30);
 await boundaryToggle.uncheck();await expect(page.locator('.boundary-tooltip')).toHaveCount(0);
 await page.locator('.map-canvas').hover({position:{x:80,y:80}});await expect(page.locator('.boundary-tooltip')).toHaveCount(0);
 await boundaryToggle.check();
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 await expect(page.getByLabel('Administrative boundaries',{exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Reset view'}).click();
 const englishMarker=await marker.boundingBox();expect(englishMarker).not.toBeNull();
 await page.getByLabel('Reference points',{exact:true}).uncheck();
 await page.mouse.move(englishMarker!.x+englishMarker!.width/2,englishMarker!.y+englishMarker!.height/2);
 await expect(page.locator('.boundary-tooltip')).toContainText('Administrative area · Regency');
 // Keyboard-accessible place list follows the same boundary selection/fit path.
 await page.locator('.place-option').filter({hasText:'Bantul'}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('.map-selection h3')).toHaveText('Bantul');
 await page.getByRole('button',{name:'Expand map'}).click();await page.keyboard.press('Escape');
 await expect(page.locator('.map-workspace')).not.toHaveClass(/expanded/);
 expect(errors).toEqual([]);
});
test('malformed or unavailable boundary asset fails closed while the app remains usable',async({page})=>{
 await page.route('**/data/boundaries.json',route=>route.fulfill({json:{status:'ready',collection:{type:'FeatureCollection',features:[]}}}));
 await page.goto('/');
 await expect(page.getByText(/Data batas tidak dapat dimuat/)).toBeVisible();
 await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeDisabled();
 await expect(page.locator('.place-option')).toHaveCount(3);
});
