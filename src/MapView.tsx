import {useEffect,useRef,useState} from 'react';
import maplibregl from 'maplibre-gl';
import {Expand,Minus,Plus,RotateCcw,MapPin,ExternalLink} from 'lucide-react';
import {regions,type Locale} from './data/catalog';
import {copy} from './i18n';

export default function MapView({locale}:{locale:Locale}) {
 const t=copy[locale]; const container=useRef<HTMLDivElement>(null); const map=useRef<maplibregl.Map|null>(null);
 const [selected,setSelected]=useState(0); const [basemap,setBasemap]=useState(true); const [points,setPoints]=useState(true); const [error,setError]=useState(false);const [failed,setFailed]=useState(false); const [expanded,setExpanded]=useState(false);
 const markers=useRef<maplibregl.Marker[]>([]);
 useEffect(()=>{
  if(!container.current) return;
  let instance:maplibregl.Map;
  try {
   instance=new maplibregl.Map({container:container.current,center:[110.36,-7.80],zoom:10.5,maxZoom:18,minZoom:3,attributionControl:false,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors',maxzoom:19}},layers:[{id:'background',type:'background',paint:{'background-color':'#dce7df'}},{id:'osm',type:'raster',source:'osm'}]}});
   map.current=instance;
   instance.addControl(new maplibregl.AttributionControl({compact:false,customAttribution:'<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>'}));
   instance.on('error',()=>setError(true));
   instance.on('idle',()=>{if(instance.areTilesLoaded()) setError(false);});
   markers.current=regions.map((r,i)=>{
    const button=document.createElement('button');button.className='place-marker';button.textContent=String(i+1);button.title=r.name;button.setAttribute('aria-label',r.name);button.onclick=()=>{setSelected(i);instance.flyTo({center:r.coordinate,zoom:12});};
    return new maplibregl.Marker({element:button}).setLngLat(r.coordinate).addTo(instance);
   });
  } catch {setFailed(true);}
  return ()=>{markers.current.forEach(m=>m.remove());instance?.remove();map.current=null;};
 },[]);
 useEffect(()=>{document.querySelector('.maplibregl-canvas')?.setAttribute('aria-label',t.mapLabel);},[t.mapLabel]);
 useEffect(()=>{const m=map.current;if(!m)return; const apply=()=>m.setLayoutProperty('osm','visibility',basemap?'visible':'none');if(m.isStyleLoaded())apply();else m.once('load',apply);if(basemap)setError(false);return()=>{m.off('load',apply);};},[basemap]);
 useEffect(()=>{markers.current.forEach((m,i)=>{m.getElement().style.display=points?'':'none';m.getElement().classList.toggle('selected',i===selected);});},[points,selected]);
 useEffect(()=>{map.current?.resize();},[expanded]);
 const choose=(i:number)=>{setSelected(i);map.current?.flyTo({center:regions[i].coordinate,zoom:12});};
 return <section id="map" className="map-section section"><div className="section-heading"><div><span className="eyebrow">{t.live}</span><h2>{t.mapTitle}</h2><p>{t.mapIntro}</p></div><span className="pill"><span className="status-dot"/>{t.pilot}</span></div>
 <div className={`map-workspace ${expanded?'expanded':''}`}><aside className="map-sidebar"><h3>{t.places}</h3><p className="small muted">{t.regionLabel}</p><div className="place-list">{regions.map((r,i)=><button key={r.id} className={`place-option ${selected===i?'active':''}`} onClick={()=>choose(i)} aria-pressed={selected===i}><span className="place-number">0{i+1}</span><span><strong>{r.name}</strong><small>{r.kind[locale]}</small></span><MapPin size={16}/></button>)}</div><h3>{t.layers}</h3><label className="check"><input type="checkbox" checked={basemap} onChange={e=>setBasemap(e.target.checked)}/>{t.base}</label><label className="check"><input type="checkbox" checked={points} onChange={e=>setPoints(e.target.checked)}/>{t.points}</label><div className="map-note">{t.note}</div></aside>
 <div className="map-panel"><div ref={container} className="map-canvas" role="region" aria-label={t.mapLabel}/><div className="map-tools"><button aria-label="+" onClick={()=>map.current?.zoomIn()}><Plus size={19}/></button><button aria-label="−" onClick={()=>map.current?.zoomOut()}><Minus size={19}/></button><button title={t.reset} aria-label={t.reset} onClick={()=>map.current?.flyTo({center:[110.36,-7.8],zoom:10.5})}><RotateCcw size={18}/></button><button aria-label={expanded?t.exitFullscreen:t.fullscreen} title={expanded?t.exitFullscreen:t.fullscreen} onClick={()=>setExpanded(!expanded)}><Expand size={18}/></button></div>
 {(failed||(error&&basemap))&&<div className="map-alert" role="status">{failed?t.mapFailed:t.mapError}</div>}
 <div className="map-selection"><span className="eyebrow">{t.selected}</span><h3>{regions[selected].name}</h3><p>{regions[selected].kind[locale]} · {t.coordinates}</p><a href={regions[selected].source} target="_blank" rel="noreferrer">{t.source}<ExternalLink size={13}/></a></div></div></div></section>;
}
