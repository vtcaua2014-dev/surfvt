(function () {
  'use strict';
  if (window.__surfVT14ZurichThreeTouchSettings) return;
  window.__surfVT14ZurichThreeTouchSettings = true;

  var storageKey = 'surfvt14ZurichThreeTouchHoverboard';
  var state = { hoverboard: false };
  var panel = null, taps = 0, tapTimer = 0, lastTap = 0, synthetic = false;
  try { state.hoverboard = window.localStorage.getItem(storageKey) === 'true'; window.localStorage.removeItem('surfvt14BoardTripleTap'); } catch (_) {}

  function canvas() { return document.querySelector('canvas'); }
  function apply(value) {
    state.hoverboard = !!value;
    try { window.localStorage.setItem(storageKey, state.hoverboard ? 'true' : 'false'); } catch (_) {}
    if (window.SurfVT14BoardTripleTap) window.SurfVT14BoardTripleTap.setEnabled(state.hoverboard);
    if (panel) {
      var button = panel.querySelector('[data-board]');
      var status = panel.querySelector('[data-status]');
      if (button) button.setAttribute('aria-checked', state.hoverboard ? 'true' : 'false');
      if (status) status.textContent = state.hoverboard ? 'Ligado' : 'Desligado';
    }
  }
  function closePanel() { if (panel) panel.remove(); panel = null; taps = 0; clearTimeout(tapTimer); }
  function openPanel() {
    var c = canvas(); if (!c || panel) return;
    taps = 0; clearTimeout(tapTimer);
    var r = c.getBoundingClientRect();
    panel = document.createElement('section');
    panel.id = 'zurich-game-settings-panel';
    panel.setAttribute('aria-label', 'Configurações do jogo');
    panel.style.cssText = 'position:fixed;z-index:2147483000;left:' + Math.max(8, r.left + r.width * .08) + 'px;top:' + Math.max(8, r.top + r.height * .16) + 'px;width:min(310px,calc(100vw - 24px));padding:14px;border:1px solid #ffffff44;border-radius:12px;background:#101522f5;color:#fff;font:600 12px Arial,sans-serif;box-shadow:0 8px 28px #000b;backdrop-filter:blur(12px)';
    panel.innerHTML = '<h2 style="margin:0 0 12px;color:#8fd8ff;font:800 11px Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase">CONFIGURAÇÕES DO JOGO</h2><div style="display:flex;align-items:center;gap:10px;min-height:58px;padding:8px;border:1px solid #ffffff22;border-radius:9px;background:#ffffff08"><span aria-hidden="true" style="display:grid;place-items:center;width:40px;height:40px;flex:0 0 auto;border:1px solid #d8efff;border-radius:8px;background:linear-gradient(145deg,#19baff,#0075ef);font-size:20px">▱</span><span style="display:grid;gap:4px;min-width:0;flex:1"><strong style="font-size:12px;line-height:1.2">Three Touch Hoverboard</strong><small data-status style="color:#57d6ff;font-size:11px">Desligado</small></span><button type="button" data-board role="switch" aria-label="Three Touch Hoverboard" aria-checked="false" style="display:flex;width:42px;height:24px;flex:0 0 auto;align-items:center;border:1px solid #72829c;border-radius:99px;padding:2px;background:#20293a;cursor:pointer"><span aria-hidden="true" style="width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .16s"></span></button></div>';
    document.body.appendChild(panel);
    var boardButton = panel.querySelector('[data-board]');
    boardButton.onclick = function (e) { e.preventDefault(); e.stopPropagation(); apply(!state.hoverboard); };
    boardButton.addEventListener('click', function () { var knob = boardButton.querySelector('span'); boardButton.style.background = state.hoverboard ? '#087ff0' : '#20293a'; boardButton.style.borderColor = state.hoverboard ? '#118bff' : '#72829c'; knob.style.transform = state.hoverboard ? 'translateX(18px)' : 'translateX(0)'; });
    apply(state.hoverboard);
    boardButton.style.background = state.hoverboard ? '#087ff0' : '#20293a';
    boardButton.style.borderColor = state.hoverboard ? '#118bff' : '#72829c';
    boardButton.querySelector('span').style.transform = state.hoverboard ? 'translateX(18px)' : 'translateX(0)';
  }
  function nativeSettingsClick(e) {
    var c = canvas(); if (!c || !e || e.isTrusted === false) return false;
    var r = c.getBoundingClientRect(), x = (e.clientX-r.left)/Math.max(1,r.width), y = (e.clientY-r.top)/Math.max(1,r.height);
    return x > .10 && x < .38 && y > .02 && y < .24;
  }
  function tap(x, y, id) {
    var c = canvas(); if (!c) return;
    var init = { bubbles:true, cancelable:true, view:window, clientX:x, clientY:y, button:0, buttons:1 };
    try { c.dispatchEvent(new PointerEvent('pointerdown', Object.assign({},init,{pointerId:900+id,pointerType:'touch',isPrimary:true,pressure:.7}))); } catch (_) {}
    try { var T=window.Touch; var t=T?new T({identifier:900+id,target:c,clientX:x,clientY:y,pageX:x,pageY:y}):{identifier:900+id,target:c,clientX:x,clientY:y,pageX:x,pageY:y}; c.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[t],targetTouches:[t],changedTouches:[t]})); } catch (_) {}
    c.dispatchEvent(new MouseEvent('mousedown',init));
    try { c.dispatchEvent(new PointerEvent('pointerup', Object.assign({},init,{pointerId:900+id,pointerType:'touch',buttons:0,pressure:0}))); } catch (_) {}
    try { var T2=window.Touch; var t2=T2?new T2({identifier:900+id,target:c,clientX:x,clientY:y,pageX:x,pageY:y}):{identifier:900+id,target:c,clientX:x,clientY:y,pageX:x,pageY:y}; c.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[t2]})); } catch (_) {}
    c.dispatchEvent(new MouseEvent('mouseup',Object.assign({},init,{buttons:0}))); c.dispatchEvent(new MouseEvent('click',init));
  }
  function activateBoard() {
    var c = canvas(); if (!c) return;
    var r = c.getBoundingClientRect(), x = r.left+r.width*.12, y = r.top+r.height*.86;
    synthetic = true;
    [0,70,140].forEach(function (delay,i) { setTimeout(function(){ tap(x,y,i); if(i===2)setTimeout(function(){synthetic=false;},100); },delay); });
  }

  window.addEventListener('pointerup', function(e){
    if(nativeSettingsClick(e)) setTimeout(openPanel,120);
    else if(panel && !panel.contains(e.target)) closePanel();
    if((panel && panel.contains(e.target)) || e.pointerType === 'touch' || !state.hoverboard || synthetic || e.isTrusted===false) return;
    var now=Date.now(); if(now-lastTap<140)return; lastTap=now; taps++; clearTimeout(tapTimer);
    if(taps===3){taps=0;activateBoard();} else tapTimer=setTimeout(function(){taps=0;},700);
  },true);
  window.addEventListener('touchend', function(e){
    if((panel && panel.contains(e.target)) || !state.hoverboard || synthetic || e.isTrusted===false)return;
    var now=Date.now(); if(now-lastTap<140)return; lastTap=now; taps++; clearTimeout(tapTimer);
    if(taps===3){taps=0;activateBoard();} else tapTimer=setTimeout(function(){taps=0;},700);
  },true);
  apply(state.hoverboard);
})();