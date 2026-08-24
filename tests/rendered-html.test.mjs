import assert from "node:assert/strict";
import test from "node:test";

test("renders the public site metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html=await response.text();
  assert.match(html, /<title>尋｜公開情報と目撃をつなぐ<\/title>/i);
  assert.match(html, /rel="canonical" href="https:\/\/public-investigation-platform\.jtpgjmdaj587456325\.chatgpt\.site\/"/i);
  assert.match(html, /property="og:image" content="https:\/\/public-investigation-platform\.jtpgjmdaj587456325\.chatgpt\.site\/og\.png"/i);
  assert.match(html, /type="application\/ld\+json"/i);
  assert.doesNotMatch(html, /codex-preview/i);
});
