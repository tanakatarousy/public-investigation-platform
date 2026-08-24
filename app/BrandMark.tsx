import {BRAND} from "./brand-config";

export type BrandMarkVariant="tazune-glyph"|"taguru"|"jin-no-michi"|"toi-no-arika";
const labels:Record<BrandMarkVariant,string>={
  "tazune-glyph":"尋。人を尋ねる文字と、問いの余韻、地図上の一点を重ねた印",
  taguru:"手繰る線。離れた二本の線が一つの手掛かりを示す",
  "jin-no-michi":"尋の路。問いから所在へ折れながら辿る一本の線",
  "toi-no-arika":"問と所在。二つの問いと離れた一点を表す",
};

/** Heroの円相とは別管理。尋の字・問いの余韻・公開地点の三つの意味を一つに重ねる。 */
export function BrandMark({variant=BRAND.mark as BrandMarkVariant}:{variant?:BrandMarkVariant}) {
  return (
    <svg className={`brand-mark brand-mark--${variant}`} viewBox="0 0 64 56" role="img" aria-label={labels[variant]}>
      {variant==="tazune-glyph"&&<>
        <text className="brand-glyph" x="27" y="45" textAnchor="middle">尋</text>
        <circle className="brand-node" cx="54" cy="43" r="3.5"/>
      </>}
      {variant==="taguru"&&<><path d="M4 12c12 0 17 5 24 11"/><path d="M60 36c-12 0-17-5-24-11"/><circle cx="32" cy="24" r="2.7"/></>}
      {variant==="jin-no-michi"&&<><path d="M6 37h13V12h18v12h20"/><circle cx="57" cy="24" r="2.7"/></>}
      {variant==="toi-no-arika"&&<><path d="M6 18h23M6 30h23"/><circle cx="53" cy="24" r="2.7"/></>}
    </svg>
  );
}
