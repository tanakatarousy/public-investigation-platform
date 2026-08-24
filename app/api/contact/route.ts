/* eslint-disable @typescript-eslint/no-explicit-any */
import {runtimeEnv} from "../../server/platform-db";
const buckets=new Map<string,number[]>();
function json(error:string,status:number){return Response.json({error},{status})}
function sameSite(req:Request){const source=req.headers.get("origin")||req.headers.get("referer");if(!source)return false;try{return new URL(source).host===new URL(req.url).host}catch{return false}}

export async function POST(req:Request){
 const env=await runtimeEnv();
 const size=Number(req.headers.get("content-length")||0);
 if(size>32768)return json("送信内容が大きすぎます。",413);
 if(!sameSite(req))return json("送信元を確認できません。",403);
 if(!(req.headers.get("content-type")||"").includes("application/json"))return json("Content-Typeが不正です。",415);
 let p:any;try{p=await req.json()}catch{return json("JSONが不正です。",400)}
 if(p.website)return Response.json({ok:true});
 const type=String(p.type||"").trim(),subject=String(p.subject||"").trim(),message=String(p.message||"").trim(),email=String(p.email||"").trim();
 if(!type||subject.length<2||subject.length>120||message.length<10||message.length>5000||!p.consent||(p.replyRequested&&!/^\S+@\S+\.\S+$/.test(email)))return json("入力内容を確認してください。",400);
 if(Date.now()-Number(p.openedAt||0)<800)return json("送信を確認できませんでした。",429);
 if(Boolean(env.TURNSTILE_SITE_KEY)!==Boolean(env.TURNSTILE_SECRET))return json("問い合わせのセキュリティ設定を確認中です。",503);
 const ip=req.headers.get("cf-connecting-ip")||"unknown",now=Date.now(),expires=new Date(now+30*86400000).toISOString();
 const recent=(buckets.get(ip)||[]).filter(t=>now-t<86400000);
 if(recent.filter(t=>now-t<1800000).length>=3||recent.length>=10)return json("送信回数の上限に達しました。時間をおいてください。",429);
 try{
  if(!env.DB)throw new Error("DB unavailable");
  await env.DB.prepare("DELETE FROM inquiry_security_logs WHERE legal_hold=0 AND expires_at<CURRENT_TIMESTAMP").run();
  const counts=await env.DB.prepare("SELECT SUM(CASE WHEN created_at>=datetime('now','-30 minutes') THEN 1 ELSE 0 END) AS short_count,COUNT(*) AS daily_count FROM inquiry_security_logs WHERE client_ip=? AND created_at>=datetime('now','-1 day')").bind(ip).first<{short_count:number;daily_count:number}>();
  if(Number(counts?.short_count||0)>=3||Number(counts?.daily_count||0)>=10){await env.DB.prepare("INSERT INTO inquiry_security_logs (id,inquiry_id,client_ip,cf_ray,user_agent,country_code,turnstile_success,rate_limit_result,request_body_size,abuse_score,legal_hold,created_at,expires_at) VALUES (?,NULL,?,?,?,?,0,'blocked',?,1,0,CURRENT_TIMESTAMP,?)").bind(crypto.randomUUID(),ip,req.headers.get("cf-ray"),req.headers.get("user-agent"),req.headers.get("cf-ipcountry"),size||JSON.stringify(p).length,expires).run();return json("送信回数の上限に達しました。時間をおいてください。",429)}
  let turnstile=true;
  if(env.TURNSTILE_SECRET){const fd=new FormData();fd.set("secret",env.TURNSTILE_SECRET);fd.set("response",String(p.turnstileToken||""));fd.set("remoteip",ip);const vr:any=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:fd}).then(r=>r.json()).catch(()=>({success:false}));turnstile=!!vr.success}
  if(!turnstile){await env.DB.prepare("INSERT INTO inquiry_security_logs (id,inquiry_id,client_ip,cf_ray,user_agent,country_code,turnstile_success,rate_limit_result,request_body_size,abuse_score,legal_hold,created_at,expires_at) VALUES (?,NULL,?,?,?,?,0,'turnstile_failed',?,1,0,CURRENT_TIMESTAMP,?)").bind(crypto.randomUUID(),ip,req.headers.get("cf-ray"),req.headers.get("user-agent"),req.headers.get("cf-ipcountry"),size||JSON.stringify(p).length,expires).run();return json("セキュリティ確認に失敗しました。",403)}
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO inquiries (id,type,subject,message,reply_requested,email,status,risk_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)").bind(id,type,subject,message,p.replyRequested?1:0,p.replyRequested?email:null,"new","low").run();
  await env.DB.prepare("INSERT INTO inquiry_security_logs (id,inquiry_id,client_ip,cf_ray,user_agent,country_code,turnstile_success,rate_limit_result,request_body_size,abuse_score,legal_hold,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,CURRENT_TIMESTAMP,?)").bind(crypto.randomUUID(),id,ip,req.headers.get("cf-ray"),req.headers.get("user-agent"),req.headers.get("cf-ipcountry"),turnstile?1:0,"allowed",size||JSON.stringify(p).length,0,expires).run();
  recent.push(now);buckets.set(ip,recent);
  return Response.json({ok:true,id},{status:201});
 }catch{return json("現在、問い合わせ受付を一時停止しています。公式窓口をご利用ください。",503)}
}
