import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

test('packaged private preview excludes administrative geometry and keeps bilingual navigation/population',async({page,request})=>{
 await page.route('https://tile.openstreetmap.org/**',r=>r.abort());
 const response=await request.get('/data/boundaries.json');
 expect(response.status()).toBe(200);
 expect(await response.json()).toEqual({status:'blocked',reason:'provenance-withheld',provenance:null,collection:null});
 await page.goto('/');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await expect(page.locator('.preview-banner')).toContainText('tinjauan privat');
 await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeDisabled();
 await expect(page.locator('.boundary-status')).toContainText('tidak disertakan');
 await expect(page.locator('.place-marker')).toHaveCount(3);
 await expect(page.locator('.boundary-attribution')).toHaveCount(0);
 await page.getByRole('navigation').getByRole('link',{name:'Bandingkan',exact:true}).click();
 await expect(page.locator('.population-chart')).toContainText('373.589');
 await expect(page.locator('.population-chart')).toContainText('1.125.804');
 await page.getByLabel('Pilih wilayah 2').selectOption('bantul');
 await expect(page.locator('.population-chart')).toContainText('985.770');
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 await expect(page.locator('.preview-banner')).toContainText('Private review build');
 await expect(page.locator('.population-chart')).toContainText('985,770');
 await page.getByRole('navigation').getByRole('link',{name:'Data sources',exact:true}).click();
 await expect(page.locator('.integration-status')).toContainText('withheld from this preview');
 await expect(page.locator('.integration-status')).toContainText('World Food Programme');
 await page.screenshot({path:'test-results/private-preview-sources.png',fullPage:true});
});
test('preview package audit lists no geometry, raw evidence, source maps or credentials',async({request})=>{
 const manifest=JSON.parse(readFileSync('artifacts/iui-hostinger-private-preview-manifest.json','utf8'));
 expect(manifest.boundaryGeometryIncluded).toBe(false);expect(manifest.sourceEvidenceIncluded).toBe(false);
 expect(Object.keys(manifest.files).filter(f=>f.endsWith('.geojson')||f.endsWith('.map')||f.includes('source-evidence')||f.includes('htpasswd'))).toEqual([]);
 expect(readFileSync('dist-private-preview/.htaccess','utf8')).toMatch(/^Require all denied$/m);
 // The local Vite preview does not interpret .htaccess; Hostinger auth must be tested after approval.
 expect(manifest.hostingerDeploymentPerformed).toBe(false);
 for(const path of ['/iui-yogyakarta-boundaries.geojson','/docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson','/data/geoBoundaries-IDN-ADM2_simplified.geojson']){
  const r=await request.get(path);expect(await r.text()).not.toContain('22746128B9761158776103');
 }
});
test('boundary-free preview stays responsive on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.preview-banner')).toBeVisible();
 await expect(page.getByLabel('Batas administrasi',{exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Buka navigasi'}).click();
 await page.getByRole('navigation').getByRole('link',{name:'Bandingkan',exact:true}).click();
 await expect(page.locator('.chart-bar')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
