"""Direct URL routing must open the matching game in exactly one iframe."""
import asyncio
import os

from playwright.async_api import async_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
ROUTES = [
    "zurich", "subway-crackers", "cairo", "london", "berlin", "havana",
    "houston", "venice", "san-francisco", "beijing", "barcelona", "buenos-aires",
    "miami", "bangkok", "monaco", "moscow", "rio", "winter-holiday", "hong-kong",
    "iceland", "new-orleans", "paris", "saint-petersburg", "mexico", "new-york",
    "tokyo", "moggers",
]
FIXTURE = "<!doctype html><html><body>route fixture<script>parent.postMessage({type:'SURFVT14_GAME_READY'}, '*')</script></body></html>"


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
            args=["--no-sandbox", "--disable-crashpad", "--disable-breakpad"],
        )
        context = await browser.new_context(service_workers="block")
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.route("**/maps/**/index.html**", lambda route: route.fulfill(body=FIXTURE))
        await page.route("**/moggers/index.html**", lambda route: route.fulfill(body=FIXTURE))
        # The fixtures intentionally omit the Unity Three.js runtime.
        await page.route(
            "**/chronometers/p14-bridge-main.js**",
            lambda route: route.fulfill(
                content_type="application/javascript", body="/* Unity bridge omitted in route fixture. */"
            ),
        )

        for slug in ROUTES:
            print(f"CHECK {slug}", flush=True)
            response = await page.goto(f"{BASE_URL}/{slug}", wait_until="domcontentloaded")
            assert response and response.ok, (slug, response.status if response else None)
            await page.wait_for_selector(
                "iframe.game-frame", state="attached", timeout=15_000
            )
            assert page.url.split("?")[0].endswith(f"/{slug}"), (slug, page.url)
            assert await page.locator("iframe.game-frame").count() == 1, slug
            if slug in ("subway-crackers", "moggers"):
                assert await page.locator(".standalone-game-warning").count() == 1, slug

        assert not errors, errors
        print(f"PASS {len(ROUTES)} direct game routes")
        await browser.close()


asyncio.run(main())
