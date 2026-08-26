import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const runtimeRoot = path.resolve(
  process.env.SITES_RUNTIME_ROOT ?? path.join(projectRoot, ".sites-runtime"),
);

const runtimePaths = {
  home: path.join(runtimeRoot, "home"),
  npmCache: path.join(runtimeRoot, "npm-cache"),
  xdgConfig: path.join(runtimeRoot, "xdg-config"),
  temp: path.join(runtimeRoot, "tmp"),
  wranglerLogs: path.join(runtimeRoot, "wrangler", "logs"),
  miniflareRegistry: path.join(runtimeRoot, "wrangler", "registry"),
};

for (const directory of Object.values(runtimePaths)) {
  mkdirSync(directory, { recursive: true });
}

const env = {
  ...process.env,
  SITES_ENV_READY: "1",
  SITES_PROJECT_ROOT: projectRoot,
  HOME: runtimePaths.home,
  XDG_CONFIG_HOME: runtimePaths.xdgConfig,
  TMPDIR: runtimePaths.temp,
  TEMP: runtimePaths.temp,
  TMP: runtimePaths.temp,
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: runtimePaths.wranglerLogs,
  MINIFLARE_REGISTRY_PATH: runtimePaths.miniflareRegistry,
  npm_config_cache: runtimePaths.npmCache,
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
};

for (const name of [
  "NPM_CONFIG_CACHE",
  "npm_config_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
  "NPM_CONFIG_PROXY",
  "NPM_CONFIG_HTTP_PROXY",
  "NPM_CONFIG_HTTPS_PROXY",
]) {
  delete env[name];
}

const vinext = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vinext.cmd" : "vinext",
);

if (!existsSync(vinext)) {
  console.error("vinext is unavailable. Run npm ci before building.");
  process.exit(69);
}

console.log("Running bounded vinext build...");
const build = spawnSync(vinext, ["build"], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  timeout: 180_000,
  killSignal: "SIGTERM",
  shell: process.platform === "win32",
});

if (build.error) {
  if (build.error.code === "ETIMEDOUT") {
    console.error("vinext build exceeded the 3 minute timeout.");
  } else {
    console.error(build.error);
  }
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const workerPath = path.join(projectRoot, "dist", "server", "index.js");
if (!existsSync(workerPath)) {
  console.error("Missing Cloudflare Worker entry: dist/server/index.js");
  process.exit(66);
}

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("worker-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);

if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error(
    "dist/server/index.js must have an ESM default export with fetch(request, env, ctx)",
  );
}

console.log("Validated Cloudflare artifact: ESM Worker default.fetch is present.");
