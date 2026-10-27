"""Exercise real timer APIs across paused resumes and automatic new-run boundaries."""
import asyncio,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  pg=await b.new_page();base=os.getenv('MAP_BASE_URL','http://127.0.0.1:8081')
  await pg.goto(base+'/chronometers/timer-fonts.css');await pg.set_content('<html><head></head><body></body></html>')
  for n in ['input-bridge','livesplit','chrono','floatingclock','timer-controller','timer-settings']:await pg.add_script_tag(url=base+'/chronometers/'+n+'.js')
  for mode in ['native','chrono','livesplit']:
   await pg.evaluate("m=>window.__surfvt14TimerController.setConfig({enabled:true,mode:m,autoMode:false,startHotkey:'x',pauseHotkey:'c',resetHotkey:'v'})",mode)
   async def snap():return await pg.evaluate("m=>m==='livesplit'?{state:chrono.state().timerState,elapsed:chrono.state().elapsedMs}:{state:window[m==='native'?'P14FloatingClock':'P14Chrono'].state,elapsed:window[m==='native'?'P14FloatingClock':'P14Chrono'].elapsed}",mode)
   await pg.keyboard.press('x');await pg.wait_for_timeout(400)
   a=await snap();assert a['state']=='running' and a['elapsed']>250,a
   await pg.keyboard.press('c');await pg.wait_for_timeout(120)
   a=await snap();assert a['state']=='paused',a
   await pg.keyboard.press('x');await pg.wait_for_timeout(200)
   c=await snap();assert c['elapsed']>a['elapsed'],(a,c)
   await pg.evaluate('chrono.start()');await pg.wait_for_timeout(110)
   a=await snap();assert a['state']=='running' and a['elapsed']<250,a
   await pg.keyboard.press('v');await pg.wait_for_timeout(120)
   a=await snap();assert a['state']=='stopped' and a['elapsed']==0,a
   print('PASS timer state, elapsed, resume and automatic new run:',mode,flush=True)
  await b.close()
asyncio.run(main())
