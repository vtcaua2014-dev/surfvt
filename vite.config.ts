// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin, ViteDevServer } from "vite";

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      // Unity 2019 loaders fetch .unityweb through both fetch() and XHR. Vite
      // leaves this extension without a Content-Type, which makes the legacy
      // loader reject the WASM binary with "both async and sync fetching failed".
      server.middlewares.use((req, res, next) => {
        if (/\.unityweb(?:\?|$)/i.test(req.url || "")) {
          res.setHeader("Content-Type", /wasm_code/i.test(req.url || "") ? "application/wasm" : "application/octet-stream");
        }
        next();
      });
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) { res.writeHead(400, { "Content-Type": "text/plain" }); res.end("Missing storage key"); return; }
        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
        if (!forgeBaseUrl || !forgeKey) { res.writeHead(500, { "Content-Type": "text/plain" }); res.end("Storage proxy not configured"); return; }
        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);
          const forgeResp = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
          if (!forgeResp.ok) { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Storage backend error"); return; }
          const { url } = await forgeResp.json() as { url: string };
          if (!url) { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Empty signed URL"); return; }
          res.writeHead(307, { Location: url, "Cache-Control": "no-store" }); res.end();
        } catch { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Storage proxy error"); }
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [vitePluginStorageProxy()],
    // TanStack Router imports this CommonJS shim through a pnpm virtual path.
    // Explicit optimization prevents raw CJS from aborting React hydration.
    optimizeDeps: {
      include: ["use-sync-external-store/shim/with-selector"],
    },
    server: {
      allowedHosts: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
