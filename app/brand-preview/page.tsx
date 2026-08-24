import {notFound} from "next/navigation";
import {BrandMark,type BrandMarkVariant} from "../BrandMark";

const variants:Array<{id:BrandMarkVariant;name:string;meaning:string[]}>= [
 {id:"tazune-glyph",name:"採用案｜尋・余韻・一点",meaning:["尋ねる／捜す","問いが続く読点の余韻","公開地点となる古金の一点"]},
 {id:"taguru",name:"Logo A｜手繰る線",meaning:["二つの記録","線は触れない","一つの手掛かりを示す"]},
 {id:"jin-no-michi",name:"Logo B｜尋の路",meaning:["問いから所在へ","折れながら辿る","始点と終点"]},
 {id:"toi-no-arika",name:"Logo C｜問と所在",meaning:["二つの問い","距離","離れた一点"]},
];

export const dynamic="force-dynamic";
export default function BrandPreview(){
 if(process.env.NODE_ENV==="production")notFound();
 return <main className="brand-preview"><header><p>DEVELOPMENT PREVIEW ONLY</p><h1>尋｜Brand Mark Comparison</h1></header><section>{variants.map(item=><article key={item.id}><BrandMark variant={item.id}/><div><h2>{item.name}</h2><p>{item.meaning.join("　／　")}</p></div></article>)}</section></main>
}
