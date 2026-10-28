"""Verify auto mode starts without SFX and preserves elapsed time after a coin revive."""
import asyncio
import os

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
            args=["--no-sandbox", "--disable-crashpad", "--disable-breakpad"],
        )
        page = await browser.new_page()
        await page.set_content("<!doctype html><html><body><canvas tabindex=0></canvas></body></html>")
        await page.add_script_tag(path="public/chronometers/livesplit.js")
        await page.wait_for_function("window.__chronoRuntimeBridge && window.chrono")

        # SFX disabled: no AudioBufferSourceNode event is synthesized here.
        await page.locator("canvas").focus()
        await page.keyboard.press("ArrowUp")
        await page.wait_for_function("window.chrono.state().timerState === 'running'")
        await page.wait_for_timeout(350)
        await page.evaluate("window.__chronoRuntimeBridge.dispatchRuntimeEvent('poki:roundEnd')")
        await page.wait_for_function("window.chrono.state().timerState === 'paused'")
        elapsed_at_death = await page.evaluate("window.chrono.state().elapsedMs")
        await page.evaluate("window.__chronoRuntimeBridge.dispatchRuntimeEvent('poki:gameplayStart')")
        await page.wait_for_function("window.chrono.state().timerState === 'running'")
        elapsed_after_revive = await page.evaluate("window.chrono.state().elapsedMs")
        assert elapsed_after_revive >= elapsed_at_death - 20, (elapsed_at_death, elapsed_after_revive)
        assert elapsed_after_revive > 0, elapsed_after_revive
        print("PASS timer starts by game input without SFX and resumes coin revive without resetting elapsed time")
        await browser.close()


asyncio.run(main())
