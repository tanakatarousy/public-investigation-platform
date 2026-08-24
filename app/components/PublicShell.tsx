import Link from "next/link";
import { BrandMark } from "../BrandMark";
import { BRAND } from "../brand-config";
import { EditorialMenu } from "../EditorialMenu";
import {getSources} from "../data/platform";
import {ThemeToggle} from "./ThemeToggle";
import {PageTracker} from "./PageTracker";

export function PublicLayout({children,home=false}:{children:React.ReactNode;home?:boolean}){
 return <main className={home?"public-layout public-layout--home":"public-layout public-page"}><PageTracker/>{children}</main>
}
export function PublicHeader({hero=false}:{hero?:boolean}){
 return <header className={hero?"site-header public-header public-header--hero":"page-header public-header"}><Link className="brand" href="/" prefetch aria-label={`${BRAND.name}（${BRAND.reading}）トップページ`}><BrandMark/><span className="brand-copy"><b>{BRAND.reading}</b><small>{BRAND.latin}</small></span></Link><div className="header-actions"><ThemeToggle/><EditorialMenu/></div></header>
}
export function PublicShell({children,kicker,title,intro}:{children:React.ReactNode;kicker:string;title:string;intro?:string}){
 return <PublicLayout><PublicHeader/><section className="page-intro"><p className="kicker">{kicker}</p><h1>{title}</h1>{intro&&<p>{intro}</p>}</section><div className="page-content">{children}</div><PublicFooter/></PublicLayout>
}
export function PublicFooter(){return <footer className="site-footer"><p><b>{BRAND.name}</b>は警察機関等が一般公開している情報を整理しています。緊急時は110番へ。</p><nav><Link href="/about">このサイトについて</Link><Link href="/sources">情報源</Link><Link href="/privacy">プライバシー</Link><Link href="/terms">利用規約</Link><Link href="/security">セキュリティ</Link></nav></footer>}
export const Footer=PublicFooter;
export function OfficialLinks({ids}:{ids:string[]}){return <aside className="official-box"><p className="kicker">OFFICIAL SOURCES</p>{getSources(ids).map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer"><span>✓ {s.organization}</span><small>確認 {s.verified} ↗</small></a>)}</aside>}
