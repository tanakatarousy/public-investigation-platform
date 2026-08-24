export const EVIDENCE_MAX_FILES=3,EVIDENCE_MAX_FILE_BYTES=25*1024*1024,EVIDENCE_MAX_TOTAL_BYTES=50*1024*1024;
const allowed=new Set(["image/jpeg","image/png","image/webp","image/heic","image/heif","video/mp4","video/quicktime","video/webm"]);
const hex=(bytes:Uint8Array,start:number,length:number)=>Array.from(bytes.slice(start,start+length),value=>value.toString(16).padStart(2,"0")).join("");
const ascii=(bytes:Uint8Array,start:number,length:number)=>String.fromCharCode(...bytes.slice(start,start+length));
export function evidenceType(bytes:Uint8Array,claimed:string){
 if(!allowed.has(claimed)||bytes.length<12)return null;if(hex(bytes,0,4)==="7f454c46"||ascii(bytes,0,2)==="MZ"||ascii(bytes,0,4).toLowerCase().includes("<svg"))return null;
 if(hex(bytes,0,3)==="ffd8ff")return claimed==="image/jpeg"?claimed:null;
 if(hex(bytes,0,8)==="89504e470d0a1a0a")return claimed==="image/png"?claimed:null;
 if(ascii(bytes,0,4)==="RIFF"&&ascii(bytes,8,4)==="WEBP")return claimed==="image/webp"?claimed:null;
 if(ascii(bytes,4,4)==="ftyp"){const brand=ascii(bytes,8,4);if(["heic","heix","hevc","hevx","heif","mif1","msf1"].includes(brand))return ["image/heic","image/heif"].includes(claimed)?claimed:null;return ["video/mp4","video/quicktime"].includes(claimed)?claimed:null}
 if(hex(bytes,0,4)==="1a45dfa3")return claimed==="video/webm"?claimed:null;return null;
}
export async function sha256Hex(bytes:ArrayBuffer){const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,"0")).join("")}
export function safeDownloadName(value:string){return value.replace(/[\r\n"\\/]/g,"_").slice(0,180)||"evidence"}
