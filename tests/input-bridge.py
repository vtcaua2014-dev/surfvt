"""Test physical iframe keyboard forwarding and single WASD remap delivery."""
import asyncio
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread

from playwright.async_api import async_playwright


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/test-host.html":
            body = b"""<!doctype html><script>window.messages=[];addEventListener('message',e=>{if(e.origin===location.origin)messages.push(e.data)})</script><iframe src='/test-frame.html?hubSettings=%7B%22controls%22%3A%22WASD%22%7D'></iframe>"""
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path.startswith("/test-frame.html"):
            body = b"""<!doctype html><script src='/chronometers/input-bridge.js'></script><canvas tabindex='0'></canvas><script>window.keys=[];addEventListener('keydown',e=>{if(e.key.startsWith('Arrow'))keys.push(e.key)},true)</script>"""
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


async def main():
    handler = partial(Handler, directory=os.path.abspath("public"))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
                args=["--no-sandbox", "--disable-crashpad", "--disable-breakpad"],
            )
            page = await browser.new_page()
            await page.goto(base + "/test-host.html")
            frame = page.frames[1]
            await frame.locator("canvas").focus()
            await page.keyboard.down("w")
            await page.wait_for_function("window.messages.some(m=>m.type==='SURFVT14_GAME_KEY')")
            await page.keyboard.up("w")
            await page.wait_for_timeout(100)
            events = await frame.evaluate("window.keys")
            relayed = await page.evaluate("messages.filter(m=>m.type==='SURFVT14_GAME_KEY')")
            assert events == ["ArrowUp"], events
            assert len(relayed) == 1 and relayed[0]["code"] == "KeyW", relayed
            print("PASS iframe focus, one ArrowUp event, physical hotkey forwarded once")
            await browser.close()
    finally:
        server.shutdown()
        server.server_close()


asyncio.run(main())
