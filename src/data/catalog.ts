// Coordinates locate study-area reference points only, never administrative extents.
// Approximate WGS84 locations are navigation aids, not statistical measurements.
export const regions = [
 {id:'yogyakarta',name:'Kota Yogyakarta',coordinate:[110.3695,-7.7956] as [number,number], kind:{id:'Kota',en:'City'}, source:'https://jogjakota.bps.go.id'},
 {id:'sleman',name:'Sleman',coordinate:[110.3556,-7.7167] as [number,number],kind:{id:'Kabupaten',en:'Regency'},source:'https://slemankab.bps.go.id'},
 {id:'bantul',name:'Bantul',coordinate:[110.3289,-7.8879] as [number,number],kind:{id:'Kabupaten',en:'Regency'},source:'https://bantulkab.bps.go.id'},
];
export type Locale = 'id'|'en';
export const sources = [
 {name:'Badan Pusat Statistik',status:'blocked',url:'https://www.bps.go.id',type:{id:'Statistik resmi',en:'Official statistics'},description:{id:'Sumber primer penduduk yang dituju. Akses diblokir; tahun, definisi sensus/proyeksi, dan tabel untuk ketiga wilayah belum dapat diverifikasi.',en:'Intended primary population source. Access is blocked; matching years, census/projection definitions, and tables for the three regions have not been verified.'}},
 {name:'Badan Informasi Geospasial',status:'blocked',url:'https://tanahair.indonesia.go.id',type:{id:'Geospasial resmi',en:'Official geospatial data'},description:{id:'Kandidat sumber batas administrasi dan peta dasar. Batas resmi belum tersedia di aplikasi.',en:'Candidate source for administrative boundaries and base mapping. Official boundaries are not yet available in the application.'}},
 {name:'OpenStreetMap',status:'online',url:'https://www.openstreetmap.org/copyright',type:{id:'Peta komunitas',en:'Community mapping'},description:{id:'Peta dasar daring, © kontributor OpenStreetMap, ODbL. Ketersediaan bergantung pada jaringan; bukan sumber batas resmi.',en:'Online basemap, © OpenStreetMap contributors, ODbL. Availability depends on network access; not an official boundary source.'}},
 {name:'Copernicus Data Space',status:'candidate',url:'https://dataspace.copernicus.eu',type:{id:'Penginderaan jauh',en:'Remote sensing'},description:{id:'Kandidat citra Sentinel untuk analisis tutupan lahan mendatang. Belum ada analisis citra yang diintegrasikan.',en:'Candidate Sentinel imagery for future land-cover analysis. No imagery analysis has been integrated.'}},
 {name:'geoBoundaries · gbOpen ADM2',status:'blocked',url:'https://github.com/wmgeolab/geoBoundaries/tree/1289e40e366c7b320550be1ee0614a9472d572d4/releaseData/gbOpen/IDN/ADM2',type:{id:'Batas penelitian terbuka',en:'Open research boundaries'},description:{id:'Target rilis v6.0.0, IDN ADM2. Lisensi repositori CC BY 4.0 sudah diperiksa; geometri, metadata, tahun batas, dan kutipan khusus dataset belum dapat diunduh. Belum diintegrasikan.',en:'Target release v6.0.0, IDN ADM2. Repository CC BY 4.0 license inspected; geometry, metadata, boundary year, and dataset-specific citation could not be downloaded. Not yet integrated.'}},
];
