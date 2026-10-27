"""Real Unity startup and play through age/consent screens. Requires Python Playwright and Chromium. Set MAP_BASE_URL and EVIDENCE_DIR. Mobile means Chromium emulation, not iOS validation."""
import asyncio,json,math,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
  for mobile in [False,True]:
   for name in ['winterholiday','mexico','barcelona','bangkok']:
    context=await browser.new_context(viewport={'width':390 if mobile else 480,'height':844 if mobile else 720},is_mobile=mobile,has_touch=mobile,device_scale_factor=1, **({"user_agent":"Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"} if mobile else {}))
    pg=await context.new_page();events=[];errors=[]
    pg.on('pageerror',lambda e:errors.append(str(e)))
    await pg.add_init_script("window.__gameEvents=[];let sdk;Object.defineProperty(window,'PokiSDK',{configurable:true,get(){return sdk},set(v){sdk=v;for(const k of Object.keys(v)){if(typeof v[k]==='function'){const f=v[k];v[k]=function(...args){window.__gameEvents.push([k,...args]);return f.apply(this,args)}}}}});")
    print('START',name,'mobile' if mobile else 'desktop',flush=True)
    await pg.goto(os.getenv('MAP_BASE_URL', 'http://127.0.0.1:8081')+'/maps/'+name+'/index.html',wait_until='domcontentloaded')
    await pg.wait_for_function("document.querySelector('#loading').classList.contains('done')",timeout=110000)
    await pg.wait_for_timeout(8000)
    tag=name+('-mobile' if mobile else '-desktop')
    await pg.screenshot(path=os.getenv('EVIDENCE_DIR','/tmp')+'/'+tag+'-age.png')
    w,h=(390,844) if mobile else (480,720)
    dw=min(w-20,h*.64);dh=dw/.657;left=(w-dw)/2;top=(h-dh)/2
    async def click(x,y):
     if mobile:await pg.touchscreen.tap(x,y)
     else:await pg.mouse.click(x,y)
     await pg.wait_for_timeout(700)
    await click(left+dw*.174,top+dh*.2);await click(left+dw*.467,top+dh*.2);await click(w/2,top+dh*.88)
    await pg.wait_for_timeout(8000)
    await pg.screenshot(path=os.getenv('EVIDENCE_DIR','/tmp')+'/'+tag+'-consent.png')
    await click(left+dw*.36,top+dh*.59);await click(w/2,top+dh*.72)
    await pg.wait_for_timeout(2000)
    await pg.screenshot(path=os.getenv('EVIDENCE_DIR','/tmp')+'/'+tag+'-menu.png')
    await click(w/2,h*.84)
    if not mobile: await pg.keyboard.press('Space')
    await pg.wait_for_timeout(4000)
    await pg.screenshot(path=os.getenv('EVIDENCE_DIR','/tmp')+'/'+tag+'-play.png')
    events=await pg.evaluate('window.__gameEvents')
    print('RESULT',tag,events,errors,pg.url,flush=True)
    assert any(e[0]=='gameplayStart' for e in events), (tag, 'No gameplayStart')
    assert any(e[0]=='roundStart' for e in events), (tag, 'No roundStart')
    assert not errors, (tag,errors)
    assert '/maps/'+name+'/' in pg.url, (tag,'Unexpected navigation')
    await context.close()
  await browser.close()
asyncio.run(main())
