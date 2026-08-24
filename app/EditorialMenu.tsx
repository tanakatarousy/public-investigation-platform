"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useRef} from "react";

const ITEMS = [
  ["公開情報を探す", "/wanted", "01"],
  ["地図", "/map", "02"],
  ["目撃情報を入力する", "/tips", "03"],
  ["事件一覧", "/cases", "04"],
  ["このサイトについて", "/about", "05"],
  ["問い合わせ", "/contact", "06"],
  ["情報源", "/sources", "07"],
] as const;

export function EditorialMenu() {
  const router=useRouter(),pathname=usePathname(),details=useRef<HTMLDetailsElement>(null);
  const prefetch=()=>ITEMS.forEach(([,href])=>router.prefetch(href));
  const setScrollLock=(locked:boolean)=>document.documentElement.classList.toggle("menu-open",locked);
  const close=()=>{if(details.current)details.current.open=false;setScrollLock(false)};
  useEffect(()=>{if(details.current)details.current.open=false;setScrollLock(false)},[pathname]);
  useEffect(()=>()=>setScrollLock(false),[]);
  const navigate=(event:React.MouseEvent<HTMLAnchorElement>,href:string)=>{event.preventDefault();router.push(href);close()};
  return (
    <details ref={details} className="menu-shell" onToggle={event=>{setScrollLock(event.currentTarget.open);if(event.currentTarget.open)prefetch()}}>
      <summary className="menu-button" aria-label="メニューを開く"><i /><i /><span>Menu</span></summary>
      <div className="menu-overlay">
        <div className="menu-heading"><span>CONTENTS</span><p>公開情報を辿り、目撃を正しく届ける。</p></div>
        <nav aria-label="全メニュー">{ITEMS.map(([label, href, number]) => <Link href={href} prefetch onClick={event=>navigate(event,href)} onPointerEnter={()=>router.prefetch(href)} onFocus={()=>router.prefetch(href)} onTouchStart={()=>router.prefetch(href)} key={href}><small>{number}</small><span>{label}</span></Link>)}</nav>
        <p className="menu-note">掲載情報は警察機関等の公式発表に基づきます。</p>
      </div>
    </details>
  );
}
