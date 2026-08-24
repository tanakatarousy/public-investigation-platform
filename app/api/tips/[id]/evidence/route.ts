import {EVIDENCE_MAX_FILES,EVIDENCE_MAX_FILE_BYTES,EVIDENCE_MAX_TOTAL_BYTES,evidenceType,sha256Hex} from "../../../../server/evidence";
import {addEvidenceMetadata,authorizedTip,privateTipDetails} from "../../../../server/tips-db";
import {runtimeEnv} from "../../../../server/platform-db";

function bearer(req:Request){const value=req.headers.get("authorization")||"";return value.startsWith("Bearer ")?value.slice(7):""}
function sameSite(req:Request){const source=req.headers.get("origin")||req.headers.get("referer");if(!source)return false;try{return new URL(source).host===new URL(req.url).host}catch{return false}}
function failure(error:string,status:number){return Response.json({error},{status})}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameSite(req))return failure("送信元を確認できません。",403);if(!(req.headers.get("content-type")||"").includes("multipart/form-data"))return failure("Evidenceはmultipart/form-dataで送信してください。",415);if(Number(req.headers.get("content-length")||0)>EVIDENCE_MAX_TOTAL_BYTES+1024*1024)return failure("Evidence合計サイズが上限を超えています。",413);
 const {id}=await params,env=await runtimeEnv(),secret=bearer(req);if(!env.DB||!env.BUCKET||!env.TIPS_SECRET_PEPPER)return failure("現在、Evidence保存を利用できません。元データは編集せず保管してください。",503);const tip=await authorizedTip(id,secret,env.TIPS_SECRET_PEPPER);if(!tip)return failure("管理情報を確認できません。",401);if(!["draft","pending","approved_public"].includes(tip.state))return failure("現在の状態ではEvidenceを追加できません。",409);const existing=(await privateTipDetails(id)).evidence;
 let form:FormData;try{form=await req.formData()}catch{return failure("Evidenceを読み取れませんでした。",400)}const files=form.getAll("evidence").filter((item):item is File=>item instanceof File);if(!files.length||existing.length+files.length>EVIDENCE_MAX_FILES)return failure(`Evidenceは投稿全体で${EVIDENCE_MAX_FILES}件までです。`,400);const total=files.reduce((sum,file)=>sum+file.size,0)+existing.reduce((sum,file)=>sum+file.fileSize,0);if(total>EVIDENCE_MAX_TOTAL_BYTES||files.some(file=>file.size>EVIDENCE_MAX_FILE_BYTES))return failure("1ファイル25MB、投稿全体で合計50MB以内にしてください。",413);
 const saved:Array<{id:string;originalFilename:string;mime:string;fileSize:number;sha256:string}>=[];
 for(const file of files){const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer),mime=evidenceType(bytes,file.type);if(!mime)return failure(`${file.name} のファイル形式または内容を確認できません。`,415);const sha256=await sha256Hex(buffer),evidenceId=crypto.randomUUID(),objectKey=`tips/${id}/${crypto.randomUUID()}`;await env.BUCKET.put(objectKey,buffer,{httpMetadata:{contentType:mime},customMetadata:{submissionId:id,evidenceId,sha256}});try{await addEvidenceMetadata({id:evidenceId,submissionId:id,objectKey,originalFilename:file.name.slice(0,255),mime,fileSize:file.size,sha256})}catch(error){await env.BUCKET.delete(objectKey);throw error}saved.push({id:evidenceId,originalFilename:file.name,mime,fileSize:file.size,sha256})}
 return Response.json({ok:true,files:saved},{status:201,headers:{"cache-control":"no-store"}})
}

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params,env=await runtimeEnv(),secret=bearer(req);if(!env.TIPS_SECRET_PEPPER||!await authorizedTip(id,secret,env.TIPS_SECRET_PEPPER))return failure("管理情報を確認できません。",401);const details=await privateTipDetails(id);return Response.json({evidence:details.evidence},{headers:{"cache-control":"no-store"}})}
