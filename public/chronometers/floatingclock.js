/* Extraído/adaptado de P14_Functions/overlay.js para sites comuns.
   Uso: <script src="floatingclock.js" defer></script>
   API: window.P14FloatingClock.start(), pause(), reset(), toggle(), destroy().
   Clique: iniciar/pausar. Duplo clique: zerar. Arraste para mover.
*/
(()=>{
 'use strict';
 const apiName='P14FloatingClock';
 if(window[apiName])return;
 const boot=()=>{
  if(window[apiName])return;
  let elapsed=0, started=0, state='stopped', raf=0, originX=0, originY=0, baseX=0, baseY=0, moved=false, position={x:24,y:24};
  const host=document.createElement('div');host.id='p14-floatingclock';
  host.style.cssText='all:initial;position:fixed;left:24px;top:24px;z-index:2147483640;touch-action:none;user-select:none;cursor:grab;';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
  :host{all:initial} .timer{box-sizing:border-box;touch-action:none;user-select:none;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;--col:#fff;--font:Roboto,"Segoe UI",system-ui,sans-serif}
  .timer{width:260px;padding:11px 12px 12px;color:#fff;border-radius:26px;background:#000;font-family:-apple-system,"SF Pro Display","Helvetica Neue",Helvetica,Arial,sans-serif}.fl-head{display:flex;align-items:center;gap:7px;margin-bottom:4px}.fl-ico{width:21px;height:21px;border-radius:6px;background:linear-gradient(135deg,#78cfde,#2f8fb8);display:grid;place-items:center;font:700 7px/1 system-ui;color:#fff}.fl-name{font-size:10.5px;font-weight:700;color:#fff}.time{font-size:40px;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600;letter-spacing:-.02em;color:var(--col);display:flex;justify-content:center}.dg{display:inline-block;width:.6em;text-align:center}.pill{margin:7px auto 0;display:flex;width:max-content;align-items:center;gap:6px;background:#2f5158;color:#fff;border-radius:8px;padding:3px 6px;font-size:12px;font-weight:600}.fc-action{display:grid;place-items:center;min-width:28px;height:27px;border:1px solid rgba(255,255,255,.28);border-radius:6px;padding:0 7px;background:rgba(0,0,0,.16);color:#fff;font:700 15px/1 system-ui;cursor:pointer;touch-action:manipulation}.fc-action:active{transform:scale(.94)}.pill span{min-width:44px;text-align:center}
  </style><div class="timer"><div class="fl-head"><span class="fl-ico">9:00</span><span class="fl-name">Floating Clock</span></div><div class="time"></div><div class="pill"><button class="fc-action fc-toggle" type="button" aria-label="Iniciar ou pausar">▶</button><span>Ready</span><button class="fc-action fc-reset" type="button" aria-label="Reiniciar">↻</button></div></div>`;
  document.documentElement.append(host);
  const timer=root.querySelector('.timer');
  const pad=n=>String(n).padStart(2,'0');
  const now=()=>performance.now();
  const current=()=>elapsed+(state==='running'?now()-started:0);
  const parts=ms=>{const sec=Math.floor(Math.max(0,ms)/1000);return {h:Math.floor(sec/3600),m:Math.floor(sec/60)%60,s:sec%60,t:Math.floor(ms/100)%10};};
  function render(){const p=parts(current());const txt=`${pad(p.h)}:${pad(p.m)}:${pad(p.s)}.${p.t}`;const box=root.querySelector('.time');if(box.dataset.text!==txt){box.dataset.text=txt;box.innerHTML=[...txt].map(ch=>/\d/.test(ch)?`<span class="dg">${ch}</span>`:`<span>${ch}</span>`).join('');}root.querySelector('.pill span').textContent=state==='running'?'Running':state==='paused'?'Paused':'Ready';root.querySelector('.fc-toggle').textContent=state==='running'?'Ⅱ':'▶';}
  function frame(){if(state!=='running')return;render();raf=requestAnimationFrame(frame);}
  function start(){if(state==='running')return;if(state==='stopped')elapsed=0;started=now();state='running';cancelAnimationFrame(raf);frame();}
  function pause(){if(state!=='running')return;elapsed=current();state='paused';cancelAnimationFrame(raf);render();}
  function reset(){cancelAnimationFrame(raf);elapsed=0;started=0;state='stopped';render();}
  function toggle(){state==='running'?pause():start();}
  root.querySelector('.fc-toggle').addEventListener('click',e=>{e.stopPropagation();toggle();});
  root.querySelector('.fc-reset').addEventListener('click',e=>{e.stopPropagation();reset();});
  let dragging=false, pointerId=null;
  host.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(e.composedPath().some(node=>node instanceof Element&&node.classList.contains('fc-action')))return;dragging=true;pointerId=e.pointerId;originX=e.clientX;originY=e.clientY;baseX=position.x;baseY=position.y;moved=false;host.setPointerCapture(e.pointerId);});
  host.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pointerId)return;const dx=e.clientX-originX,dy=e.clientY-originY;if(Math.hypot(dx,dy)>5)moved=true;if(!moved)return;position.x=Math.max(0,Math.min(innerWidth-40,baseX+dx));position.y=Math.max(0,Math.min(innerHeight-30,baseY+dy));host.style.left=position.x+'px';host.style.top=position.y+'px';});
  host.addEventListener('pointerup',e=>{if(e.pointerId===pointerId){dragging=false;pointerId=null;}});
  host.addEventListener('click',()=>{if(moved)moved=false;});
  render();
  window[apiName]={start,pause,reset,toggle,destroy(){cancelAnimationFrame(raf);host.remove();delete window[apiName];},get state(){return state;},get elapsed(){return current();},element:host};
 };
 if(document.documentElement)boot();else document.addEventListener('DOMContentLoaded',boot,{once:true});
})();

