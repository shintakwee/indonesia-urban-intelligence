import type {BoundaryCollection} from './geospatial';
export const SUPPLIED_BOUNDARY_ID='IDN-ADM2-22746128';
export const SUPPLIED_BOUNDARY_SHA256='ba842977bb78f645c1d05a05132a90a0fbfd9a258ba652c6560a89ffd36ff12c';
export const SUPPLIED_BOUNDARY_PATH='docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson';
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const expected=[
 {id:'yogyakarta',name:'Kota Yogyakarta',shapeId:'22746128B9761158776103'},
 {id:'sleman',name:'Sleman',shapeId:'22746128B68764842139539'},
 {id:'bantul',name:'Bantul',shapeId:'22746128B15956982783625'},
] as const;
/** Checks the actual upload's names, identifiers and CRS declaration without inventing metadata.
 * Geometry/ring validation is performed by validateBoundaryDataset; topology by Shapely.
 * Matching IDs establish internal consistency, not independent upstream equivalence.
 */
export function normalizeSuppliedBoundaries(input:unknown):BoundaryCollection {
 if(!record(input)||input.type!=='FeatureCollection'||!Array.isArray(input.features)||input.features.length!==3)throw new Error('Expected exactly three uploaded administrative features');
 if(input.crs!==undefined){
  const crs=input.crs;
  if(!record(crs)||crs.type!=='name'||!record(crs.properties)||!['urn:ogc:def:crs:OGC:1.3:CRS84','urn:ogc:def:crs:EPSG::4326','EPSG:4326','OGC:CRS84'].includes(String(crs.properties.name)))throw new Error('Unsupported or ambiguous CRS; WGS84 longitude/latitude required');
 }
 const features=expected.map(region=>{
  const matches=(input.features as unknown[]).filter(f=>record(f)&&record(f.properties)&&f.properties.shapeName===region.name);
  if(matches.length!==1)throw new Error(`Missing or ambiguous administrative name: ${region.name}`);
  const f=matches[0] as Record<string,unknown>,p=f.properties as Record<string,unknown>;
  if(f.type!=='Feature'||p.shapeGroup!=='IDN'||p.shapeType!=='ADM2'||p.shapeID!==region.shapeId||!String(p.shapeID).startsWith('22746128B'))throw new Error(`Supplied feature does not match ${SUPPLIED_BOUNDARY_ID}: ${region.name}`);
  if(!record(f.geometry)||!['Polygon','MultiPolygon'].includes(String(f.geometry.type)))throw new Error('Expected administrative polygon geometry');
  return {type:'Feature',id:region.id,properties:{...p,regionId:region.id,name:region.name,sourceShapeId:region.shapeId},geometry:f.geometry};
 });
 return {type:'FeatureCollection',features} as unknown as BoundaryCollection;
}
