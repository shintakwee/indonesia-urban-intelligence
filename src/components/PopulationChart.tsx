import type {Locale} from '../data/catalog';
import {regions} from '../data/catalog';
import {populationDataset,populationByRegion} from '../data/indicators';
import type {RegionId} from '../data/geospatial';
import {phase2Copy} from '../phase2-i18n';
export default function PopulationChart({locale,selected}:{locale:Locale;selected:RegionId[]}){
 const t=phase2Copy[locale];
 // Require a verified, compatible complete series. Never synthesize values or zero-fill gaps.
 if(populationDataset.status!=='ready')return <section className="chart-empty" aria-labelledby="population-chart-title"><h2 id="population-chart-title">{t.populationChart}</h2><p>{t.populationBlocked}</p><a href="#sources">{t.sourceDetails}</a></section>;
 const series=selected.map(id=>populationByRegion.get(id)!);
 const maximum=Math.max(...series.map(o=>o.value));const formatter=new Intl.NumberFormat(locale==='id'?'id-ID':'en-GB');
 const first=series[0];
 return <figure className="population-chart"><figcaption id="population-chart-title"><h2>{t.populationChart} · {first.year}</h2><p>{first.definition} · {first.referenceDate}</p></figcaption><div role="img" aria-labelledby="population-chart-title" aria-label={series.map(o=>`${regions.find(r=>r.id===o.regionId)!.name}: ${formatter.format(o.value)} ${t.persons}`).join('; ')}>{series.map(o=><div className="chart-row" key={o.regionId}><span>{regions.find(r=>r.id===o.regionId)!.name}</span><div className="chart-track"><div className="chart-bar" style={{width:`${o.value/maximum*100}%`}}/></div><strong>{formatter.format(o.value)}</strong></div>)}</div><p className="small">{t.zeroBaseline}</p><div className="chart-sources">{series.map(o=><a href={o.sourceUrl} target="_blank" rel="noreferrer" key={o.regionId}>{o.sourceTitle} · {o.table}</a>)}</div></figure>;
}
