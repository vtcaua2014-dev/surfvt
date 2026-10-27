"""Run against a running SurfVT server: BASE_URL=http://localhost:3000 python tests/browser-regressions.py.
Requires Python Playwright and Chromium. Uses real maps, physical browser keyboard
input, internal settings UI, and the React overlay. Screenshots go to EVIDENCE_DIR.
"""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:3000')
OUT = Path(os.getenv('EVIDENCE_DIR', '/tmp/surfvt-browser-evidence'))
OUT.mkdir(parents=True, exist_ok=True)

async def main():
 async with async_playwright() as p:
  browser = await p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox','--enable-unsafe-swiftshader'])
  for scheme, keys in [('PERSONALIZADO',['M','T','F','G']),('WASD',['W','A','S','D']),('IJKL',['I','J','K','L']),('SETAS',['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'])]:
   page = await browser.new_page(viewport={'width':1000,'height':800})
   settings = dict(timerEnabled=True,timerStyle='native',timerAutoMode=False,timerStartHotkey='x',timerPauseHotkey='c',timerResetHotkey='v',controls=scheme,customControls=dict(zip(['up','left','down','right'],keys)),wasdEnabled=True)
   await page.add_init_script('''if(!sessionStorage.getItem('test-seeded')){localStorage.setItem('surfvt14-settings',JSON.stringify(%s));localStorage.setItem('surfvt14-p14-overlay-prefs-v1',JSON.stringify({wasd:{color:'#a12bef'}}));sessionStorage.setItem('test-seeded','1')}''' % json.dumps(settings))
   errors=[]
   page.on('pageerror',lambda e: errors.append(str(e)))
   await page.goto(BASE,wait_until='domcontentloaded')
   await page.wait_for_timeout(2000)
   await page.locator('[data-map-id=barcelona]').click()
   await page.locator('.play-button').click()
   frame=page.frames[1]
   await frame.wait_for_function('window.__surfvt14TimerController?.getConfig().enabled && window.P14FloatingClock',timeout=60000)
   await page.wait_for_function("!document.querySelector('.loading-screen')",timeout=120000)
   await frame.evaluate('window.__regressionIdentity = Math.random(); window.__arrowCount=0; window.addEventListener("keydown",e=>{if(e.key==="ArrowUp")window.__arrowCount++},true)')
   identity=await frame.evaluate('window.__regressionIdentity')
   for key in keys:
    await frame.locator('canvas').focus()
    await page.keyboard.down(key)
    await page.wait_for_timeout(120)
    label={'ArrowUp':'↑','ArrowLeft':'←','ArrowDown':'↓','ArrowRight':'→'}.get(key,key)
    cap=page.locator('.p14-keycap').filter(has_text=label)
    assert 'is-active' in (await cap.get_attribute('class')), (scheme,key,'no highlight')
    assert await cap.evaluate('(n)=>getComputedStyle(n).backgroundColor')=='rgb(161, 43, 239)'
    await page.keyboard.up(key)
    await page.wait_for_timeout(120)
    assert 'is-active' not in (await cap.get_attribute('class')), (scheme,key,'stuck key')
   assert await frame.evaluate('window.__arrowCount')==1, 'Movement was duplicated'
   print('PASS physical keys, color, release, iframe focus, one movement:',scheme,flush=True)
   if scheme=='PERSONALIZADO':
    await frame.locator('canvas').focus()
    await page.keyboard.down('m');await page.keyboard.down('t');await page.wait_for_timeout(150)
    assert await page.locator('.p14-keycap.is-active').count()==2
    await page.keyboard.up('m');await page.keyboard.up('t')
    await page.wait_for_timeout(150)
    for mode in ['native','chrono','livesplit','native']:
     print('CHECK timer',mode,flush=True)
     await frame.locator('#surfvt-timer-gear').click()
     await frame.locator('[data-mode]').select_option(mode)
     await frame.locator('[data-close]').click()
     await frame.wait_for_function('(m)=>window.__surfvt14TimerController.getConfig().mode===m',arg=mode)
     await page.wait_for_timeout(150)
     visible=await frame.evaluate("Object.entries({native:'#p14-floatingclock',chrono:'#p14-chrono',livesplit:'#chrono'}).filter(([m,s])=>getComputedStyle(document.querySelector(s)).display!=='none').map(([m])=>m)")
     assert visible==[mode], visible
     assert await frame.evaluate('window.__regressionIdentity')==identity, 'Settings reloaded the game'
     await frame.locator('canvas').focus()
     await page.keyboard.press('v');await page.keyboard.press('x');await page.wait_for_timeout(350)
     assert await frame.evaluate('window.chrono.state().timerState')=='running'
     selected=await frame.evaluate("(m)=>m==='livesplit'?window.chrono.state().timerState:window[m==='native'?'P14FloatingClock':'P14Chrono'].state",mode)
     assert selected=='running',(mode,selected)
     await page.keyboard.press('c');await page.wait_for_timeout(150)
     elapsed=await frame.evaluate('window.chrono.state().elapsedMs')
     assert await frame.evaluate('window.chrono.state().timerState')=='paused'
     await page.keyboard.press('x');await page.wait_for_timeout(180)
     assert await frame.evaluate('window.chrono.state().elapsedMs')>elapsed
     await page.keyboard.press('v');await page.wait_for_timeout(150)
     assert await frame.evaluate('window.chrono.state().timerState')=='stopped'
     await page.screenshot(path=str(OUT/('timer-'+mode+'.png')))
     print('PASS visible timer, start, pause, resume, reset, internal menu without navigation:',mode,flush=True)
    assert json.loads(await page.evaluate("localStorage.getItem('surfvt14-settings')"))['timerStyle']=='native'
    await page.get_by_role('button',name='Fechar jogo').click()
    await page.locator('[data-map-id=mexico]').click();await page.locator('.play-button').click()
    next_frame=page.frames[1]
    await next_frame.wait_for_function("window.__surfvt14TimerController?.getConfig().mode==='native' && window.__surfvt14TimerController.getConfig().enabled",timeout=60000)
    print('PASS persisted timer after map change',flush=True)
   assert not errors, errors
   await page.close()
  await browser.close()
asyncio.run(main())
