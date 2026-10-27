"""Verify old map-cache eviction and online startup freshness in Chromium."""
import asyncio, os
from playwright.async_api import async_playwright
BASE=os.getenv('BASE_URL','http://127.0.0.1:3000')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await b.new_page()
  await page.goto(BASE,wait_until='domcontentloaded')
  await page.evaluate("navigator.serviceWorker.ready")
  await page.reload(wait_until='domcontentloaded')
  await page.wait_for_function('navigator.serviceWorker.controller')
  # Poison the active HTML cache: network-first must still fetch the real map.
  await page.evaluate("""async () => {
   const c=await caches.open('surfvt14-map-cache-v21-runtime-fixes');
   await c.put('/maps/barcelona/index.html',new Response('STALE-MAP', {headers:{'Content-Type':'text/html'}}));
  }""")
  result=await page.evaluate("fetch('/maps/barcelona/index.html?hubSettings=test').then(r=>r.text())")
  assert 'STALE-MAP' not in result and '/chronometers/input-bridge.js' in result
  print('PASS cached stale HTML replaced with online version',flush=True)
  # Versioned assets must not collapse onto one cache entry.
  await page.evaluate("fetch('/maps-shared/wasm_framework.unityweb?v=regression-A').then(r=>r.arrayBuffer())")
  await page.wait_for_timeout(1000)
  keys=await page.evaluate("caches.open('surfvt14-map-cache-v21-runtime-fixes').then(c=>c.keys()).then(ks=>ks.map(k=>k.url))")
  assert any('?v=regression-A' in k for k in keys),keys
  print('PASS version query retained for assets',flush=True)
  assert not any(k.startswith('surfvt14-map-cache-v20') for k in await page.evaluate('caches.keys()'))
  await b.close()
asyncio.run(main())
