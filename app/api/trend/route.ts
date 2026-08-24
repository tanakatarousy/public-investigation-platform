import {listContent,runtimeEnv} from "../../server/platform-db";
import {visitorIdentity} from "../../server/analytics-db";

export const dynamic="force-dynamic";

async function digest(input:string,secret:string){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(input));
 return [...new Uint8Array(sig)].map(value=>value.toString(16).padStart(2,"0")).join("");
}

export async function GET(){
 try{
  const env=await runtimeEnv();
  if(env.TREND_PUBLIC_ENABLED==="false"||!env.DB)return Response.json({enabled:false,metrics:[]});
  const since=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const rows=await env.DB.prepare("SELECT entity_type,entity_id,SUM(sampled_views) AS views FROM trend_metrics_daily WHERE day>=? GROUP BY entity_type,entity_id ORDER BY views DESC LIMIT 50").bind(since).all<Record<string,unknown>>();
  return Response.json({enabled:true,metrics:rows.results},{headers:{"cache-control":"public, max-age=60, stale-while-revalidate=300"}});
 }catch{return Response.json({enabled:false,metrics:[]})}
}

export async function POST(req:Request){
 try{
  const env=await runtimeEnv();
  if(env.VIEW_METRICS_ENABLED!=="true"||!env.DB)return Response.json({accepted:false,reason:"disabled"});
  if(!env.TREND_HMAC_SECRET)return Response.json({accepted:false,reason:"unconfigured"},{status:503});
  if(!(req.headers.get("content-type")||"").includes("application/json"))return Response.json({accepted:false,reason:"invalid content type"},{status:415});
  const payload=await req.json() as {eventType?:"view"|"search";entityType?:string;entityId?:string;browserId?:string;dwellSeconds?:number};
  const isSearch=payload.eventType==="search",dwell=isSearch?0:Number(payload.dwellSeconds);
  if(!payload.entityType||!payload.entityId||!payload.browserId||payload.browserId.length>100||(isSearch?payload.entityType!=="wanted":dwell<8||dwell>86400))return Response.json({accepted:false,reason:"invalid"},{status:400});
  const valid=(await listContent(true)).some(record=>record.kind===payload.entityType&&record.slug===payload.entityId);
  if(!valid)return Response.json({accepted:false,reason:"unknown entity"},{status:400});
  const visitor=await visitorIdentity(payload.browserId),excluded=await env.DB.prepare("SELECT excluded FROM analytics_visitors WHERE visitor_hash=?").bind(visitor.hash).first<{excluded:number}>();if(Boolean(excluded?.excluded))return Response.json({accepted:false,reason:"excluded"});
  const metricType=isSearch?"wanted_search":payload.entityType;
  const rate=Math.max(0,Math.min(1,Number(env.TREND_SAMPLE_RATE||"0.1")));
  const sampleKey=await digest(`${payload.browserId}:${metricType}:${payload.entityId}`,env.TREND_HMAC_SECRET);
  if(parseInt(sampleKey.slice(0,8),16)/0xffffffff>rate)return Response.json({accepted:false,reason:"not sampled"});
  const day=new Date().toISOString().slice(0,10),dedupe=await digest(`${day}:${payload.browserId}:${metricType}:${payload.entityId}`,env.TREND_HMAC_SECRET);
  if(await env.DB.prepare("SELECT id FROM trend_samples WHERE day=? AND dedupe_hash=?").bind(day,dedupe).first())return Response.json({accepted:false,reason:"duplicate"});
  const id=crypto.randomUUID();
  try{await env.DB.prepare("INSERT INTO trend_samples (id,day,entity_type,entity_id,dedupe_hash,dwell_seconds,created_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)").bind(id,day,metricType,payload.entityId,dedupe,Math.floor(dwell)).run()}catch{return Response.json({accepted:false,reason:"duplicate"})}
  const metricId=`${day}:${metricType}:${payload.entityId}`;
  await env.DB.prepare("INSERT INTO trend_metrics_daily (id,day,entity_type,entity_id,sampled_views,updated_at) VALUES (?,?,?,?,1,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET sampled_views=sampled_views+1,updated_at=CURRENT_TIMESTAMP").bind(metricId,day,metricType,payload.entityId).run();
  return Response.json({accepted:true});
 }catch{return Response.json({accepted:false,reason:"unavailable"},{status:503})}
}
