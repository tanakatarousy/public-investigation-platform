import type {MetadataRoute} from "next";import {subjects,cases} from "./data/platform";import {CANONICAL_ORIGIN} from "./seo";import {listContent} from "./server/platform-db";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const staticPaths=["","/wanted","/cases","/map","/tips","/sources","/about","/privacy","/terms","/contact","/security"];
 let wanted=subjects.map(item=>({slug:item.slug,updatedAt:item.lastVerified})),caseRows=cases.map(item=>({slug:item.slug,updatedAt:item.timeline.at(-1)?.date||item.date}));
 try{const records=await listContent(true);const liveWanted=records.filter(record=>record.kind==="wanted").map(record=>({slug:record.slug,updatedAt:record.updatedAt})),liveCases=records.filter(record=>record.kind==="case").map(record=>({slug:record.slug,updatedAt:record.updatedAt}));if(liveWanted.length)wanted=liveWanted;if(liveCases.length)caseRows=liveCases}catch{}
 const lastModified=new Date();
 return [
  ...staticPaths.map(path=>({url:`${CANONICAL_ORIGIN}${path}`,lastModified,changeFrequency:path===""?"daily":"weekly" as const,priority:path===""?1:0.7})),
  ...wanted.map(item=>({url:`${CANONICAL_ORIGIN}/wanted/${item.slug}`,lastModified:new Date(item.updatedAt),changeFrequency:"weekly" as const,priority:0.9})),
  ...caseRows.map(item=>({url:`${CANONICAL_ORIGIN}/cases/${item.slug}`,lastModified:new Date(item.updatedAt),changeFrequency:"weekly" as const,priority:0.8})),
 ];
}
