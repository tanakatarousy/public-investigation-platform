import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, adminIdentityFromToken } from "../server/admin-auth";
import { AdminConsole } from "./admin-console";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理画面 | 全国公開捜査情報プラットフォーム", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function Page({ searchParams }: Props) {
  const cookieStore = await cookies();
  const actor = await adminIdentityFromToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (actor) return <AdminConsole actor={actor} />;

  const { error } = await searchParams;
  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <small>PRIVATE OPERATIONS</small>
        <h1>管理者ログイン</h1>
        <p>公開情報・目撃情報・問い合わせ・アクセス分析を管理します。ログインは8時間有効です。</p>
        <form action="/api/admin/session" method="post">
          <label htmlFor="admin-password">管理用パスワード</label>
          <input id="admin-password" name="password" type="password" minLength={16} maxLength={256} autoComplete="current-password" required autoFocus />
          <button type="submit">ログイン</button>
        </form>
        {error === "invalid" && <p className="admin-login-error">パスワードが正しくありません。</p>}
        {error === "setup" && <p className="admin-login-error">管理者認証のSecret設定を確認してください。</p>}
        <Link href="/">公開サイトへ戻る</Link>
      </section>
    </main>
  );
}
