(function () {
  'use strict';
  if (window.__surfVT14NativeEnhancedControls) return;
  window.__surfVT14NativeEnhancedControls = true;

  var state = { autoBoost: false, hotkey: 'b', hoverboard: false };
  var panel = null, taps = 0, tapTimer = 0, lastTap = 0, synthetic = false;
  function canvas() { return document.querySelector('canvas'); }
  function apply(s) {
    s = s || {};
    if (s.autoBoostEnabled != null) state.autoBoost = !!s.autoBoostEnabled;
    if (s.autoBoostHotkey) state.hotkey = String(s.autoBoostHotkey).toLowerCase();
    if (s.hoverboard != null) state.hoverboard = !!s.hoverboard;
    try { if (window.SurfVT14BoardTripleTap) window.SurfVT14BoardTripleTap.setEnabled(state.hoverboard); } catch (_) {}
    update();
  }
  function update() {
    if (!panel) return;
    var b = panel.querySelector('[data-boost]'), h = panel.querySelector('[data-board]');
    if (b) b.textContent = 'AUTOBOOST: ' + (state.autoBoost ? 'ATIVO' : 'DESATIVADO');
    if (h) h.textContent = 'THREE TOUCH HOVERBOARD: ' + (state.hoverboard ? 'ATIVO' : 'DESATIVADO');
  }
  function closePanel() { if (panel) panel.remove(); panel = null; }
  function openPanel() {
    var c = canvas(); if (!c || panel) return;
    var r = c.getBoundingClientRect();
    panel = document.createElement('div'); panel.id = 'surfvt14-native-settings-extra';
    panel.style.cssText = 'position:fixed;z-index:2147483000;left:' + Math.max(8, r.left + r.width * .08) + 'px;top:' + Math.max(8, r.top + r.height * .16) + 'px;width:min(270px,calc(100vw - 24px));padding:10px;border:1px solid #ffffff44;border-radius:8px;background:#080a0ef2;color:#fff;font:600 11px Arial,sans-serif;box-shadow:0 8px 28px #000b';
    panel.innerHTML = '<strong style="display:block;margin-bottom:7px;font-size:12px">SURFVT14 · ENHANCED</strong><span style="display:block;color:#aeb7c5;font-size:10px;margin-bottom:8px">Controles adicionais neste menu do jogo</span><button type="button" data-boost style="width:100%;padding:8px;margin:4px 0;border:1px solid #ffffff44;border-radius:6px;background:#172131;color:#fff;font:600 10px Arial">AUTOBOOST: DESATIVADO</button><button type="button" data-board style="width:100%;padding:8px;margin:4px 0;border:1px solid #ffffff44;border-radius:6px;background:#172131;color:#fff;font:600 10px Arial">THREE TOUCH HOVERBOARD: DESATIVADO</button><span style="display:block;color:#aeb7c5;font-size:10px;margin-top:7px">A prancha exige exatamente 3 toques/cliques.</span>';
    document.body.appendChild(panel);
    panel.querySelector('[data-boost]').onclick = function (e) { e.stopPropagation(); state.autoBoost = !state.autoBoost; update(); };
    panel.querySelector('[data-board]').onclick = function (e) { e.stopPropagation(); state.hoverboard = !state.hoverboard; apply(state); };
    update();
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
  function rocketClick() {
    var c = canvas(); if (!c) return;
    var r = c.getBoundingClientRect(), x = r.left+r.width*.12, y = r.top+r.height*.86;
    synthetic = true; [0,70,140].forEach(function (delay,i) { setTimeout(function(){ tap(x,y,i); if(i===2)setTimeout(function(){synthetic=false;},100); },delay); });
  }
  window.addEventListener('message', function(e){ if(e.data && e.data.type==='SURFVT14_HUB_SETTINGS') apply(e.data.settings); });
  window.addEventListener('keydown', function(e){ var k=String(e.key||'').toLowerCase(), code=String(e.code||'').toLowerCase().replace(/^key/,''); if(!e.repeat && state.autoBoost && (k===state.hotkey||code===state.hotkey)){e.preventDefault();e.stopPropagation();rocketClick();}},true);
  window.addEventListener('pointerup', function(e){
    if(nativeSettingsClick(e)) setTimeout(openPanel,120);
    else if(panel && !panel.contains(e.target)) closePanel();
    if(!state.hoverboard || synthetic || e.isTrusted===false) return;
    var now=Date.now(); if(now-lastTap<140)return; lastTap=now; taps++; clearTimeout(tapTimer);
    if(taps===3){taps=0;rocketClick();} else tapTimer=setTimeout(function(){taps=0;},700);
  },true);
  window.addEventListener('touchend', function(e){
    if(!state.hoverboard || synthetic || e.isTrusted===false)return;
    var now=Date.now(); if(now-lastTap<140)return; lastTap=now; taps++; clearTimeout(tapTimer);
    if(taps===3){taps=0;rocketClick();} else tapTimer=setTimeout(function(){taps=0;},700);
  },true);
  apply(window.__surfVT14Settings || {});
})();
