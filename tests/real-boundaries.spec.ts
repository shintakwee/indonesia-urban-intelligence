import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {normalizeSuppliedBoundaries,SUPPLIED_BOUNDARY_SHA256,SUPPLIED_BOUNDARY_ID} from '../src/data/suppliedBoundaries';
import {validateBoundaryDataset} from '../src/data/geospatial';
const source=readFileSync('docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson');
const uploaded=JSON.parse(source.toString('utf8'));
const app=JSON.parse(readFileSync('public/data/boundaries.json','utf8'));
const report=JSON.parse(readFileSync('docs/source-evidence/uploaded/validation-report.json','utf8'));

test('actual uploaded bytes, administrative identity, and unmodified geometry match the served data',()=>{
 expect(createHash('sha256').update(source).digest('hex')).toBe(SUPPLIED_BOUNDARY_SHA256);
 expect(validateBoundaryDataset(app).status).toBe('ready');
 expect(app.provenance.boundaryId).toBe(SUPPLIED_BOUNDARY_ID);
 expect(app.provenance.verification).toBe('supplied-subset');
 expect(app.provenance.publicationStatus).toBe('pending-upstream-attribution');
 expect(app.provenance.sourceCommit).toBeNull();
 expect(isDeepStrictEqual(normalizeSuppliedBoundaries(uploaded),app.collection)).toBe(true);
 expect(report.features.map((f:{vertexCount:number})=>f.vertexCount)).toEqual([77,263,316]);
 expect(report.pairs.every((p:{interiorOverlap:boolean})=>!p.interiorOverlap)).toBe(true);
 expect(report.crsDeclaration).toBeNull();
 expect(report.unionValid).toBe(true);
});

test('actual upload validation rejects wrong names, projected CRS, and altered dataset identity',()=>{
 const name=structuredClone(uploaded);name.features[1].properties.shapeName='Gunungkidul';expect(()=>normalizeSuppliedBoundaries(name)).toThrow(/name/);
 const projected=structuredClone(uploaded);projected.crs={type:'name',properties:{name:'EPSG:3857'}};expect(()=>normalizeSuppliedBoundaries(projected)).toThrow(/CRS/);
 const wrongID=structuredClone(uploaded);wrongID.features[0].properties.shapeID='99999999B9761158776103';expect(()=>normalizeSuppliedBoundaries(wrongID)).toThrow(/IDN-ADM2-22746128/);
 const wrongLevel=structuredClone(uploaded);wrongLevel.features[0].properties.shapeType='ADM1';expect(()=>normalizeSuppliedBoundaries(wrongLevel)).toThrow();
 const illegalGeometry=structuredClone(app);illegalGeometry.collection.features[0].geometry.coordinates[0][1][0]=500000;expect(()=>validateBoundaryDataset(illegalGeometry)).toThrow(/envelope/);
});

// Project real Shapely-derived interior coordinates using two existing map markers.
// This avoids exporting a test-only MapLibre instance or intercepting the boundary request.
async function targetPoint(page:Page,name:string,en=false){
 await page.getByRole('button',{name:en?'Reset view':'Atur ulang tampilan',exact:true}).click();
 const points=page.getByLabel(en?'Reference points':'Titik referensi',{exact:true});await points.check();
 await page.locator('.map-workspace').scrollIntoViewIfNeeded();
 const canvas=page.locator('.maplibregl-canvas');
 const first=await page.locator('.place-marker').filter({hasText:'1'}).boundingBox();
 const second=await page.locator('.place-marker').filter({hasText:'2'}).boundingBox();
 const before=await canvas.boundingBox();expect(first&&second&&before).toBeTruthy();
 const feature=report.features.find((f:{name:string})=>f.name===name)!;
 const mercator=(lat:number)=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360));
 const pxPerDegree=(second!.x+second!.width/2-first!.x-first!.width/2)/(110.3556-110.3695);
 const pyPerMercator=(second!.y+second!.height/2-first!.y-first!.height/2)/(mercator(-7.7167)-mercator(-7.7956));
 let x=first!.x+first!.width/2+(feature.representativePoint[0]-110.3695)*pxPerDegree;
 let y=first!.y+first!.height/2+(mercator(feature.representativePoint[1])-mercator(-7.7956))*pyPerMercator;
 await points.uncheck();const after=await canvas.boundingBox();expect(after).not.toBeNull();
 x+=after!.x-before!.x;y+=after!.y-before!.y;
 await page.mouse.move(after!.x+after!.width-12,after!.y+12);
 return {x,y,scale:Math.abs(pxPerDegree),canvas};
}

test('real served polygons render, highlight, select, fit all three regions, and translate tooltips',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://tile.openstreetmap.org/**',r=>r.abort());
 const response=page.waitForResponse(r=>r.url().endsWith('/data/boundaries.json'));
 await page.goto('/');const actual=await response;
 expect(actual.status()).toBe(200);expect((await actual.json()).collection).toEqual(app.collection);
 await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeChecked();
 await page.getByLabel('Peta dasar OpenStreetMap').uncheck();
 for(const name of ['Kota Yogyakarta','Sleman','Bantul']){
  const target=await targetPoint(page,name);
  const before=await target.canvas.screenshot();
  await page.mouse.move(target.x,target.y);
  await expect(page.locator('.boundary-tooltip')).toContainText(name);
  const after=await target.canvas.screenshot();expect(before.equals(after)).toBe(false);
  await page.mouse.click(target.x,target.y);
  await expect(page.locator('.map-selection h3')).toHaveText(name);
  await expect(page.locator('.place-option').filter({hasText:name})).toHaveAttribute('aria-pressed','true');
  await page.getByLabel('Titik referensi',{exact:true}).check();
  const a=await page.locator('.place-marker').filter({hasText:'1'}).boundingBox();
  const b=await page.locator('.place-marker').filter({hasText:'2'}).boundingBox();
  expect(a&&b).toBeTruthy();
  expect(Math.abs((b!.x-a!.x)/(110.3556-110.3695))).toBeGreaterThan(target.scale*1.2);
 }
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 const target=await targetPoint(page,'Sleman',true);await page.mouse.move(target.x,target.y);
 await expect(page.locator('.boundary-tooltip')).toContainText('Administrative area · Regency');
 await page.getByLabel('Administrative boundaries',{exact:true}).uncheck();await expect(page.locator('.boundary-tooltip')).toHaveCount(0);
 await page.mouse.move(target.x+2,target.y+2);await expect(page.locator('.boundary-tooltip')).toHaveCount(0);
 await page.getByLabel('Administrative boundaries',{exact:true}).check();await page.mouse.move(target.x,target.y);
 await expect(page.locator('.boundary-tooltip')).toContainText('Sleman');
 await expect(page.locator('.boundary-attribution')).toContainText('IDN-ADM2-22746128');
 await expect(page.locator('.boundary-attribution a').filter({hasText:'CC-BY-3.0-IGO'})).toHaveAttribute('href','https://creativecommons.org/licenses/by/3.0/igo/');
 await expect(page.locator('.boundary-review-note')).toContainText('remain pending before public release');
 await page.locator('.map-workspace').screenshot({path:'test-results/real-boundary-map.png'});
 expect(errors).toEqual([]);
});

test('real polygons and provenance are usable on mobile and preserve population comparisons',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.route('https://tile.openstreetmap.org/**',r=>r.abort());
 await page.goto('/');await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeChecked();
 await page.locator('.place-option').filter({hasText:'Bantul'}).click();await expect(page.locator('.map-selection h3')).toHaveText('Bantul');
 await page.getByRole('button',{name:'Perluas peta'}).click();await page.keyboard.press('Escape');
 await expect(page.locator('.map-workspace')).not.toHaveClass(/expanded/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Buka navigasi'}).click();await page.getByRole('navigation').getByRole('link',{name:'Bandingkan',exact:true}).click();
 await page.getByLabel('Pilih wilayah 2').selectOption('bantul');
 await expect(page.locator('.population-chart')).toContainText('985.770');
});
