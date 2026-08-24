import {requireChatGPTUser} from "../chatgpt-auth";import {runtimeEnv} from "../server/platform-db";import {AdminConsole} from "./admin-console";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireChatGPTUser("/admin");const allowed=(await runtimeEnv()).ADMIN_EMAIL?.toLowerCase();if(!allowed||user.email.toLowerCase()!==allowed)return <main className="admin-denied"><h1>Access denied</h1><p>この画面は登録済み管理者のみ利用できます。</p></main>;return <AdminConsole actor={user.email}/>}
