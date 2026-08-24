"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

export function PageTracker(){const pathname=usePathname();useEffect(()=>{let browserId=localStorage.getItem("trend-browser-id");if(!browserId){browserId=crypto.randomUUID();localStorage.setItem("trend-browser-id",browserId)}const started=Date.now(),referrer=document.referrer&&new URL(document.referrer).origin===location.origin?new URL(document.referrer).pathname:null,timer=setTimeout(()=>{fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({browserId,path:pathname,referrerPath:referrer,dwellSeconds:Math.max(8,Math.floor((Date.now()-started)/1000))})}).catch(()=>{})},8000);return()=>clearTimeout(timer)},[pathname]);return null}
