import {adminIdentityFromRequest} from "../../../../../server/admin-auth";
import {safeDownloadName} from "../../../../../server/evidence";
import {evidenceObjectForAdmin} from "../../../../../server/tips-db";
import {runtimeEnv} from "../../../../../server/platform-db";

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){if(!await adminIdentityFromRequest(req))return Response.json({error:"unauthorized"},{status:401});const env=await runtimeEnv();if(!env.BUCKET)return Response.json({error:"private storage unavailable"},{status:503});const {id}=await params,row=await evidenceObjectForAdmin(id);if(!row)return Response.json({error:"evidence not found"},{status:404});const object=await env.BUCKET.get(String(row.object_key));if(!object)return Response.json({error:"private object not found"},{status:404});return new Response(object.body,{headers:{"content-type":String(row.mime),"content-length":String(row.file_size),"content-disposition":`attachment; filename="${safeDownloadName(String(row.original_filename))}"`,"cache-control":"private, no-store","x-content-type-options":"nosniff"}})}
