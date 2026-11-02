import { defineConfig,type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
function privatePreview():Plugin {
 return {
  name:'iui-boundary-free-private-preview',
  transformIndexHtml(){return [{tag:'meta',attrs:{name:'robots',content:'noindex, nofollow, noarchive'},injectTo:'head'}];},
  generateBundle(){
   // Do not copy public/: it contains the uncleared administrative geometry.
   // Emit only an explicit placeholder, never a filtered copy of that dataset.
   this.emitFile({type:'asset',fileName:'data/boundaries.json',source:JSON.stringify({status:'blocked',reason:'provenance-withheld',provenance:null,collection:null})+'\n'});
   this.emitFile({type:'asset',fileName:'robots.txt',source:'User-agent: *\nDisallow: /\n'});
  },
 };
}
export default defineConfig(({mode})=>({
 plugins:[react(),...(mode==='private-preview'?[privatePreview()]:[])],
 publicDir:mode==='private-preview'?false:'public',
 build:{sourcemap:false},
}));
