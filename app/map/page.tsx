import type {Metadata} from "next";import {PublicShell} from "../components/PublicShell";import {BRAND} from "../brand-config";import {publicMetadata} from "../seo";import {InvestigationMap} from "./investigation-map";
export const metadata:Metadata=publicMetadata({path:"/map",title:`地図で辿る｜${BRAND.name}`,description:"警察公式記録と公開可能な目撃記録を、人物・事件・場所・時間、方向・集約・分布・時間差から確認できます。"});
export default function Page(){return <PublicShell kicker="TRACE BY PLACE / TIME" title="地図で辿る" intro="公開された記録と、審査済みの情報を場所と時間から辿る。"><InvestigationMap/></PublicShell>}
