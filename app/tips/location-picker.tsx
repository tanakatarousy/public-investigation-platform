/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {useEffect,useRef} from "react";

type Coords={lat:string;lon:string};
export function LocationPicker({selected,onPick,onReset}:{selected:Coords|null;onPick:(value:string,coords:Coords)=>void;onReset:()=>void}){
 const el=useRef<HTMLDivElement>(null),map=useRef<any>(null),marker=useRef<any>(null),markerClass=useRef<any>(null),pickRef=useRef(onPick),selectedRef=useRef(selected);
 useEffect(()=>{pickRef.current=onPick},[onPick]);
 useEffect(()=>{selectedRef.current=selected;if(!selected||!map.current||!markerClass.current)return;const lngLat:[number,number]=[Number(selected.lon),Number(selected.lat)];if(marker.current)marker.current.setLngLat(lngLat);else marker.current=new markerClass.current({color:"#a78b57"}).setLngLat(lngLat).addTo(map.current)},[selected]);
 useEffect(()=>{let alive=true;import("maplibre-gl").then(({default:maplibregl})=>{if(!alive||!el.current||map.current)return;const m=new maplibregl.Map({container:el.current,style:"https://tiles.openfreemap.org/styles/positron",center:selectedRef.current?[Number(selectedRef.current.lon),Number(selectedRef.current.lat)]:[138,36.2],zoom:selectedRef.current?13:4.3,maxZoom:17});m.addControl(new maplibregl.NavigationControl(),"top-right");markerClass.current=maplibregl.Marker;const place=(coords:Coords)=>{const lngLat:[number,number]=[Number(coords.lon),Number(coords.lat)];if(marker.current)marker.current.setLngLat(lngLat);else marker.current=new maplibregl.Marker({color:"#a78b57"}).setLngLat(lngLat).addTo(m)};if(selectedRef.current)place(selectedRef.current);m.on("click",event=>{const coords={lat:event.lngLat.lat.toFixed(5),lon:event.lngLat.lng.toFixed(5)};place(coords);pickRef.current(`${coords.lat}, ${coords.lon}（地図で指定）`,coords)});map.current=m});return()=>{alive=false;marker.current?.remove();marker.current=null;map.current?.remove();map.current=null;markerClass.current=null}},[]);
 function reset(){marker.current?.remove();marker.current=null;onReset()}
 return <div className="location-picker"><p className="picker-note">地図をクリック／タップすると1つのMarkerを表示します。再選択すると同じMarkerが移動し、Stepを戻っても選択地点を保持します。</p><div ref={el} className="tips-location-map" aria-label="目撃地点を地図で指定"/>{selected&&<div className="selected-location"><span>選択地点</span><b>緯度 {selected.lat}　経度 {selected.lon}</b><button type="button" onClick={reset}>地点をリセット</button></div>}</div>
}
