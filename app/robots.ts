import type {MetadataRoute} from "next";import {CANONICAL_ORIGIN,SEO_INDEXABLE} from "./seo";
export default function robots():MetadataRoute.Robots{return {rules:[SEO_INDEXABLE?{userAgent:"*",allow:"/",disallow:["/admin","/api/","/brand-preview","/tips/manage/"]}:{userAgent:"*",disallow:"/"}],sitemap:`${CANONICAL_ORIGIN}/sitemap.xml`,host:CANONICAL_ORIGIN}}
