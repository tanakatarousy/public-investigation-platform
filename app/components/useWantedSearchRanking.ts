"use client";

import {useEffect,useMemo,useState} from "react";
import type {Subject} from "../data/platform";

type Metric={entity_type:string;entity_id:string;views:number};
let metricRequest:Promise<Metric[]>|null=null;

function loadMetrics(){
 if(!metricRequest)metricRequest=fetch("/api/trend",{cache:"no-store"}).then(response=>response.ok?response.json():{metrics:[]}).then((value:{metrics?:Metric[]})=>value.metrics||[]).catch(()=>[]);
 return metricRequest;
}

export function sortByWantedSearch<T extends Pick<Subject,"slug">>(items:T[],metrics:Metric[]){
 const ranks=new Map(metrics.filter(metric=>metric.entity_type==="wanted_search").map(metric=>[metric.entity_id,Number(metric.views)||0]));
 return items.map((item,index)=>({item,index,rank:ranks.get(item.slug)||0})).sort((a,b)=>b.rank-a.rank||a.index-b.index).map(row=>row.item);
}

export function useWantedSearchRanking<T extends Pick<Subject,"slug">>(items:T[]){
 const [metrics,setMetrics]=useState<Metric[]>([]);
 useEffect(()=>{let active=true;const refresh=()=>loadMetrics().then(value=>active&&setMetrics(value));refresh();window.addEventListener("wanted-search-rank-updated",refresh);return()=>{active=false;window.removeEventListener("wanted-search-rank-updated",refresh)}},[]);
 return useMemo(()=>sortByWantedSearch(items,metrics),[items,metrics]);
}

export function recordWantedSearch(entityId:string){
 if(typeof window==="undefined")return;
 let browserId=localStorage.getItem("trend-browser-id");
 if(!browserId){browserId=crypto.randomUUID();localStorage.setItem("trend-browser-id",browserId)}
 fetch("/api/trend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventType:"search",entityType:"wanted",entityId,browserId})}).then(response=>response.json()).then((value:{accepted?:boolean})=>{if(value.accepted){metricRequest=null;window.dispatchEvent(new Event("wanted-search-rank-updated"))}}).catch(()=>{});
}
