"""Verify that the supplied Unity save is seeded once and scripts are fallback."""
import asyncio
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.async_api import async_playwright


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "<!doctype html><html><head><script src='/chronometers/save-bootstrap.js'></script></head><body>save bootstrap test</body></html>"


async def main():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT / "public"))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    base_url = f"http://127.0.0.1:{server.server_port}"

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
                args=["--no-sandbox", "--disable-crashpad", "--disable-breakpad"],
            )

            clean = await browser.new_context()
            page = await clean.new_page()
            await page.route(
                "**/maps/cairo/index.html**",
                lambda route: route.fulfill(status=200, content_type="text/html", body=FIXTURE),
            )
            await page.goto(f"{base_url}/maps/cairo/index.html", wait_until="domcontentloaded")
            await page.wait_for_function(
                "window.__SURFVT14_SAVE_SOURCE === 'backup'", timeout=15_000
            )
            imported = await page.evaluate(
                """async () => {
                  const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open('/idbfs');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  const tx = db.transaction('FILE_DATA', 'readonly');
                  const keys = await new Promise((resolve, reject) => {
                    const request = tx.objectStore('FILE_DATA').getAllKeys();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  db.close();
                  return { version: db.version, count: keys.length };
                }"""
            )
            assert imported == {"version": 21, "count": 12}, imported
            await clean.close()

            existing = await browser.new_context()
            existing_page = await existing.new_page()
            async def fixture_by_mode(route):
                body = (
                    "<!doctype html><html><body>seed</body></html>"
                    if "seed" in route.request.url
                    else FIXTURE
                )
                await route.fulfill(status=200, content_type="text/html", body=body)

            await existing_page.route("**/maps/cairo/test.html**", fixture_by_mode)
            await existing_page.goto(f"{base_url}/maps/cairo/test.html?seed", wait_until="domcontentloaded")
            await existing_page.evaluate(
                """async () => new Promise((resolve, reject) => {
                  const request = indexedDB.open('/idbfs');
                  request.onupgradeneeded = () => request.result.createObjectStore('FILE_DATA');
                  request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('FILE_DATA', 'readwrite');
                    tx.objectStore('FILE_DATA').put(
                      { contents: new Uint8Array([1, 2, 3]) },
                      '/idbfs/existing-player/Save/local'
                    );
                    tx.oncomplete = () => { db.close(); resolve(); };
                    tx.onerror = () => reject(tx.error);
                  };
                  request.onerror = () => reject(request.error);
                })"""
            )
            await existing_page.goto(
                f"{base_url}/maps/cairo/test.html?import", wait_until="domcontentloaded"
            )
            await existing_page.wait_for_function(
                "window.__SURFVT14_SAVE_SOURCE === 'backup'", timeout=10_000
            )
            kept_save = await existing_page.evaluate(
                """async () => {
                  const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open('/idbfs');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  const tx = db.transaction('FILE_DATA', 'readonly');
                  const keys = await new Promise((resolve, reject) => {
                    const request = tx.objectStore('FILE_DATA').getAllKeys();
                    request.onsuccess = () => resolve(request.result.map(String));
                    request.onerror = () => reject(request.error);
                  });
                  const saved = await new Promise((resolve, reject) => {
                    const request = tx.objectStore('FILE_DATA').get('/idbfs/existing-player/Save/local');
                    request.onsuccess = () => resolve([...request.result.contents]);
                    request.onerror = () => reject(request.error);
                  });
                  db.close();
                  return { keys, saved };
                }"""
            )
            assert kept_save == {
                "keys": ["/idbfs/existing-player/Save/local"],
                "saved": [1, 2, 3],
            }, kept_save
            await existing.close()

            partial_context = await browser.new_context()
            partial_page = await partial_context.new_page()

            async def partial_fixture(route):
                body = (
                    "<!doctype html><html><body>seed</body></html>"
                    if "seed" in route.request.url
                    else FIXTURE
                )
                await route.fulfill(status=200, content_type="text/html", body=body)

            await partial_page.route("**/maps/cairo/partial.html**", partial_fixture)
            await partial_page.goto(
                f"{base_url}/maps/cairo/partial.html?seed", wait_until="domcontentloaded"
            )
            await partial_page.evaluate(
                """async () => new Promise((resolve, reject) => {
                  const request = indexedDB.open('/idbfs');
                  request.onupgradeneeded = () => request.result.createObjectStore('FILE_DATA');
                  request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('FILE_DATA', 'readwrite');
                    tx.objectStore('FILE_DATA').put(
                      { userPreference: 'keep-me' },
                      '/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/PlayerPrefs'
                    );
                    tx.oncomplete = () => { db.close(); resolve(); };
                    tx.onerror = () => reject(tx.error);
                  };
                  request.onerror = () => reject(request.error);
                })"""
            )
            await partial_page.goto(
                f"{base_url}/maps/cairo/partial.html?import", wait_until="domcontentloaded"
            )
            await partial_page.wait_for_function(
                "window.__SURFVT14_SAVE_SOURCE === 'backup'", timeout=10_000
            )
            merged = await partial_page.evaluate(
                """async () => {
                  const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open('/idbfs');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  const tx = db.transaction('FILE_DATA', 'readonly');
                  const store = tx.objectStore('FILE_DATA');
                  const keys = await new Promise((resolve, reject) => {
                    const request = store.getAllKeys();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  const prefs = await new Promise((resolve, reject) => {
                    const request = store.get('/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/PlayerPrefs');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                  });
                  db.close();
                  return { count: keys.length, preference: prefs.userPreference };
                }"""
            )
            assert merged == {"count": 12, "preference": "keep-me"}, merged
            await partial_context.close()

            fallback = await browser.new_context()
            fallback_page = await fallback.new_page()
            calls = []
            await fallback_page.route(
                "**/maps/cairo/index.html**",
                lambda route: route.fulfill(status=200, content_type="text/html", body=FIXTURE),
            )
            await fallback_page.route(
                "**/save-backup/**", lambda route: route.fulfill(status=404, body="missing")
            )

            async def fake_unlock(route):
                calls.append("unlock")
                await route.fulfill(content_type="application/javascript", body="window.__unlockLoaded=true;")

            async def fake_infinite(route):
                calls.append("infinite")
                await route.fulfill(
                    content_type="application/javascript",
                    body="window.__infiniteLoaded=true;window.__SURFVT14_SAVE_READY_PROMISE=Promise.resolve(true);",
                )

            await fallback_page.route("**/maps/cairo/unlock-all.js", fake_unlock)
            await fallback_page.route("**/maps/cairo/infinite-save.js", fake_infinite)
            await fallback_page.goto(f"{base_url}/maps/cairo/index.html", wait_until="domcontentloaded")
            await fallback_page.wait_for_function(
                "window.__SURFVT14_SAVE_SOURCE === 'unlock-all+infinite-save'", timeout=10_000
            )
            assert calls == ["unlock", "infinite"], calls
            print("PASS backup imports 12 IDBFS records at database version 21")
            print("PASS an existing player save is preserved")
            print("PASS existing PlayerPrefs are preserved while missing backup files are merged")
            print("PASS missing backup loads unlock-all and infinite-save in order")
            await browser.close()
    finally:
        server.shutdown()
        server.server_close()


asyncio.run(main())
