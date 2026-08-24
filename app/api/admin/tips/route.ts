import {getChatGPTUser} from "../../../chatgpt-auth";
import {adminDeleteTip,adminUpdateTip,evidenceObjectKeysForSubmission,listTipsForAdmin,moderateTip,type GeographicPrecision} from "../../../server/tips-db";
import {runtimeEnv} from "../../../server/platform-db";

type ModerationAction="review"|"approve"|"reject"|"approve_revision"|"withdraw";
const precisions:GeographicPrecision[]=["point","city","prefecture","region"];

async function actor(){const user=await getChatGPTUser(),env=await runtimeEnv();if(!user||!env.ADMIN_EMAIL||user.email.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase())return null;return user.email}
function sameOrigin(req:Request){const source=req.headers.get("origin")||req.headers.get("referer");if(!source)return false;try{return new URL(source).host===new URL(req.url).host}catch{return false}}
function mutationAllowed(req:Request){const size=Number(req.headers.get("content-length")||0);if(size>131072)return Response.json({error:"payload too large"},{status:413});if(!(req.headers.get("content-type")||"").includes("application/json"))return Response.json({error:"invalid content type"},{status:415});if(!sameOrigin(req))return Response.json({error:"invalid origin"},{status:403});return null}
function validPayload(payload:unknown):payload is Record<string,string>{if(!payload||typeof payload!=="object"||Array.isArray(payload))return false;const entries=Object.entries(payload);return entries.length<=30&&entries.every(([key,value])=>key.length<=80&&typeof value==="string"&&value.length<=2000)}
function validCoordinates(lat:unknown,lon:unknown){if(lat===null&&lon===null)return true;if(typeof lat!=="string"||typeof lon!=="string"||lat===""||lon==="")return false;const latitude=Number(lat),longitude=Number(lon);return Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180}

export async function GET(){if(!await actor())return Response.json({error:"unauthorized"},{status:401});try{return Response.json(await listTipsForAdmin(),{headers:{"cache-control":"no-store"}})}catch{return Response.json({error:"database unavailable"},{status:503})}}

export async function PATCH(req:Request){
 const email=await actor();if(!email)return Response.json({error:"unauthorized"},{status:401});const rejected=mutationAllowed(req);if(rejected)return rejected;
 const body=await req.json() as {id?:string;action?:ModerationAction|"update";revisionId?:string;publicPrecision?:GeographicPrecision;subjectSlug?:string|null;caseSlug?:string|null;payload?:Record<string,string>;exactLat?:string|null;exactLon?:string|null};
 if(!body.id||!body.action)return Response.json({error:"invalid admin action"},{status:400});
 try{
  if(body.action==="update"){
   if(!validPayload(body.payload)||!body.publicPrecision||!precisions.includes(body.publicPrecision)||!validCoordinates(body.exactLat,body.exactLon))return Response.json({error:"invalid tip update"},{status:400});
   const ok=await adminUpdateTip({id:body.id,subjectSlug:body.subjectSlug?.trim()||null,caseSlug:body.caseSlug?.trim()||null,payload:body.payload,exactLat:body.exactLat||null,exactLon:body.exactLon||null,publicPrecision:body.publicPrecision},email);return Response.json({ok});
  }
  if(!(["review","approve","reject","approve_revision","withdraw"] as string[]).includes(body.action))return Response.json({error:"invalid moderation action"},{status:400});
  if(body.publicPrecision&&!precisions.includes(body.publicPrecision))return Response.json({error:"invalid public precision"},{status:400});
  return Response.json({ok:await moderateTip({id:body.id,action:body.action as ModerationAction,revisionId:body.revisionId,publicPrecision:body.publicPrecision},email)});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"admin operation failed"},{status:409})}
}

export async function DELETE(req:Request){
 const email=await actor();if(!email)return Response.json({error:"unauthorized"},{status:401});if(!sameOrigin(req))return Response.json({error:"invalid origin"},{status:403});const id=new URL(req.url).searchParams.get("id");if(!id)return Response.json({error:"id required"},{status:400});
 try{const keys=await evidenceObjectKeysForSubmission(id),env=await runtimeEnv();if(keys.length&&env.BUCKET)await env.BUCKET.delete(keys);return Response.json({ok:await adminDeleteTip(id,email),removedEvidence:keys.length})}catch(error){return Response.json({error:error instanceof Error?error.message:"delete failed"},{status:409})}
}
