// P14 Functions — ponte no mundo MAIN da página: eventos do jogo (Poki/Unity) e remapeamento WASD.
// By Player14sbs
(() => {
  if (window.__p14Bridge) return;
  window.__p14Bridge = true;

  const post = msg => {
    try { window.top.postMessage(Object.assign({ __p14: true }, msg), "*"); } catch (_) {}
  };

  /* ---------- configuração publicada pelo content script ---------- */
  let cached = { s: null, v: null };
  function cfg() {
    const s = document.documentElement && document.documentElement.dataset.p14Cfg;
    if (s === cached.s) return cached.v;
    let v = null;
    try { v = JSON.parse(s); } catch (_) {}
    cached = { s, v };
    return v;
  }

  /* ---------- eventos do jogo (portado do chrono.js) ---------- */
  let lastSig = "", lastAt = -1e9;
  function emit(type, detail) {
    const c = cfg();
    if (!c || !c.here) return;
    const t = performance.now();
    let d = {};
    try { d = JSON.parse(JSON.stringify(detail || {})); } catch (_) {}
    const sig = type + ":" + JSON.stringify({ v: d.value, c: d.counterDelta });
    if (sig === lastSig && t - lastAt < 80) return;
    lastSig = sig; lastAt = t;
    post({ kind: "ev", type, detail: d });
  }

  /* ---------- mouse/toque alinhados quando o canvas é esticado/escalado ----------
   * O "Redimensionar" renderiza o canvas em W×H (tamanho de layout) e o estica com transform. Os jogos calculam o clique
   * misturando getBoundingClientRect (tamanho VISUAL) com clientWidth (tamanho de LAYOUT) → clique deslocado.
   * Aqui o jogo "enxerga" o canvas sem transformação: getBoundingClientRect devolve o retângulo de layout em (0,0) e as
   * coordenadas dos eventos chegam já convertidas para esse espaço. Vale para qualquer fórmula que o jogo use e para
   * qualquer posição/escala (a conversão vem da geometria real do canvas a cada momento). Só age em canvas redimensionado
   * pela extensão (data-p14rs) e só nos sites do hub; o código da própria extensão (outro "mundo") não é afetado. */
  let fixOn = false, fixInstalled = false, cvRef = null, gcache = null;
  const realGBCR = typeof Element !== "undefined" && Element.prototype ? Element.prototype.getBoundingClientRect : null;
  const rsCanvas = () => (cvRef && cvRef.isConnected && cvRef.dataset.p14rs ? cvRef : (cvRef = document.querySelector("canvas[data-p14rs]")));
  function geom() {
    if (!fixOn) return null;
    const t = performance.now();
    if (gcache && t - gcache.t < 25) return gcache.g; // várias propriedades do mesmo evento reaproveitam a medição
    let g = null;
    const cv = rsCanvas();
    if (cv) {
      const r = realGBCR.call(cv), lw = cv.clientWidth, lh = cv.clientHeight;
      if (lw && lh && r.width && r.height) {
        const sx = r.width / lw, sy = r.height / lh;
        if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) g = { cv, l: r.left, t: r.top, sx, sy, lw, lh };
      }
    }
    gcache = { t, g };
    return g;
  }
  function wrapGetter(proto, prop, map) {
    const d = proto && Object.getOwnPropertyDescriptor(proto, prop);
    if (!d || typeof d.get !== "function") return;
    const og = d.get;
    Object.defineProperty(proto, prop, { configurable: true, enumerable: d.enumerable, set: d.set,
      get() { const v = og.call(this); const g = geom(); return g ? map(v, g) : v; } });
  }
  function installFix() {
    if (fixInstalled || !realGBCR || typeof MouseEvent === "undefined") return; // contexto sem DOM completo: não faz nada
    fixInstalled = true;
    const mx = (v, g) => (v - g.l) / g.sx, my = (v, g) => (v - g.t) / g.sy;
    const px = (v, g) => mx(v - window.scrollX, g) + window.scrollX, py = (v, g) => my(v - window.scrollY, g) + window.scrollY;
    const pos = { clientX: mx, clientY: my, pageX: px, pageY: py };
    for (const k in pos) { wrapGetter(MouseEvent.prototype, k, pos[k]); if (window.Touch) wrapGetter(Touch.prototype, k, pos[k]); }
    wrapGetter(MouseEvent.prototype, "x", mx); wrapGetter(MouseEvent.prototype, "y", my);
    wrapGetter(MouseEvent.prototype, "movementX", (v, g) => v / g.sx); wrapGetter(MouseEvent.prototype, "movementY", (v, g) => v / g.sy);
    Element.prototype.getBoundingClientRect = function () {
      const r = realGBCR.call(this);
      if (fixOn && this.tagName === "CANVAS" && this.dataset && this.dataset.p14rs) {
        const g = geom();
        if (g && g.cv === this) return new DOMRect(0, 0, g.lw, g.lh);
      }
      return r;
    };
  }
  const syncFix = c => { fixOn = !!(c && c.here && c.rs); gcache = null; if (fixOn) installFix(); };

  /* ---------- Modos de gráficos (OFF / DESEMPENHO / LOW / MEDIUM / HIGH / ULTRA) ----------
   * Valem para qualquer jogo de canvas/WebGL (Subway Surfers em Unity, Subway Crackers, Subway Moggers…):
   *  • devicePixelRatio que o jogo enxerga × fator do modo → resolução de renderização (jogos que medem o canvas com o DPR)
   *  • antialiasing e powerPreference dos contextos WebGL criados depois da configuração chegar (recarregue a página)
   *  • adaptador do Subway Moggers: o jogo expõe window.__dbg.R.setQuality → recebe o nível 0/1/2
   *  • DESEMPENHO: mede o FPS do jogo e baixa a resolução passo a passo até o FPS ficar bom
   * Só age nos sites do hub e só com o modo ligado. */
  let gfx = null, gfxKey = "", gfxInstalled = false, origQ = null, adaptTimer = 0;
  const perf = { lvl: 0, raf: 0, t0: 0, frames: 0, started: 0, lastStep: 0 };
  const gfxFactor = () => {
    if (!gfx) return 1;
    if (!gfx.auto) return gfx.dpr;
    return Math.max(0.35, gfx.dpr * (gfx.auto.steps[Math.min(perf.lvl, gfx.auto.steps.length - 1)] || 1));
  };
  function installGfx() {
    if (gfxInstalled || typeof window === "undefined") return;
    gfxInstalled = true;
    try {
      let owner = window, d = Object.getOwnPropertyDescriptor(owner, "devicePixelRatio");
      if (!d) { owner = Object.getPrototypeOf(window); d = owner && Object.getOwnPropertyDescriptor(owner, "devicePixelRatio"); }
      if (d && typeof d.get === "function") {
        Object.defineProperty(window, "devicePixelRatio", { configurable: true, enumerable: d.enumerable, set: d.set,
          get() { const v = d.get.call(window); return gfx ? Math.min(3, Math.max(0.35, v * gfxFactor())) : v; } });
      }
    } catch (_) {}
    try {
      if (typeof HTMLCanvasElement !== "undefined") {
        const og = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, attrs) {
          if (gfx && typeof type === "string" && /^(webgl2?|experimental-webgl)$/.test(type)) {
            attrs = Object.assign({}, attrs); // mantém o resto dos atributos que o jogo pediu
            attrs.antialias = gfx.aa;
            if (gfx.power) attrs.powerPreference = gfx.power;
          }
          return og.call(this, type, attrs);
        };
      }
    } catch (_) {}
  }
  const remeasure = () => { try { window.dispatchEvent(new Event("resize")); } catch (_) {} }; // os jogos medem o canvas de novo

  // DESEMPENHO: a cada janela de medição calcula o FPS (cadência do requestAnimationFrame); se ficou abaixo da meta,
  // desce um degrau de resolução. Só desce (sem oscilar) e espera o jogo carregar antes de começar.
  function perfTick(ts) {
    const a = gfx && gfx.auto;
    if (!a) { perf.raf = 0; return; }
    perf.raf = requestAnimationFrame(perfTick);
    if (document.hidden) { perf.t0 = 0; return; } // aba em segundo plano: rAF pausa, não mede
    if (!perf.t0) { perf.t0 = ts; perf.frames = 0; return; }
    perf.frames++;
    const dt = ts - perf.t0;
    if (dt < a.window) return;
    const fps = perf.frames * 1000 / dt;
    perf.t0 = ts; perf.frames = 0;
    if (ts - perf.started > a.warm && ts - perf.lastStep > a.every && fps < a.target && perf.lvl < a.steps.length - 1) {
      perf.lvl++; perf.lastStep = ts; remeasure();
    }
  }
  function perfSync(reset) {
    if (!(gfx && gfx.auto)) { if (perf.raf) cancelAnimationFrame(perf.raf); perf.raf = 0; return; }
    if (reset) { perf.lvl = 0; perf.t0 = 0; perf.frames = 0; perf.started = performance.now(); perf.lastStep = 0; }
    if (!perf.raf) perf.raf = requestAnimationFrame(perfTick);
  }

  function adaptQuality() {
    clearInterval(adaptTimer);
    const run = () => {
      const D = window.__dbg;
      if (!(D && D.R && typeof D.R.setQuality === "function" && D.save)) return false;
      if (gfx) {
        if (origQ == null) origQ = { r: D.R.quality, s: D.save.quality };
        if (D.R.quality !== gfx.q) D.R.setQuality(gfx.q);
        D.save.quality = gfx.q;
      } else if (origQ != null) { D.R.setQuality(origQ.r); D.save.quality = origQ.s; origQ = null; }
      return true;
    };
    try { if (run() || !gfx) return; } catch (_) { return; }
    let tries = 0; // o jogo pode demorar a carregar: tenta por até ~1 minuto
    adaptTimer = setInterval(() => { try { if (run() || ++tries > 60) clearInterval(adaptTimer); } catch (_) { clearInterval(adaptTimer); } }, 1000);
  }
  function syncGfx(c) {
    // gfx params chegam quando: (a) site é do hub (here=true) OU (b) overlay detectou subway (gfx != null);
    // null → bridge desliga DPR/WebGL/perf nessa aba
    const next = c && c.gfx ? c.gfx : null;
    const key = JSON.stringify(next);
    const changed = key !== gfxKey;
    gfx = next; gfxKey = key;
    if (next) installGfx();
    if (changed) { perfSync(true); remeasure(); }
    if (changed || next) adaptQuality();
  }

  /* O SDK do Poki só é tocado nos sites do hub (cfg.here). Antes o script consultava a página a cada
   * 150 ms para sempre, em todo frame de todo site; agora usa um "setter" + o aviso do content script. */
  const POKI_METHODS = ["init", "commercialBreak", "rewardedBreak", "gameplayStart", "gameplayStop", "roundEnd", "roundStart"];
  let wrapped = false, armed = false, pokiVal;

  function wrapPoki() {
    const sdk = window.PokiSDK;
    if (wrapped || !sdk || typeof sdk !== "object") return;
    const c = cfg();
    if (!c || !c.here) return;
    for (const name of POKI_METHODS) {
      try {
        const orig = typeof sdk[name] === "function" ? sdk[name] : () => Promise.resolve(true);
        if (orig.__p14) continue;
        const w = function (...args) { emit("poki:" + name, {}); return orig.apply(this, args); };
        w.__p14 = true;
        sdk[name] = w;
      } catch (_) {}
    }
    wrapped = true;
  }

  function arm() {
    const c = cfg();
    syncFix(c);
    syncGfx(c);
    if (!c || !c.here) return;
    if (!armed) {
      armed = true;
      pokiVal = window.PokiSDK;
      try {
        Object.defineProperty(window, "PokiSDK", {
          configurable: true, enumerable: true,
          get() { return pokiVal; },
          set(v) { pokiVal = v; wrapped = false; wrapPoki(); }
        });
      } catch (_) { /* a página já definiu a propriedade: os eventos abaixo cobrem */ }
    }
    wrapPoki();
  }
  document.addEventListener("p14:cfg", arm);          // o content script avisa quando a configuração chega
  document.addEventListener("DOMContentLoaded", arm);
  window.addEventListener("load", arm);
  arm();

  // eventos que o próprio site já emite
  window.addEventListener("tro:unity-runtime-event", e => {
    const d = (e && e.detail) || {};
    if (d.type) emit(String(d.type), d);
  });

  /* ---------- WASD → setas (lógica do WASD.ahk) ---------- */
  const ARROWS = {
    up: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
    down: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
    left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
    right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 }
  };
  const held = new Map(); // code original -> direção

  const typing = t => !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

  function synth(type, dir, repeat) {
    const def = ARROWS[dir];
    const ev = new KeyboardEvent(type, {
      key: def.key, code: def.code, keyCode: def.keyCode, which: def.keyCode,
      bubbles: true, cancelable: true, composed: true, repeat: !!repeat, view: window
    });
    if (ev.keyCode !== def.keyCode) {
      try {
        Object.defineProperty(ev, "keyCode", { get: () => def.keyCode });
        Object.defineProperty(ev, "which", { get: () => def.keyCode });
      } catch (_) {}
    }
    const ae = document.activeElement;
    (ae && ae !== document.body ? ae : document.body).dispatchEvent(ev);
  }

  function onKey(e) {
    const c = cfg();
    if (!c || !c.here || !c.wasd || !c.wasd.on || !e.isTrusted) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const dir = ["up", "down", "left", "right"].find(d => c.wasd[d] === e.code);
    if (!dir) return;
    if (typing(e.target)) return;
    e.preventDefault();
    e.stopPropagation(); // os outros listeners da janela (teclas na tela) ainda recebem a tecla original
    if (e.type === "keydown") { held.set(e.code, dir); synth("keydown", dir, e.repeat); }
    else { held.delete(e.code); synth("keyup", dir, false); }
  }
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("keyup", onKey, true);
  window.addEventListener("blur", () => {
    for (const dir of held.values()) synth("keyup", dir, false);
    held.clear();
  });
})();
