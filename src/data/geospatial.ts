import type {Feature,FeatureCollection,MultiPolygon,Polygon,Position} from 'geojson';
import type {Locale} from './catalog';

export const regionIds = ['yogyakarta', 'sleman', 'bantul'] as const;
export type RegionId = typeof regionIds[number];
export type BoundaryFeature = Feature<Polygon | MultiPolygon, {regionId: RegionId; name: string; sourceShapeId: string}>;
export type BoundaryCollection = FeatureCollection<Polygon | MultiPolygon, BoundaryFeature['properties']>;
export interface BoundaryProvenance {
 provider: 'geoBoundaries'; release: string; boundaryYear: string; boundaryId: string;
 sourceUrl: string; metadataUrl: string; license: 'CC-BY-4.0'; licenseUrl: string;
 attribution: string; retrievedAt: string; sourceSha256: string; changes: string;
}
export type BoundaryDataset = {status:'blocked';reason:'source-access';provenance:null;collection:null} |
 {status:'ready';provenance:BoundaryProvenance;collection:BoundaryCollection};
export type Bbox = [[number,number],[number,number]];
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const nonempty=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const https=(v:unknown):v is string=>{try{return typeof v==='string'&&new URL(v).protocol==='https:';}catch{return false;}};
export function boundaryBounds(feature:BoundaryFeature):Bbox {
 const bounds:Bbox=[[Infinity,Infinity],[-Infinity,-Infinity]];
 const add=(position:Position)=>{bounds[0][0]=Math.min(bounds[0][0],position[0]);bounds[0][1]=Math.min(bounds[0][1],position[1]);bounds[1][0]=Math.max(bounds[1][0],position[0]);bounds[1][1]=Math.max(bounds[1][1],position[1]);};
 const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
 polygons.forEach(p=>p.forEach(r=>r.forEach(add)));
 return bounds;
}
export function collectionBounds(collection:BoundaryCollection):Bbox {
 const boxes=collection.features.map(boundaryBounds);
 return [[Math.min(...boxes.map(b=>b[0][0])),Math.min(...boxes.map(b=>b[0][1]))],[Math.max(...boxes.map(b=>b[1][0])),Math.max(...boxes.map(b=>b[1][1]))]];
}
export function validateBoundaryDataset(value:unknown):BoundaryDataset {
 if(!record(value))throw new Error('Invalid boundary dataset');
 if(value.status==='blocked'&&value.reason==='source-access'&&value.provenance===null&&value.collection===null)return value as BoundaryDataset;
 const p=value.provenance;
 if(value.status!=='ready'||!record(p)||p.provider!=='geoBoundaries'||p.license!=='CC-BY-4.0'||p.licenseUrl!=='https://creativecommons.org/licenses/by/4.0/'||!['release','boundaryYear','boundaryId','attribution','retrievedAt','changes'].every(k=>nonempty(p[k]))||!https(p.sourceUrl)||!https(p.metadataUrl)||!/^\d{4}-\d{2}-\d{2}$/.test(String(p.retrievedAt))||!(/^[a-f0-9]{64}$/).test(String(p.sourceSha256)))throw new Error('Missing boundary provenance');
 const c=value.collection;
 if(!record(c)||c.type!=='FeatureCollection'||!Array.isArray(c.features)||c.features.length!==3)throw new Error('Expected three study boundaries');
 const seen=new Set<string>();
 for(const f of c.features){
  if(!record(f)||f.type!=='Feature'||!record(f.properties)||!record(f.geometry))throw new Error('Invalid boundary feature');
  const id=f.properties.regionId;
  if(!regionIds.includes(id as RegionId)||seen.has(String(id))||f.id!==id||!nonempty(f.properties.name)||!nonempty(f.properties.sourceShapeId))throw new Error('Invalid region identity');
  seen.add(String(id));
  const g=f.geometry;
  if(g.type!=='Polygon'&&g.type!=='MultiPolygon')throw new Error('Expected polygon geometry');
  const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  if(!Array.isArray(polygons)||polygons.length===0)throw new Error('Empty polygon');
  for(const polygon of polygons){
   if(!Array.isArray(polygon)||polygon.length===0)throw new Error('Empty rings');
   for(const ring of polygon){
    if(!Array.isArray(ring)||ring.length<4)throw new Error('Invalid ring');
    for(const xy of ring){
     if(!Array.isArray(xy)||xy.length<2||!xy.slice(0,2).every(n=>typeof n==='number'&&Number.isFinite(n))||xy[0]<109.8||xy[0]>110.9||xy[1]<-8.2||xy[1]>-7.4)throw new Error('Coordinates outside Yogyakarta study envelope');
    }
    if(ring[0][0]!==ring.at(-1)[0]||ring[0][1]!==ring.at(-1)[1])throw new Error('Unclosed ring');
   }
  }
 }
 return value as unknown as BoundaryDataset;
}
export async function loadBoundaryDataset(signal:AbortSignal):Promise<BoundaryDataset> {
 const response=await fetch(`${import.meta.env.BASE_URL}data/boundaries.json`,{signal});
 if(!response.ok)throw new Error('Boundary request failed');
 return validateBoundaryDataset(await response.json());
}

// No URLs or measurements exist until a verified raster has been ingested.
// NDVI uses unitless [-1,1]; LST must explicitly use °C, with scale/offset applied upstream.
export interface RasterProvenance {
 sourceUrl:string;license:string;acquiredAt:string;processedAt:string;method:string;
 cloudMask:string;nodata:number;scale:number;offset:number;crs:'EPSG:3857';
}
interface RasterLayerBase {id:'ndvi'|'lst';title:Record<Locale,string>;unit:'1'|'°C'}
export type RasterLayerDefinition=RasterLayerBase & (
 {status:'planned';tiles?:never;provenance?:never} |
 {status:'ready';tiles:[string,...string[]];minzoom:number;maxzoom:number;provenance:RasterProvenance}
);
export const rasterLayers:readonly RasterLayerDefinition[]=[
 {id:'ndvi',title:{id:'NDVI · belum tersedia',en:'NDVI · not yet available'},status:'planned',unit:'1'},
 {id:'lst',title:{id:'Suhu permukaan lahan · belum tersedia',en:'Land surface temperature · not yet available'},status:'planned',unit:'°C'},
];
