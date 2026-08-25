import {cases,mapRecords,sources,subjects} from "../data/platform";

export type ContentKind="wanted"|"case"|"source"|"map";
export type StoredContent={id:string;kind:ContentKind;slug:string;title:string;payload:Record<string,unknown>;publishState:"draft"|"published"|"withdrawn"|"correction";revision:number;publishedAt:string|null;withdrawnAt:string|null;correctionNote:string|null;updatedAt:string};
export type RuntimeEnv={DB?:D1Database;BUCKET?:R2Bucket;ADMIN_PASSWORD?:string;ADMIN_SESSION_SECRET?:string;TURNSTILE_SITE_KEY?:string;TURNSTILE_SECRET?:string;TREND_HMAC_SECRET?:string;TIPS_SECRET_PEPPER?:string;TIPS_RATE_HMAC_SECRET?:string;VIEW_METRICS_ENABLED?:string;TREND_SAMPLE_RATE?:string;TREND_PUBLIC_ENABLED?:string};
let testRuntimeEnv:RuntimeEnv|undefined;

export function setRuntimeEnvForTests(value:RuntimeEnv|undefined){testRuntimeEnv=value}
export async function runtimeEnv(){if(testRuntimeEnv)return testRuntimeEnv;const mod=await import("cloudflare:workers") as unknown as {env:RuntimeEnv};return mod.env}

async function db(){const env=await runtimeEnv();if(!env.DB)throw new Error("D1 unavailable");return env.DB}

export async function ensureContentSeed(){const d1=await db();const count=await d1.prepare("SELECT COUNT(*) AS count FROM content_records").first<{count:number}>();if(Number(count?.count||0)>0)return;
 const rows=[
  ...subjects.map(x=>({id:`wanted:${x.slug}`,kind:"wanted",slug:x.slug,title:x.name,payload:x})),
  ...cases.map(x=>({id:`case:${x.slug}`,kind:"case",slug:x.slug,title:x.title,payload:x})),
  ...sources.map(x=>({id:`source:${x.id}`,kind:"source",slug:x.id,title:x.title,payload:x})),
  ...mapRecords.map(x=>({id:`map:${x.id}`,kind:"map",slug:x.id,title:x.label,payload:x})),
 ];
 await d1.batch(rows.map(r=>d1.prepare("INSERT OR IGNORE INTO content_records (id,kind,slug,title,payload,publish_state,revision,published_at,created_at,updated_at) VALUES (?,?,?,?,?,'published',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)").bind(r.id,r.kind,r.slug,r.title,JSON.stringify(r.payload))));
}

function parseRow(row:Record<string,unknown>):StoredContent{return {id:String(row.id),kind:String(row.kind) as ContentKind,slug:String(row.slug),title:String(row.title),payload:JSON.parse(String(row.payload||"{}")),publishState:String(row.publish_state) as StoredContent["publishState"],revision:Number(row.revision),publishedAt:row.published_at?String(row.published_at):null,withdrawnAt:row.withdrawn_at?String(row.withdrawn_at):null,correctionNote:row.correction_note?String(row.correction_note):null,updatedAt:String(row.updated_at)}}

export async function listContent(publishedOnly=false){await ensureContentSeed();const d1=await db();const result=await d1.prepare(publishedOnly?"SELECT * FROM content_records WHERE publish_state='published' ORDER BY kind, updated_at DESC":"SELECT * FROM content_records ORDER BY kind, updated_at DESC").all<Record<string,unknown>>();return result.results.map(parseRow)}

export async function saveContent(input:{id?:string;kind:ContentKind;slug:string;title:string;payload:Record<string,unknown>;publishState:StoredContent["publishState"];correctionNote?:string},actor:string){const d1=await db();const id=input.id||`${input.kind}:${input.slug}`;const existing=await d1.prepare("SELECT revision FROM content_records WHERE id=?").bind(id).first<{revision:number}>();const revision=Number(existing?.revision||0)+1;const published=input.publishState==="published";const withdrawn=input.publishState==="withdrawn";await d1.prepare("INSERT INTO content_records (id,kind,slug,title,payload,publish_state,revision,published_at,withdrawn_at,correction_note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,slug=excluded.slug,title=excluded.title,payload=excluded.payload,publish_state=excluded.publish_state,revision=excluded.revision,published_at=excluded.published_at,withdrawn_at=excluded.withdrawn_at,correction_note=excluded.correction_note,updated_at=CURRENT_TIMESTAMP").bind(id,input.kind,input.slug,input.title,JSON.stringify(input.payload),input.publishState,revision,published?new Date().toISOString():null,withdrawn?new Date().toISOString():null,input.correctionNote||null).run();await writeAudit(actor,existing?"update":"create",input.kind,id,JSON.stringify({revision,state:input.publishState}));return id}

export async function deleteContent(id:string,actor:string){const d1=await db();const row=await d1.prepare("SELECT kind FROM content_records WHERE id=?").bind(id).first<{kind:string}>();if(!row)return false;await d1.prepare("UPDATE content_records SET publish_state='withdrawn',withdrawn_at=CURRENT_TIMESTAMP,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();await writeAudit(actor,"withdraw",row.kind,id,"soft withdraw");return true}

export async function writeAudit(actor:string,action:string,entityType:string,entityId:string,detail:string){const d1=await db();await d1.prepare("INSERT INTO audit_logs (id,actor,action,entity_type,entity_id,detail,created_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)").bind(crypto.randomUUID(),actor,action,entityType,entityId,detail).run()}

export async function listAudit(){const d1=await db();const rows=await d1.prepare("SELECT id,actor,action,entity_type,entity_id,detail,created_at FROM audit_logs ORDER BY created_at DESC LIMIT 100").all<Record<string,unknown>>();return rows.results}

export async function listInquiries(){const d1=await db();const rows=await d1.prepare("SELECT id,type,subject,reply_requested,email,status,risk_level,created_at,updated_at FROM inquiries ORDER BY created_at DESC LIMIT 100").all<Record<string,unknown>>();return rows.results}

export async function updateInquiry(input:{id:string;status:"new"|"in_progress"|"resolved"|"closed";riskLevel:"low"|"medium"|"high"},actor:string){const d1=await db();const existing=await d1.prepare("SELECT id FROM inquiries WHERE id=?").bind(input.id).first();if(!existing)return false;await d1.prepare("UPDATE inquiries SET status=?,risk_level=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(input.status,input.riskLevel,input.id).run();await writeAudit(actor,"update","inquiry",input.id,JSON.stringify({status:input.status,riskLevel:input.riskLevel}));return true}

export async function listSecurityEvents(){const d1=await db();const rows=await d1.prepare("SELECT id,inquiry_id,cf_ray,country_code,turnstile_success,rate_limit_result,request_body_size,abuse_score,legal_hold,created_at,expires_at FROM inquiry_security_logs ORDER BY created_at DESC LIMIT 100").all<Record<string,unknown>>();return rows.results}

export async function setSecurityLegalHold(id:string,legalHold:boolean,actor:string){const d1=await db();const existing=await d1.prepare("SELECT id FROM inquiry_security_logs WHERE id=?").bind(id).first();if(!existing)return false;await d1.prepare("UPDATE inquiry_security_logs SET legal_hold=? WHERE id=?").bind(legalHold?1:0,id).run();await writeAudit(actor,legalHold?"legal_hold":"legal_hold_release","security_event",id,"raw IP retention hold changed");return true}

export async function listTrendMetrics(){const d1=await db();const rows=await d1.prepare("SELECT day,entity_type,entity_id,sampled_views,updated_at FROM trend_metrics_daily ORDER BY day DESC,sampled_views DESC LIMIT 100").all<Record<string,unknown>>();return rows.results}
