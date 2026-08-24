import type {Metadata} from "next";
import {BRAND} from "./brand-config";

const FALLBACK_ORIGIN="https://public-investigation-platform.jtpgjmdaj587456325.chatgpt.site";
const cleanOrigin=(value:string)=>value.replace(/\/+$/,"");

export const SITE_ORIGIN=cleanOrigin(process.env.NEXT_PUBLIC_SITE_URL||FALLBACK_ORIGIN);
export const CANONICAL_ORIGIN=cleanOrigin(process.env.NEXT_PUBLIC_CANONICAL_URL||SITE_ORIGIN);
export const SEO_INDEXABLE=process.env.NEXT_PUBLIC_SEO_INDEXABLE!=="false";

export function siteUrl(path="/"){return new URL(path,SITE_ORIGIN).toString()}
export function canonicalUrl(path="/"){return new URL(path,CANONICAL_ORIGIN).toString()}

type PublicMetadataInput={path:string;title:string;description:string;type?:"website"|"article";image?:string|null;imageAlt?:string};

export function publicMetadata({path,title,description,type="website",image="/og.png",imageAlt=`${BRAND.name}｜公開情報と目撃をつなぐ`}:PublicMetadataInput):Metadata{
 const images=image?[{url:siteUrl(image),...(image==="/og.png"?{width:1200,height:630}:{}),alt:imageAlt}]:[];
 return {
  title,description,
  alternates:{canonical:canonicalUrl(path)},
  robots:{index:SEO_INDEXABLE,follow:SEO_INDEXABLE},
  openGraph:{title,description,type,locale:"ja_JP",siteName:`${BRAND.name}（${BRAND.reading}）`,url:canonicalUrl(path),images},
  twitter:{card:images.length?"summary_large_image":"summary",title,description,images},
 };
}

export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,"\\u003c")}
