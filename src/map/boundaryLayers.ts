import type {LayerSpecification} from 'maplibre-gl';
export const BOUNDARY_SOURCE='study-boundaries';
export const BOUNDARY_FILL='study-boundaries-fill';
export const BOUNDARY_OUTLINE='study-boundaries-outline';
export const boundaryLayers:LayerSpecification[]=[
 {id:BOUNDARY_FILL,type:'fill',source:BOUNDARY_SOURCE,paint:{
  'fill-color':['case',['boolean',['feature-state','hover'],false],'#e8ce6a',['boolean',['feature-state','selected'],false],'#70975b','#4c9181'],
  'fill-opacity':['case',['boolean',['feature-state','hover'],false],0.65,['boolean',['feature-state','selected'],false],0.4,0.18],
 }},
 {id:BOUNDARY_OUTLINE,type:'line',source:BOUNDARY_SOURCE,paint:{
  'line-color':['case',['boolean',['feature-state','selected'],false],'#173f35','#457465'],
  'line-width':['case',['boolean',['feature-state','hover'],false],3,['boolean',['feature-state','selected'],false],2.5,1.5],
 }},
];
