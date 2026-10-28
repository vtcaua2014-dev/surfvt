"""Unity must reveal its game UI even when save storage never resolves."""
import asyncio
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from time import monotonic

from playwright.async_api import async_playwright


async def main():
    owned_server = None
    base_url = os.environ.get("MAP_BASE_URL")
    if not base_url:
        handler = partial(
            SimpleHTTPRequestHandler,
            directory=str(Path(__file__).resolve().parents[1] / "public"),
        )
        owned_server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        Thread(target=owned_server.serve_forever, daemon=True).start()
        base_url = f"http://127.0.0.1:{owned_server.server_port}"

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                executable_path="/usr/bin/chromium",
                args=["--no-sandbox", "--enable-unsafe-swiftshader"],
            )
            page = await browser.new_page(viewport={"width": 480, "height": 720})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.add_init_script(
                """
                window.__readyMessages = [];
                addEventListener('message', event => {
                  if (event.data?.type === 'SURFVT14_GAME_READY')
                    window.__readyMessages.push(event.data.type);
                });
                for (const name of ['applyUnlockAll', 'applyInfiniteSave']) {
                  Object.defineProperty(window, name, {
                    configurable: true,
                    set() {
                      Object.defineProperty(window, name, {
                        configurable: true,
                        value: () => new Promise(() => {})
                      });
                    }
                  });
                }
                """
            )
            # Exercise the fallback path and prove that stalled save APIs do
            # not keep the Unity game behind its loader.
            await page.route(
                "**/save-backup/**",
                lambda route: route.fulfill(status=404, body="backup unavailable"),
            )

            started = monotonic()
            await page.goto(f"{base_url}/maps/cairo/index.html", wait_until="domcontentloaded")
            await page.wait_for_function(
                "document.querySelector('#loading')?.classList.contains('done')",
                timeout=35_000,
            )
            elapsed = monotonic() - started
            assert elapsed < 35, f"Game UI stayed behind the loader for {elapsed:.1f}s"
            assert await page.locator("canvas").count() == 1
            assert await page.evaluate("window.__readyMessages.length") == 1
            assert not errors, errors
            print(f"PASS Cairo revealed Unity UI with save APIs pending ({elapsed:.1f}s)")
            await browser.close()
    finally:
        if owned_server:
            owned_server.shutdown()
            owned_server.server_close()


asyncio.run(main())
