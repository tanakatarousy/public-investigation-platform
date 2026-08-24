import vinext from "vinext";
import { defineConfig } from "vite";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  vars: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY ?? "",
    TURNSTILE_SECRET: process.env.TURNSTILE_SECRET ?? "",
    VIEW_METRICS_ENABLED: process.env.VIEW_METRICS_ENABLED ?? "false",
    TREND_SAMPLE_RATE: process.env.TREND_SAMPLE_RATE ?? "0.1",
    TREND_PUBLIC_ENABLED: process.env.TREND_PUBLIC_ENABLED ?? "true",
    TREND_HMAC_SECRET: process.env.TREND_HMAC_SECRET ?? "",
    TIPS_SECRET_PEPPER: process.env.TIPS_SECRET_PEPPER ?? "",
    TIPS_RATE_HMAC_SECRET: process.env.TIPS_RATE_HMAC_SECRET ?? "",
  },
  d1_databases: [
    {
      binding: "DB",
      database_name: process.env.CLOUDFLARE_D1_DATABASE_NAME ?? "public-investigation-platform",
      database_id: process.env.CLOUDFLARE_D1_DATABASE_ID ?? SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
    },
  ],
  r2_buckets: [
    {
      binding: "BUCKET",
      bucket_name: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "public-investigation-platform-private",
    },
  ],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
