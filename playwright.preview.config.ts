import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests-private-preview',workers:1,
 use:{baseURL:'http://127.0.0.1:4174',reducedMotion:'reduce',headless:true,
  launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']}},
 webServer:{command:'npm run preview:private-preview',port:4174,reuseExistingServer:!process.env.CI},
});
