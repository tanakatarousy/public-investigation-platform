# Public Investigation Platform

ChatGPT Sitesで稼働している全国公開捜査情報プラットフォームのCloudflare Workers移行用リポジトリです。元のChatGPT Siteとは独立しており、元サイトを削除・上書きしません。

## Cloudflare構成

- Workers: Vinextの公開UI、API、Admin
- D1 binding `DB`: 公開データ、投稿、問い合わせ、監査ログ
- R2 binding `BUCKET`: 非公開Evidence
- Static assets: Worker Assets

## Build / Deploy

1. `.env.example`を参考にPreview/Productionの環境変数を分離する
2. `npm ci`
3. `npm run build`
4. `npm run db:migrate:remote`
5. `npm run deploy:cloudflare`

初回公開前は`NEXT_PUBLIC_SEO_INDEXABLE=false`、ブラウザ検収後に新URLをcanonicalへ設定して`true`へ切り替えます。秘密値はGitへ保存せず、Cloudflare Secretsへ登録してください。
