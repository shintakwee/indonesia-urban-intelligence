import {test,expect} from '@playwright/test';
test('bilingual navigation, comparison and persisted locale',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','id');
 await expect(page.getByRole('heading',{level:1})).toContainText('Pahami kotanya');
 await page.getByRole('button',{name:'Ganti bahasa'}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('Understand the city');
 await page.getByRole('navigation').getByRole('link',{name:'Compare',exact:true}).click();
 await page.getByLabel('Choose a place 2').selectOption('bantul');
 await expect(page.locator('thead')).toContainText('Bantul');
 await expect(page.locator('table')).toContainText('Not yet available');
 await expect(page.locator('table')).not.toContainText('Sleman');
 for(const [label,title] of [['Data sources','Evidence starts'],['Methodology','Make the evidence'],['About','Local questions'],['Collaboration','Build a better']]){
  await page.getByRole('navigation').getByRole('link',{name:label,exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText(title);
  await page.getByRole('button',{name:'Change language'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','id');
  await page.getByRole('button',{name:'Ganti bahasa'}).click();
 }
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
 expect(errors).toEqual([]);
});
test('map reference points, controls and offline basemap fallback',async({page})=>{
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
 await page.goto('/');
 await expect(page.locator('.place-marker')).toHaveCount(3);
 await expect(page.getByRole('status').filter({hasText:'Peta dasar daring tidak tersedia'})).toBeVisible();
 await page.locator('.place-option').filter({hasText:'Bantul'}).click();
 await expect(page.locator('.map-selection h3')).toHaveText('Bantul');
 await page.getByLabel('Titik referensi',{exact:true}).uncheck();
 await expect(page.locator('.place-marker:visible')).toHaveCount(0);
 await page.getByLabel('Titik referensi',{exact:true}).check();
 await expect(page.locator('.place-marker:visible')).toHaveCount(3);
 await page.getByLabel('Peta dasar OpenStreetMap').uncheck();
 await expect(page.locator('.map-alert')).toHaveCount(0);
 await page.getByRole('button',{name:'Perluas peta'}).click();
 await expect(page.locator('.map-workspace')).toHaveClass(/expanded/);
 await page.getByRole('button',{name:'Perkecil peta'}).click();
 await page.getByRole('button',{name:'Atur ulang tampilan'}).click();
});
test('mobile navigation and page widths',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.getByRole('button',{name:'Buka navigasi'}).click();
 await page.getByRole('navigation').getByRole('link',{name:'Bandingkan',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('Wilayah berbeda');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/mobile-comparison.png',fullPage:true});
 await page.goto('/');await expect(page.locator('.map-workspace')).toBeVisible();await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
