import vinext from "vinext";
import { defineConfig } from "vite";

const DEFAULT_DATABASE_ID = "afd34793-debf-4b9a-b386-45d62dff3378";
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  vars: {
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY ?? "",
    VIEW_METRICS_ENABLED: process.env.VIEW_METRICS_ENABLED ?? "true",
    TREND_SAMPLE_RATE: process.env.TREND_SAMPLE_RATE ?? "1",
    TREND_PUBLIC_ENABLED: process.env.TREND_PUBLIC_ENABLED ?? "true",
  },
  d1_databases: [
    {
      binding: "DB",
      database_name: process.env.CLOUDFLARE_D1_DATABASE_NAME ?? "public-investigation-platform",
      database_id: process.env.CLOUDFLARE_D1_DATABASE_ID ?? DEFAULT_DATABASE_ID,
      migrations_dir: "./drizzle",
    },
  ],
};

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox ? { watch: { useFsEvents: false, usePolling: true } } : {}),
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
