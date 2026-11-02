// Coordinates locate study-area reference points only, never administrative extents.
// Approximate WGS84 locations are navigation aids, not statistical measurements.
export const regions = [
 {id:'yogyakarta',name:'Kota Yogyakarta',coordinate:[110.3695,-7.7956] as [number,number], kind:{id:'Kota',en:'City'}, source:'https://jogjakota.bps.go.id'},
 {id:'sleman',name:'Sleman',coordinate:[110.3556,-7.7167] as [number,number],kind:{id:'Kabupaten',en:'Regency'},source:'https://slemankab.bps.go.id'},
 {id:'bantul',name:'Bantul',coordinate:[110.3289,-7.8879] as [number,number],kind:{id:'Kabupaten',en:'Regency'},source:'https://bantulkab.bps.go.id'},
];
export type Locale = 'id'|'en';
export interface IndicatorObservation {
 regionId: string; indicatorId: string; value: number; unit: string;
 year: number; sourceUrl: string; sourceTitle: string; retrievedAt: string;
 geographyVersion: string; methodology: string;
}
// Deliberately empty until observations have been checked against primary publications.
export const observations: IndicatorObservation[] = [];
export const sources = [
 {name:'Badan Pusat Statistik',url:'https://www.bps.go.id',type:{id:'Statistik resmi',en:'Official statistics'},description:{id:'Kandidat sumber kependudukan dan indikator sosial ekonomi. Belum diimpor atau diverifikasi dalam aplikasi.',en:'Candidate source for population and socioeconomic indicators. Not yet imported or verified in this application.'}},
 {name:'Badan Informasi Geospasial',url:'https://tanahair.indonesia.go.id',type:{id:'Geospasial resmi',en:'Official geospatial data'},description:{id:'Kandidat sumber batas administrasi dan peta dasar. Batas resmi belum tersedia di aplikasi.',en:'Candidate source for administrative boundaries and base mapping. Official boundaries are not yet available in the application.'}},
 {name:'OpenStreetMap',url:'https://www.openstreetmap.org/copyright',type:{id:'Peta komunitas',en:'Community mapping'},description:{id:'Peta dasar daring, © kontributor OpenStreetMap, ODbL. Ketersediaan bergantung pada jaringan; bukan sumber batas resmi.',en:'Online basemap, © OpenStreetMap contributors, ODbL. Availability depends on network access; not an official boundary source.'}},
 {name:'Copernicus Data Space',url:'https://dataspace.copernicus.eu',type:{id:'Penginderaan jauh',en:'Remote sensing'},description:{id:'Kandidat citra Sentinel untuk analisis tutupan lahan mendatang. Belum ada analisis citra yang diintegrasikan.',en:'Candidate Sentinel imagery for future land-cover analysis. No imagery analysis has been integrated.'}},
];
