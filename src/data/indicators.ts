import populationFile from './population.json' with {type:'json'};
import {regionIds,type RegionId} from './geospatial.ts';
export interface PopulationObservation {
 regionId:RegionId;indicatorId:'population';value:number;unit:'persons';year:number;
 referenceDate:string;definitionId:string;definition:string;sourceUrl:string;sourceTitle:string;
 table:string;retrievedAt:string;publisher:'BPS';geographyVersion:string;evidenceFile:string;
}
export interface PopulationDataset {status:'blocked'|'ready';reason?:string;observations:PopulationObservation[]}
export function validatePopulationDataset(input:unknown):PopulationDataset {
 if(typeof input!=='object'||input===null)throw new Error('Invalid population dataset');
 const d=input as PopulationDataset;
 if(d.status==='blocked'&&d.reason==='source-access'&&Array.isArray(d.observations)&&d.observations.length===0)return d;
 if(d.status!=='ready'||!Array.isArray(d.observations)||d.observations.length!==3)throw new Error('Expected a complete three-region BPS population series');
 const ids=new Set<string>();
 for(const o of d.observations){
  if(!o||!regionIds.includes(o.regionId)||ids.has(o.regionId)||o.publisher!=='BPS'||o.indicatorId!=='population'||o.unit!=='persons'||!Number.isSafeInteger(o.value)||o.value<=0||!Number.isInteger(o.year)||o.year<2000||o.year>new Date().getFullYear())throw new Error('Invalid population observation');
  ids.add(o.regionId);
  if(!['referenceDate','definitionId','definition','sourceTitle','table','retrievedAt','geographyVersion','evidenceFile'].every(k=>typeof o[k as keyof PopulationObservation]==='string'&&String(o[k as keyof PopulationObservation]).trim().length>0))throw new Error('Missing BPS provenance');
  let u:URL;try{u=new URL(o.sourceUrl);}catch{throw new Error('Invalid BPS URL');}
  if(u.protocol!=='https:'||!(u.hostname==='bps.go.id'||u.hostname.endsWith('.bps.go.id')))throw new Error('Expected primary BPS source');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(o.referenceDate)||Number(o.referenceDate.slice(0,4))!==o.year||!/^\d{4}-\d{2}-\d{2}$/.test(o.retrievedAt))throw new Error('Invalid reference date');
 }
 const first=d.observations[0];
 if(d.observations.some(o=>o.year!==first.year||o.referenceDate!==first.referenceDate||o.definitionId!==first.definitionId||o.definition!==first.definition||o.unit!==first.unit||o.geographyVersion!==first.geographyVersion))throw new Error('Incompatible reference periods, definitions or geographies');
 return d;
}
export const populationDataset=validatePopulationDataset(populationFile);
export const populationByRegion=new Map(populationDataset.observations.map(o=>[o.regionId,o]));
