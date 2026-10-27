/* Extraído/adaptado de P14_Functions/overlay.js para sites comuns.
   Uso: <script src="chrono.js" defer></script>
   API: window.P14Chrono.start(), pause(), reset(), toggle(), destroy().
   Clique: iniciar/pausar. Duplo clique: zerar. Arraste para mover.
*/
(()=>{
 'use strict';
 const apiName='P14Chrono';
 if(window[apiName])return;
 const boot=()=>{
  if(window[apiName])return;
  let elapsed=0, started=0, state='stopped', raf=0, originX=0, originY=0, baseX=0, baseY=0, moved=false, position={x:24,y:24};
  const host=document.createElement('div');host.id='p14-chrono';
  host.style.cssText='all:initial;position:fixed;left:24px;top:24px;z-index:2147483640;touch-action:none;user-select:none;cursor:grab;';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
  :host{all:initial} .timer{box-sizing:border-box;touch-action:none;user-select:none;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;--col:#fff;--font:Roboto,"Segoe UI",system-ui,sans-serif}
  .cells{display:flex;gap:6px}.cell{font-family:var(--font);font-size:26px;line-height:1;font-weight:500;color:var(--col);padding:.38em .42em;border-radius:14px;white-space:nowrap;background:rgba(0,0,0,.88)}.roll{display:inline-block;height:1em;overflow:hidden;vertical-align:bottom;width:.6em;text-align:center}.roll>div{transition:transform .22s cubic-bezier(.3,.7,.3,1)}.roll>div>span{display:block;height:1em;line-height:1}
  </style><div class="timer"><div class="cells"><span class="cell"></span><span class="cell"></span><span class="cell"></span></div></div>`;
  document.documentElement.append(host);
  const timer=root.querySelector('.timer');
  const pad=n=>String(n).padStart(2,'0');
  const now=()=>performance.now();
  const current=()=>elapsed+(state==='running'?now()-started:0);
  const parts=ms=>{const sec=Math.floor(Math.max(0,ms)/1000);return {h:Math.floor(sec/3600),m:Math.floor(sec/60)%60,s:sec%60,t:Math.floor(ms/100)%10};};
  function render(){const p=parts(current());const cells=root.querySelectorAll('.cell');[pad(p.h),pad(p.m),pad(p.s)].forEach((str,j)=>{const el=cells[j];if(el.dataset.len!==String(str.length)){el.dataset.len=str.length;el.innerHTML=[...str].map(()=>`<span class="roll"><div>${Array.from({length:10},(_,n)=>`<span>${n}</span>`).join('')}</div></span>`).join('');} [...str].forEach((ch,i)=>{el.children[i].firstElementChild.style.transform=`translateY(${-Number(ch)}em)`;});});}
  function frame(){if(state!=='running')return;render();raf=requestAnimationFrame(frame);}
  function start(){if(state==='running')return;if(state==='stopped')elapsed=0;started=now();state='running';cancelAnimationFrame(raf);frame();}
  function pause(){if(state!=='running')return;elapsed=current();state='paused';cancelAnimationFrame(raf);render();}
  function reset(){cancelAnimationFrame(raf);elapsed=0;started=0;state='stopped';render();}
  function toggle(){state==='running'?pause():start();}
  let dragging=false, pointerId=null;
  host.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;pointerId=e.pointerId;originX=e.clientX;originY=e.clientY;baseX=position.x;baseY=position.y;moved=false;host.setPointerCapture(e.pointerId);});
  host.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pointerId)return;const dx=e.clientX-originX,dy=e.clientY-originY;if(Math.hypot(dx,dy)>5)moved=true;if(!moved)return;position.x=Math.max(0,Math.min(innerWidth-40,baseX+dx));position.y=Math.max(0,Math.min(innerHeight-30,baseY+dy));host.style.left=position.x+'px';host.style.top=position.y+'px';});
  let clickDelay=0;
  function handleTap(){if(clickDelay){clearTimeout(clickDelay);clickDelay=0;reset();return;}clickDelay=setTimeout(()=>{clickDelay=0;toggle();},300);}
  host.addEventListener('pointerup',e=>{if(e.pointerId===pointerId){const wasMoved=moved;dragging=false;pointerId=null;if(!wasMoved)handleTap();}});
  render();
  window[apiName]={start,pause,reset,toggle,destroy(){cancelAnimationFrame(raf);clearTimeout(clickDelay);host.remove();delete window[apiName];},get state(){return state;},get elapsed(){return current();},element:host};
 };
 if(document.documentElement)boot();else document.addEventListener('DOMContentLoaded',boot,{once:true});
})();

