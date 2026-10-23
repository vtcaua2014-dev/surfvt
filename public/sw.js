const CACHE_NAME = "surfvt14-map-cache-v20-shared-wasm-hub";
const CACHE_PREFIX = "/maps/";
const EXTRA_PREFIXES = ["/moggers/", "/map-icons/", "/maps-shared/"];

function isCacheableMapRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith(CACHE_PREFIX) ||
      EXTRA_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)))
  );
}

function cacheKey(request) {
  const url = new URL(request.url);
  // O hub acrescenta parâmetros ao index.html; todos devem reutilizar a mesma
  // cópia local da build em vez de criar entradas duplicadas no cache.
  url.search = "";
  url.hash = "";
  return new Request(url.toString(), { method: "GET" });
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("surfvt14-map-cache-") && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (!isCacheableMapRequest(event.request)) return;
  const key = cacheKey(event.request);
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(key).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) cache.put(key, response.clone());
          return response;
        });
      }),
    ),
  );
});
