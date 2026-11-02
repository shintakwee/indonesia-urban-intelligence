import populationFile from './population.json' with {type:'json'};
import {regionIds,type RegionId} from './geospatial.ts';
export const SP2020_URL='https://sensus.bps.go.id/topik/tabular/sp2020/1/15/0';
export interface PopulationObservation {
 regionId:RegionId;indicatorId:'population';value:number;unit:'persons';year:number;
 referencePeriod:string;definitionId:string;definition:{id:string;en:string};sourceUrl:string;sourceTitle:string;
 table:string;recordedAt:string;publisher:'BPS';geographyVersion:string;evidenceFile:string;
 verification:'independent-review-supplied';
}
export interface PopulationDataset {
 status:'blocked'|'ready';reason?:string;observations:PopulationObservation[];
 provenance?:{verification:'independent-review-supplied';sourceAccess:'blocked-in-environment';recordedAt:string;sourceUrl:string;reuseStatus:'terms-not-retrieved';evidenceFile:string};
}
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const text=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
const validDate=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validatePopulationDataset(input:unknown):PopulationDataset {
 if(!isRecord(input))throw new Error('Invalid population dataset');
 if(input.status==='blocked'&&input.reason==='source-access'&&Array.isArray(input.observations)&&input.observations.length===0)return input as unknown as PopulationDataset;
 if(input.status!=='ready'||!Array.isArray(input.observations)||input.observations.length!==3)throw new Error('Expected a complete three-region BPS population series');
 const provenance=input.provenance;
 if(!isRecord(provenance)||provenance.verification!=='independent-review-supplied'||provenance.sourceAccess!=='blocked-in-environment'||provenance.sourceUrl!==SP2020_URL||provenance.reuseStatus!=='terms-not-retrieved'||!validDate(provenance.recordedAt)||!text(provenance.evidenceFile))throw new Error('Missing independent-review provenance');
 const ids=new Set<string>();
 for(const value of input.observations){
  if(!isRecord(value))throw new Error('Invalid population observation');
  const o=value;
  if(!regionIds.includes(o.regionId as RegionId)||ids.has(String(o.regionId))||o.publisher!=='BPS'||o.indicatorId!=='population'||o.unit!=='persons'||typeof o.value!=='number'||!Number.isSafeInteger(o.value)||o.value<=0||o.year!==2020)throw new Error('Invalid population observation');
  ids.add(String(o.regionId));
  if(!['definitionId','sourceTitle','table','geographyVersion','evidenceFile'].every(k=>text(o[k]))||!isRecord(o.definition)||!text(o.definition.id)||!text(o.definition.en)||o.verification!==provenance.verification||o.evidenceFile!==provenance.evidenceFile||o.recordedAt!==provenance.recordedAt)throw new Error('Missing BPS provenance');
  if(o.sourceUrl!==SP2020_URL)throw new Error('Expected primary SP2020 source');
  // September is the precision provided by the review. Do not invent a reference day.
  if(o.referencePeriod!=='2020-09')throw new Error('Incompatible reference period');
 }
 const rows=input.observations as unknown as PopulationObservation[],first=rows[0];
 if(rows.some(o=>o.definitionId!==first.definitionId||o.definition.id!==first.definition.id||o.definition.en!==first.definition.en||o.geographyVersion!==first.geographyVersion))throw new Error('Incompatible definitions or geographies');
 return input as unknown as PopulationDataset;
}
export const populationDataset=validatePopulationDataset(populationFile);
export const populationByRegion=new Map(populationDataset.observations.map(o=>[o.regionId,o]));
export function validatePopulationEvidence(observation:PopulationObservation,evidence:unknown):void {
 if(!isRecord(evidence)||evidence.evidenceType!=='user-supplied-independent-research-review'||evidence.sourceUrl!==observation.sourceUrl||evidence.referencePeriod!==observation.referencePeriod||evidence.unit!==observation.unit||evidence.recordedAt!==observation.recordedAt||!Array.isArray(evidence.observations)||evidence.observations.length!==3)throw new Error('Population differs from supplied independently reviewed evidence');
 const rows=evidence.observations;
 if(rows.some(row=>!isRecord(row))||new Set(rows.map(row=>(row as Record<string,unknown>).regionId)).size!==3)throw new Error('Invalid independent-review region identities');
 const row=rows.find(row=>(row as Record<string,unknown>).regionId===observation.regionId) as Record<string,unknown>|undefined;
 if(row?.value!==observation.value)throw new Error('Population count differs from independent review');
}
