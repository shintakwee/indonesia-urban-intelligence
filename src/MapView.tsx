import {useEffect,useRef,useState} from 'react';
import maplibregl from 'maplibre-gl';
import {Expand,Minus,Plus,RotateCcw,MapPin,ExternalLink} from 'lucide-react';
import {regions,type Locale} from './data/catalog';
import {boundaryBounds,collectionBounds,loadBoundaryDataset,rasterLayers,type BoundaryDataset} from './data/geospatial';
import {BOUNDARY_FILL,BOUNDARY_OUTLINE,BOUNDARY_SOURCE,boundaryLayers} from './map/boundaryLayers';
import {copy} from './i18n';
import {phase2Copy} from './phase2-i18n';

export default function MapView({locale}:{locale:Locale}) {
 const t=copy[locale],g=phase2Copy[locale];
 const container=useRef<HTMLDivElement>(null),map=useRef<maplibregl.Map|null>(null);
 const [selected,setSelected]=useState(0),[basemap,setBasemap]=useState(true),[points,setPoints]=useState(true),[boundaries,setBoundaries]=useState(true);
 const [error,setError]=useState(false),[failed,setFailed]=useState(false),[expanded,setExpanded]=useState(false);
 const [dataset,setDataset]=useState<BoundaryDataset|null>(null),[boundaryError,setBoundaryError]=useState(false);
 const markers=useRef<maplibregl.Marker[]>([]),popup=useRef<maplibregl.Popup|null>(null);
 const localeRef=useRef(locale),datasetRef=useRef(dataset),selectedRef=useRef(selected),hovered=useRef<string|null>(null);
 const updateTooltip=useRef<(()=>void)|null>(null);
 localeRef.current=locale;datasetRef.current=dataset;selectedRef.current=selected;
 const ready=dataset?.status==='ready';
 const selectRegion=(i:number)=>{
  setSelected(i);
  const m=map.current,d=datasetRef.current;
  const feature=d?.status==='ready'?d.collection.features.find(f=>f.properties.regionId===regions[i].id):undefined;
  if(feature)m?.fitBounds(boundaryBounds(feature),{padding:50,duration:700,maxZoom:13});
  else m?.flyTo({center:regions[i].coordinate,zoom:12});
 };
 const selectRef=useRef(selectRegion);selectRef.current=selectRegion;
 useEffect(()=>{
  const controller=new AbortController();
  loadBoundaryDataset(controller.signal).then(setDataset).catch(()=>{if(!controller.signal.aborted)setBoundaryError(true);});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  if(!container.current)return;
  let instance:maplibregl.Map|undefined;
  try{
   instance=new maplibregl.Map({container:container.current,center:[110.36,-7.80],zoom:10.5,maxZoom:18,minZoom:3,attributionControl:false,style:{version:8,sources:{
    osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors',maxzoom:19},
    [BOUNDARY_SOURCE]:{type:'geojson',data:{type:'FeatureCollection',features:[]},promoteId:'regionId'},
   },layers:[{id:'background',type:'background',paint:{'background-color':'#dce7df'}},{id:'osm',type:'raster',source:'osm'},...boundaryLayers]}});
   const m=instance;map.current=m;
   m.addControl(new maplibregl.AttributionControl({compact:false,customAttribution:'<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>'}));
   m.on('error',event=>{const sourceId='sourceId' in event?event.sourceId:undefined;if(sourceId===BOUNDARY_SOURCE)setBoundaryError(true);else setError(true);});
   popup.current=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:14,className:'boundary-tooltip'});
   const clearHover=()=>{
    if(hovered.current)m.setFeatureState({source:BOUNDARY_SOURCE,id:hovered.current},{hover:false});
    hovered.current=null;updateTooltip.current=null;m.getCanvas().style.cursor='';popup.current?.remove();
   };
   m.on('mousemove',BOUNDARY_FILL,event=>{
    const feature=event.features?.[0],id=feature?.properties?.regionId;
    const region=regions.find(r=>r.id===id);if(!region)return;
    if(hovered.current!==id){clearHover();hovered.current=id;m.setFeatureState({source:BOUNDARY_SOURCE,id},{hover:true});}
    m.getCanvas().style.cursor='pointer';
    updateTooltip.current=()=>{
     const lang=localeRef.current,root=document.createElement('div');
     const name=document.createElement('strong');name.textContent=region.name;
     const detail=document.createElement('p');detail.textContent=`${phase2Copy[lang].boundaryTooltip} · ${region.kind[lang]}`;
     const hint=document.createElement('small');hint.textContent=phase2Copy[lang].zoomBoundary;
     root.append(name,detail,hint);popup.current?.setLngLat(event.lngLat).setDOMContent(root).addTo(m);
    };
    updateTooltip.current();
   });
   m.on('mouseleave',BOUNDARY_FILL,clearHover);
   m.on('click',BOUNDARY_FILL,event=>{
    const i=regions.findIndex(r=>r.id===event.features?.[0]?.properties?.regionId);if(i>=0)selectRef.current(i);
   });
   m.on('movestart',()=>popup.current?.remove());
   markers.current=regions.map((r,i)=>{
    const button=document.createElement('button');button.className='place-marker';button.textContent=String(i+1);button.title=r.name;button.setAttribute('aria-label',r.name);button.onclick=()=>selectRef.current(i);
    return new maplibregl.Marker({element:button}).setLngLat(r.coordinate).addTo(m);
   });
  }catch{setFailed(true);}
  return()=>{markers.current.forEach(m=>m.remove());popup.current?.remove();instance?.remove();map.current=null;};
 },[]);
 useEffect(()=>{
  map.current?.getCanvas().setAttribute('aria-label',t.mapLabel);updateTooltip.current?.();
 },[locale,t.mapLabel]);
 useEffect(()=>{
  const m=map.current;if(!m)return;
  const apply=()=>{
   m.setLayoutProperty('osm','visibility',basemap?'visible':'none');
   for(const id of [BOUNDARY_FILL,BOUNDARY_OUTLINE])m.setLayoutProperty(id,'visibility',boundaries&&ready?'visible':'none');
   if(!boundaries){popup.current?.remove();if(hovered.current)m.setFeatureState({source:BOUNDARY_SOURCE,id:hovered.current},{hover:false});hovered.current=null;m.getCanvas().style.cursor='';}
  };
  // Style readiness is independent of external basemap tile success.
  if(m.getLayer(BOUNDARY_FILL))apply();else m.once('style.load',apply);
  return()=>{m.off('style.load',apply);};
 },[basemap,boundaries,ready]);
 useEffect(()=>{
  const m=map.current;if(!m||dataset?.status!=='ready')return;
  const apply=()=>{
   (m.getSource(BOUNDARY_SOURCE) as maplibregl.GeoJSONSource).setData(dataset.collection);
   m.fitBounds(collectionBounds(dataset.collection),{padding:45,duration:0});
   m.setFeatureState({source:BOUNDARY_SOURCE,id:regions[selectedRef.current].id},{selected:true});
  };
  if(m.getLayer(BOUNDARY_FILL))apply();else m.once('style.load',apply);
  return()=>{m.off('style.load',apply);};
 },[dataset]);
 useEffect(()=>{
  markers.current.forEach((m,i)=>{m.getElement().style.display=points?'':'none';m.getElement().classList.toggle('selected',i===selected);});
  const m=map.current;if(m?.getLayer(BOUNDARY_FILL))regions.forEach((r,i)=>m.setFeatureState({source:BOUNDARY_SOURCE,id:r.id},{selected:i===selected}));
 },[points,selected]);
 useEffect(()=>{map.current?.resize();},[expanded]);
 useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(false);};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[]);
 const reset=()=>{if(dataset?.status==='ready')map.current?.fitBounds(collectionBounds(dataset.collection),{padding:45});else map.current?.flyTo({center:[110.36,-7.8],zoom:10.5});};
 return <section id="map" className="map-section section"><div className="section-heading"><div><span className="eyebrow">{t.live}</span><h2>{t.mapTitle}</h2><p>{t.mapIntro}</p></div><span className="pill"><span className="status-dot"/>{t.pilot}</span></div>
 <div className={`map-workspace ${expanded?'expanded':''}`}><aside className="map-sidebar"><h3>{t.places}</h3><p className="small muted">{t.regionLabel}</p><div className="place-list">{regions.map((r,i)=><button key={r.id} className={`place-option ${selected===i?'active':''}`} onClick={()=>selectRegion(i)} aria-pressed={selected===i}><span className="place-number">0{i+1}</span><span><strong>{r.name}</strong><small>{r.kind[locale]}</small></span><MapPin size={16}/></button>)}</div><h3>{t.layers}</h3><label className="check"><input type="checkbox" checked={basemap} onChange={e=>{setBasemap(e.target.checked);if(e.target.checked){setError(false);(map.current?.getSource('osm') as maplibregl.RasterTileSource|undefined)?.setTiles(['https://tile.openstreetmap.org/{z}/{x}/{y}.png']);}}}/>{t.base}</label><label className="check"><input type="checkbox" checked={points} onChange={e=>setPoints(e.target.checked)}/>{t.points}</label><label className="check"><input type="checkbox" checked={ready&&boundaries} disabled={!ready} onChange={e=>setBoundaries(e.target.checked)}/>{g.boundaries}</label><p className="boundary-status" role="status">{boundaryError?g.boundaryFailed:!dataset?g.boundaryLoading:!ready?g.boundaryBlocked:g.hoverHelp}</p><div className="future-layers"><h3>{g.futureLayers}</h3>{rasterLayers.map(layer=><label className="check" key={layer.id}><input type="checkbox" checked={false} disabled/>{layer.title[locale]}</label>)}</div><div className="map-note">{ready?g.boundaryNote:t.note}</div></aside>
 <div className="map-panel"><div ref={container} className="map-canvas" role="region" aria-label={t.mapLabel}/><div className="map-tools"><button aria-label={g.zoomIn} onClick={()=>map.current?.zoomIn()}><Plus size={19}/></button><button aria-label={g.zoomOut} onClick={()=>map.current?.zoomOut()}><Minus size={19}/></button><button title={t.reset} aria-label={t.reset} onClick={reset}><RotateCcw size={18}/></button><button aria-label={expanded?t.exitFullscreen:t.fullscreen} title={expanded?t.exitFullscreen:t.fullscreen} onClick={()=>setExpanded(!expanded)}><Expand size={18}/></button></div>
 {(failed||(error&&basemap))&&<div className="map-alert" role="status">{failed?t.mapFailed:t.mapError}</div>}
 <div className="map-selection"><span className="eyebrow">{t.selected}</span><h3>{regions[selected].name}</h3><p>{regions[selected].kind[locale]} · {ready?g.boundaryTooltip:t.coordinates}</p>{ready&&<p>{g.boundaryVersion}: {dataset.provenance.boundaryYear} · {dataset.provenance.release}</p>}<a href={regions[selected].source} target="_blank" rel="noreferrer">{t.source}<ExternalLink size={13}/></a></div></div></div>
 {ready&&<div className="boundary-attribution"><p>{dataset.provenance.attribution}</p><a href={dataset.provenance.licenseUrl} target="_blank" rel="noreferrer">CC BY 4.0</a><p>{dataset.provenance.changes}</p><a href={dataset.provenance.metadataUrl} target="_blank" rel="noreferrer">{g.sourceDetails}</a></div>}</section>;
}
