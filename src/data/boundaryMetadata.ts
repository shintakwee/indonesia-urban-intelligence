// Dataset-specific policy for the IDN ADM2 source identified by the independent review.
// No GADM/GAUL or mutable unpinned geometry links are accepted.
export const BOUNDARY_METADATA_URL='https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/';
export const BOUNDARY_LICENSE='CC-BY-3.0-IGO' as const;
export const BOUNDARY_LICENSE_URL='https://creativecommons.org/licenses/by/3.0/igo/';
const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
export function validateBoundaryMetadata(input:unknown){
 if(!object(input)||input.boundaryISO!=='IDN'||input.boundaryType!=='ADM2'||String(input.boundaryYearRepresented)!=='2020'||typeof input.boundaryID!=='string'||!input.boundaryID.startsWith('IDN-ADM2-'))throw new Error('Expected original IDN ADM2 API metadata representing 2020');
 const license=String(input.boundaryLicense??'');
 if(!/^(?:CC BY 3\.0 IGO|Creative Commons Attribution 3\.0 (?:IGO|Intergovernmental Organizations|Intergovernmental Organisations)(?: \(CC BY 3\.0 IGO\))?)$/i.test(license.trim()))throw new Error('Expected the dataset-specific CC BY 3.0 IGO license; other licenses require review');
 const source=input.boundarySource;
 if(!(typeof source==='string'&&source.trim())&&!(Array.isArray(source)&&source.length&&source.every(s=>typeof s==='string'&&s.trim())))throw new Error('Missing original boundary-source attribution');
 return {boundaryId:input.boundaryID,boundaryYear:'2020',sourceCredit:Array.isArray(source)?source.join('; '):String(source),raw:input};
}
export function validateGeometryIdentity(metadata:unknown,url:string,resolvedCommit?:string){
 const m=validateBoundaryMetadata(metadata);
 if(url!==m.raw.simplifiedGeometryGeoJSON&&url!==m.raw.gjDownloadURL)throw new Error('Geometry URL is not linked by the supplied API metadata');
 let parsed:URL;try{parsed=new URL(url);}catch{throw new Error('Invalid geometry URL');}
 if(parsed.protocol!=='https:')throw new Error('HTTPS geometry source required');
 const prefix=parsed.hostname==='github.com'?'/wmgeolab/geoBoundaries/raw/':parsed.hostname==='raw.githubusercontent.com'?'/wmgeolab/geoBoundaries/':parsed.hostname==='media.githubusercontent.com'?'/media/wmgeolab/geoBoundaries/':null;
 if(!prefix||!parsed.pathname.startsWith(prefix)||parsed.search||parsed.hash)throw new Error('Expected the official geoBoundaries repository');
 const path=parsed.pathname.slice(prefix.length);
 const match=/^([a-f0-9]{7,40})\/releaseData\/gbOpen\/IDN\/ADM2\/geoBoundaries-IDN-ADM2(_simplified)?\.geojson$/.exec(path);
 if(!match)throw new Error('An immutable commit-pinned IDN ADM2 geometry URL is required');
 const commit=resolvedCommit??match[1];
 if(!/^[a-f0-9]{40}$/.test(commit)||!commit.startsWith(match[1]))throw new Error('The receipt must include the externally verified full commit resolving the metadata URL');
 return {...m,sourceCommit:commit,resolvedGeometryUrl:url.replace('/'+match[1]+'/', '/'+commit+'/'),simplified:Boolean(match[2])};
}
