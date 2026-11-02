/** SYNTHETIC browser-test geometry ONLY. Not actual administrative boundaries.
 * Served exclusively by Playwright route interception; never bundled or deployed.
 * No statistical fixtures are used.
 */
import type {BoundaryDataset} from '../../src/data/geospatial';
export const syntheticBoundaries:BoundaryDataset={
 status:'ready',provenance:{provider:'geoBoundaries',release:'SYNTHETIC TEST FIXTURE',boundaryYear:'2020',boundaryId:'TEST-NOT-A-DATASET',sourceUrl:'https://example.invalid/test-geometry',metadataUrl:'https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/',license:'CC-BY-3.0-IGO',licenseUrl:'https://creativecommons.org/licenses/by/3.0/igo/',attribution:'Synthetic geometry used only by automated tests; not geoBoundaries data.',retrievedAt:'2026-11-02',sourceSha256:'0'.repeat(64),sourceCommit:'0'.repeat(40),metadataSha256:'0'.repeat(64),citationSha256:'0'.repeat(64),licenseSha256:'0'.repeat(64),receiptSha256:'0'.repeat(64),changes:'Synthetic rectangles, not administrative boundaries.'},
 collection:{type:'FeatureCollection',features:[
  {type:'Feature',id:'yogyakarta',properties:{regionId:'yogyakarta',name:'Kota Yogyakarta',sourceShapeId:'TEST-1'},geometry:{type:'Polygon',coordinates:[[[110.34,-7.82],[110.4,-7.82],[110.4,-7.77],[110.34,-7.77],[110.34,-7.82]]]}},
  {type:'Feature',id:'sleman',properties:{regionId:'sleman',name:'Sleman',sourceShapeId:'TEST-2'},geometry:{type:'Polygon',coordinates:[[[110.30,-7.76],[110.46,-7.76],[110.46,-7.61],[110.30,-7.61],[110.30,-7.76]]]}},
  {type:'Feature',id:'bantul',properties:{regionId:'bantul',name:'Bantul',sourceShapeId:'TEST-3'},geometry:{type:'MultiPolygon',coordinates:[[[[110.27,-7.99],[110.43,-7.99],[110.43,-7.84],[110.27,-7.84],[110.27,-7.99]]]]}},
 ]},
};
