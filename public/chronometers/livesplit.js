/*
 * Subway Surfers LiveSplit-style timer.
 *
 * Visual/interface: kept from the project's chrono UI.
 * Automation: follows the event/state model used by the reference Subway
 * Surfers timer implementation supplied by the user, especially:
 *   - gameplayStart / roundStart => start a NEW run only when stopped/ended
 *   - roundEnd => pause for death while running
 *   - scoreChanged/scoreStopped => pause/resume from the actual score state
 *   - rewardedBreak + gameplayStart or reborn:runResumed => resume a death-paused run (revive)
 *   - A/D/ArrowLeft/ArrowRight are never a pause/resume trigger
 */
(function () {
  'use strict';

  if (document.getElementById('chrono')) return;

  const STORAGE_KEY = 'chronoSettings_livesplit_newrun-mobile-v11';
  const STOPPED_COLOR = '#9a9a9a';
  const PAUSED_COLOR = '#2196f3';
  const SHADOW_COLOR = '#000000';
  const DEFAULT_FONT = '"Century Gothic", Calibri, "Segoe UI", Arial, sans-serif';

  const DEFAULTS = {
    left: 12,
    top: 12,
    width: 234,
    height: 54,
    bgColor: '#000000',
    runningColor: '#29cc54',
    pausedColor: PAUSED_COLOR,
    stoppedColor: STOPPED_COLOR,
    endedColor: '#ff5a5f',
    shadowColor: SHADOW_COLOR,
    timeFormat: 'auto',
    backgroundImage: '',
    customFontData: '',
    customFontName: '',
    startKey: null,
    pauseKey: null,
    resetKey: null
  };

  const LIMITS = {
    widthMin: 180,
    widthMax: 1000,
    heightMin: 42,
    heightMax: 200
  };

  /* ---------- reference automation timing ---------- */
  const START_IGNORE_AFTER_GAMEPLAY_MS = 2500;
  const STARTUP_COIN_GUARD_MS = 250;
  const COIN_DUPLICATE_MS = 220;
  const REVIVE_WINDOW_MS = 20000;
  const DUPLICATE_EVENT_MS = 80;

  /* ---------- reference coin-counter monitor ---------- */
  const COIN_COUNTER_SEEDS = [5944977, 5944978, 5944986, 11497052, 12636843];
  const COIN_COUNTER_MIN_MATCHES = 3;
  const COIN_COUNTER_MAX_DELTA = 25;
  const COIN_COUNTER_SCAN_RADIUS = 1800000;
  const COIN_COUNTER_SCAN_BUDGET = 32768; // um terço do trabalho por ciclo, para reduzir impacto no Unity
  const COIN_COUNTER_STABILITY = 3;
  const COIN_COUNTER_INTERVAL_MS = 140;
  const COIN_COUNTER_ARM_DELAY_MS = 350;
  const COIN_COUNTER_PENDING_MS = 1800;
  const COIN_COUNTER_MAX_VALUE = 100000;
  const COIN_COUNTER_MAX_MATCHES_PER_VALUE = 16;

  /* ---------- CSS ---------- */
  const style = document.createElement('style');
  style.textContent = `
    #chrono {
      position: fixed;
      z-index: 2147483640;
      width: var(--chrono-width, 380px);
      height: var(--chrono-height, 72px);
      box-sizing: border-box;
      padding: 0 14px;
      margin: 0;
      border: 0;
      border-radius: 0 !important;
      background: var(--chrono-bg, #000);
      box-shadow: 0 4px 14px rgba(0,0,0,.28);
      isolation: isolate;
      overflow: hidden;
      user-select: none;
      touch-action: none;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      line-height: 1;
    }

    #chrono.dragging { cursor: grabbing; }

    #chrono .chrono-settings-button {
      position: absolute; left: 4px; top: 4px; z-index: 6; width: 26px; height: 26px;
      display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); border-radius: 5px;
      padding: 0; background: rgba(20,20,20,.82); color: #fff; font: 16px/1 Arial,sans-serif; cursor: pointer;
    }
    #chrono .chrono-settings-button:hover { background: rgba(45,45,45,.96); }

    #chrono .chrono-bg-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: center / 100% 100% no-repeat;
      contain: paint;
      transform: translateZ(0);
    }

    #chrono .chrono-time {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      white-space: nowrap;
      transform-origin: right center;
      transform: scale(var(--chrono-fit-scale, 1));
      font-family: var(--chrono-font-family, ${DEFAULT_FONT});
      line-height: 1;
    }

    #chrono .chrono-main,
    #chrono .chrono-fraction {
      font-family: inherit !important;
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0;
      background-image: linear-gradient(to bottom, var(--chrono-top), var(--chrono-bottom));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent !important;
      -webkit-text-fill-color: transparent;
    }

    #chrono .chrono-main { font-size: 56px !important; }
    #chrono .chrono-fraction { font-size: 31px !important; margin-left: 1px; opacity: .96; }

    #chronoSettingsPopup {
      position: fixed;
      z-index: 2147483646;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 342px;
      max-width: calc(100vw - 28px);
      max-height: 82vh;
      overflow-y: auto;
      box-sizing: border-box;
      padding: 16px 18px;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      background: #151515;
      color: #eee;
      font-family: Arial, sans-serif;
      box-shadow: 0 16px 48px rgba(0,0,0,.6);
    }

    #chronoSettingsPopup h3 {
      margin: 0 0 14px;
      font-size: 16px;
      line-height: 1.25;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #chronoSettingsPopup .settings-close {
      appearance: none;
      border: 0;
      background: transparent;
      color: #aaa;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
    }

    #chronoSettingsPopup .setting-item { margin-bottom: 14px; }
    #chronoSettingsPopup label {
      display: block;
      margin-bottom: 6px;
      color: #bfbfbf;
      font-size: 12px;
    }

    #chronoSettingsPopup input[type="number"],
    #chronoSettingsPopup input[type="color"] {
      width: 100%;
      box-sizing: border-box;
    }

    #chronoSettingsPopup input[type="number"] {
      height: 34px;
      padding: 5px 9px;
      border: 1px solid #363636;
      border-radius: 4px;
      background: #202020;
      color: #fff;
      font-size: 13px;
      outline: none;
    }

    #chronoSettingsPopup input[type="number"]:focus { border-color: #555; }

    #chronoSettingsPopup input[type="color"] {
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
    }

    #chronoSettingsPopup .number-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    #chronoSettingsPopup .upload-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    #chronoSettingsPopup button.action-btn,
    #chronoSettingsPopup button.key-btn {
      appearance: none;
      border: 1px solid #393939;
      border-radius: 4px;
      padding: 7px 10px;
      background: #242424;
      color: #eee;
      font-size: 12px;
      cursor: pointer;
    }

    #chronoSettingsPopup button.key-btn { min-width: 92px; }
    #chronoSettingsPopup button.key-btn.waiting { border-color: #2196f3; color: #7dc6ff; }

    #chronoSettingsPopup .file-name {
      min-width: 0;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #9d9d9d;
      font-size: 11px;
    }

    #chronoSettingsPopup .preview {
      width: 34px;
      height: 24px;
      border: 1px solid #343434;
      background: #000 center/cover no-repeat;
      flex: 0 0 auto;
    }

    #chronoSettingsPopup .section-title {
      margin: 17px 0 9px;
      padding-top: 11px;
      border-top: 1px solid #2a2a2a;
      color: #ddd;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
  `;
  /* cronoRandom.css visual replacement */
  style.textContent += `\n@font-face {
    font-family: Questrial;
    src: url("../fonts/questrial-latin-400-normal.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap
}

#chrono {
    position: fixed;
    transform-origin: top left;
    transform: scale(var(--ls-scale,1));
    z-index: 2147483646;
    background: 0 0;
    border-radius: 0;
    border: none;
    width: 252px;
    height: 50px;
    padding: 0 7px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none
}

#chrono.ls-dragging {
    cursor: grabbing;
    opacity: .92
}

#chrono.ls-hidden {
    display: none!important
}

#chrono .chrono-bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    background: #000
}

#chrono .chrono-time {
    font-family: "Century Gothic",Calibri,"Segoe UI",Arial,sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 43.75px;
    line-height: 1;
    letter-spacing: 0;
    color: #fff;
    white-space: nowrap;
    position: relative;
    z-index: 1;
    font-variant-numeric: tabular-nums;
    filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, .5)) drop-shadow(2px 2px 0 rgba(0, 0, 0, .5))
}

#chrono .chrono-fraction {
    font-size: 30.625px
}

#chrono.ls-no-shadow .chrono-time {
    filter: none
}

#chrono .chrono-resize-handle {
    position: absolute;
    z-index: 5;
    touch-action: none
}

.chrono-resize-handle-n {
    top: -3px;
    left: 6px;
    right: 6px;
    height: 6px;
    cursor: ns-resize
}

.chrono-resize-handle-s {
    bottom: -3px;
    left: 6px;
    right: 6px;
    height: 6px;
    cursor: ns-resize
}

.chrono-resize-handle-e {
    right: -3px;
    top: 6px;
    bottom: 6px;
    width: 6px;
    cursor: ew-resize
}

.chrono-resize-handle-w {
    left: -3px;
    top: 6px;
    bottom: 6px;
    width: 6px;
    cursor: ew-resize
}

.chrono-resize-handle-ne {
    top: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    cursor: nesw-resize
}

.chrono-resize-handle-nw {
    top: -3px;
    left: -3px;
    width: 12px;
    height: 12px;
    cursor: nwse-resize
}

.chrono-resize-handle-se {
    bottom: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    cursor: nwse-resize
}

.chrono-resize-handle-sw {
    bottom: -3px;
    left: -3px;
    width: 12px;
    height: 12px;
    cursor: nesw-resize
}
\n`;
  style.textContent += `
    #chrono .chrono-main { background-image:linear-gradient(to bottom,var(--chrono-top),var(--chrono-bottom)) !important; color:transparent !important; -webkit-text-fill-color:transparent !important; }
    #chrono .chrono-fraction { background-image:none !important; color:var(--chrono-zero-color) !important; -webkit-text-fill-color:var(--chrono-zero-color) !important; }
    #chrono .chrono-time { filter:drop-shadow(1px 1px 0 var(--chrono-shadow-color)) drop-shadow(2px 2px 0 var(--chrono-shadow-color)) !important; }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */
  document.body.insertAdjacentHTML('beforeend', `
    <div id="chrono" aria-label="LiveSplit style timer">
      <button id="chronoSettingsBtn" class="chrono-settings-button" type="button" aria-label="Configurações" title="Configurações">⚙</button>
      <div class="chrono-bg-layer" id="chronoBgLayer" aria-hidden="true"></div>
      <div class="chrono-time" id="chronoTime">
        <span id="chronoMain" class="chrono-main">0</span><span id="chronoFraction" class="chrono-fraction">.00</span>
      </div>
    </div>

    <div id="chronoSettingsPopup" style="display:none;">
      <h3>Configurações do cronômetro <button class="settings-close" id="chronoCloseBtn" type="button" aria-label="Fechar">&times;</button></h3>

      <div class="setting-item">
        <label>Cor de fundo</label>
        <input type="color" id="chronoBg" value="${DEFAULTS.bgColor}">
      </div>

      <div class="setting-item">
        <label>Cor do cronômetro em execução</label>
        <input type="color" id="chronoFg" value="${DEFAULTS.runningColor}">
      </div>
      <div class="setting-item"><label>Cor do texto pausado</label><input type="color" id="chronoPausedColor" value="${DEFAULTS.pausedColor}"></div>
      <div class="setting-item"><label>Cor do texto parado</label><input type="color" id="chronoStoppedColor" value="${DEFAULTS.stoppedColor}"></div>
      <div class="setting-item"><label>Cor da sombra</label><input type="color" id="chronoShadowColor" value="${DEFAULTS.shadowColor}"></div>

      <div class="setting-item">
        <label>Imagem de fundo</label>
        <div class="upload-row">
          <input type="file" id="chronoBgImage" accept="image/png,image/jpeg,image/webp" hidden>
          <button class="action-btn" id="chronoBgImageBtn" type="button">Escolher imagem</button>
          <div id="chronoBgPreview" class="preview" aria-hidden="true"></div>
          <button class="action-btn" id="chronoBgReset" type="button">Remover</button>
        </div>
      </div>

      <div class="setting-item">
        <label>Fonte do cronômetro</label>
        <div class="upload-row">
          <input type="file" id="chronoFont" accept=".ttf,.otf,.woff,.woff2" hidden>
          <button class="action-btn" id="chronoFontBtn" type="button">Escolher fonte</button>
          <span id="chronoFontName" class="file-name">Padrão LiveSplit</span>
          <button class="action-btn" id="chronoFontReset" type="button">Padrão</button>
        </div>
      </div>

      <div class="setting-item"><label>Formato do tempo</label><select id="chronoTimeFormat"><option value="auto">Automático</option><option value="hour">1 hora (00:00:00)</option></select></div>
      <div class="section-title">Atalhos</div>
      <div class="setting-item">
        <label>Iniciar run</label>
        <button id="chronoStartKeyBtn" class="key-btn" type="button">Nenhuma</button>
      </div>
      <div class="setting-item">
        <label>Pausar / continuar</label>
        <button id="chronoPauseKeyBtn" class="key-btn" type="button">Nenhuma</button>
      </div>
      <div class="setting-item">
        <label>Reiniciar</label>
        <button id="chronoResetKeyBtn" class="key-btn" type="button">Nenhuma</button>
      </div>
    </div>
  `);

  /* ---------- references ---------- */
  const chronoEl = document.getElementById('chrono');
  const chronoTimeEl = document.getElementById('chronoTime');
  const chronoBgLayer = document.getElementById('chronoBgLayer');
  const mainEl = document.getElementById('chronoMain');
  const fractionEl = document.getElementById('chronoFraction');
  const popup = document.getElementById('chronoSettingsPopup');
  const closeBtn = document.getElementById('chronoCloseBtn');
  const bgInput = document.getElementById('chronoBg');
  const fgInput = document.getElementById('chronoFg');
  const pausedColorInput = document.getElementById('chronoPausedColor');
  const stoppedColorInput = document.getElementById('chronoStoppedColor');
  const shadowColorInput = document.getElementById('chronoShadowColor');
  const timeFormatInput = document.getElementById('chronoTimeFormat');
  const bgImageInput = document.getElementById('chronoBgImage');
  const bgImageBtn = document.getElementById('chronoBgImageBtn');
  const bgImageReset = document.getElementById('chronoBgReset');
  const bgPreview = document.getElementById('chronoBgPreview');
  const fontInput = document.getElementById('chronoFont');
  const fontBtn = document.getElementById('chronoFontBtn');
  const fontReset = document.getElementById('chronoFontReset');
  const fontName = document.getElementById('chronoFontName');
  const keyButtons = {
    start: document.getElementById('chronoStartKeyBtn'),
    pause: document.getElementById('chronoPauseKeyBtn'),
    reset: document.getElementById('chronoResetKeyBtn')
  };

  /* ---------- settings ---------- */
  function clamp(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function safeHex(value, fallback) {
    const s = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(s) ? s : fallback;
  }

  function safeImageData(value) {
    const s = String(value || '').trim();
    return /^data:image\//i.test(s) ? s : '';
  }

  const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const FONT_EXTENSIONS = /\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/i;
  const FONT_TYPES = new Set(['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/font-woff', 'application/x-font-ttf', 'application/x-font-opentype', 'application/octet-stream']);

  function optimizeBackgroundFile(file, done) {
    if (!file || !IMAGE_TYPES.has(String(file.type || '').toLowerCase())) return;
    const reader = new FileReader();
    reader.onerror = () => {};
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxW = 512;
        const maxH = 128;
        const scale = Math.min(1, maxW / image.naturalWidth, maxH / image.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL('image/webp', 0.78));
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  function optimizeStoredBackground() {
    if (!settings.backgroundImage || settings.backgroundImage.length < 450000) return;
    const image = new Image();
    image.onload = () => {
      const maxW = 512, maxH = 128;
      const scale = Math.min(1, maxW / image.naturalWidth, maxH / image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      settings.backgroundImage = canvas.toDataURL('image/webp', 0.78);
      applyVisualSettings();
      saveSettings();
    };
    image.src = settings.backgroundImage;
  }

  function safeFontData(value) {
    const s = String(value || '').trim();
    return /^data:(font\/|application\/((x-)?font-|octet-stream))/i.test(s) ? s : '';
  }

  function normalizeHotkey(value) {
    if (!value || typeof value !== 'object' || !value.code) return null;
    return {
      code: String(value.code),
      key: String(value.key || ''),
      label: String(value.label || keyLabel(value.code))
    };
  }

  function keyLabel(code) {
    const labels = {
      Space: 'Espaço',
      Enter: 'Enter',
      Escape: 'Esc',
      Tab: 'Tab',
      Backspace: 'Backspace',
      Delete: 'Delete',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→'
    };
    if (labels[code]) return labels[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return `Num ${code.slice(6)}`;
    return code || 'Nenhuma';
  }

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
      return {
        left: Number.isFinite(Number(raw.left)) ? Number(raw.left) : DEFAULTS.left,
        top: Number.isFinite(Number(raw.top)) ? Number(raw.top) : DEFAULTS.top,
        width: DEFAULTS.width,
        height: DEFAULTS.height,
        bgColor: safeHex(raw.bgColor, DEFAULTS.bgColor),
        runningColor: safeHex(raw.runningColor, DEFAULTS.runningColor),
        backgroundImage: safeImageData(raw.backgroundImage),
        customFontData: safeFontData(raw.customFontData),
        customFontName: String(raw.customFontName || '').slice(0, 100),
        startKey: normalizeHotkey(raw.startKey),
        pauseKey: normalizeHotkey(raw.pauseKey),
        resetKey: normalizeHotkey(raw.resetKey)
      };
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  let settings = loadSettings();

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {
      try {
        const copy = { ...settings };
        delete copy.customFontData;
        delete copy.backgroundImage;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
      } catch (_) {}
    }
  }

  /* ---------- timer state ---------- */
  let autoModeEnabled = true;
  let timerState = 'stopped'; // stopped | running | paused
  let startedAt = 0;
  let elapsedMs = 0;
  let rafId = 0;
  let lastRenderedMain = null;
  let lastRenderedFraction = null;
  let lastGradientSignature = '';
  let pausedReason = '';
  let chronoPendingMenuPauseTimer = null;
  let pendingRevive = false;
  let deathPausedAt = 0;
  let reviveConfirmationAt = 0;
  let reviveAudioArmedUntil = 0;
  let reviveLobbyGuardUntil = 0;
  let lastAutoStartAt = -Infinity;
  let lastCoinPauseAt = -Infinity;
  let suppressAutoStartUntil = 0;
  let lastGameplayStartSignalAt = -Infinity;
  let lastScoreValue = null;
  let lastScoreIncreaseAt = 0;
  let scoreSeen = false;
  let scoreWatchId = 0;
  const SCORE_IDLE_PAUSE_MS = 450;
  const GAMEPLAY_START_DUPLICATE_MS = 120;
  const REVIVE_AUDIO_WINDOW_MS = 2600;

  function currentElapsed() {
    return timerState === 'running'
      ? elapsedMs + (performance.now() - startedAt)
      : elapsedMs;
  }

  function stopTick() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function tick() {
    rafId = 0;
    if (timerState !== 'running') return;
    render();
    rafId = requestAnimationFrame(tick);
  }

  function startTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function chronoLog(...args) {
    if (window.CHRONO_DEBUG) console.log('[chrono]', ...args);
  }

  function startNewRun(source = 'manual') {
    chronoLog('startNewRun()', 'source=', source, 'previousState=', timerState, pausedReason);
    stopTick();
    elapsedMs = 0;
    startedAt = performance.now();
    timerState = 'running';
    pausedReason = '';
    pendingRevive = false;
    deathPausedAt = 0;
    reviveConfirmationAt = 0;
    reviveAudioArmedUntil = 0;
    lastAutoStartAt = performance.now();
    suppressAutoStartUntil = performance.now() + 800;
    resetScoreWatch();
    render();
    startTick();
    if (source === 'manual') saveSettings();
  }

  function pauseTimer(reason = 'manual') {
    if (timerState !== 'running') { chronoLog('pauseTimer() ignored - not running. reason=', reason, 'state=', timerState); return false; }
    elapsedMs += performance.now() - startedAt;
    timerState = 'paused';
    pausedReason = reason;
    chronoLog('pauseTimer() OK', 'reason=', reason, 'elapsedMs=', Math.round(elapsedMs));
    stopTick();
    if (reason === 'death') {
      // The game must later confirm the actual revive with reborn:runResumed.
      pendingRevive = false;
      reviveConfirmationAt = 0;
      deathPausedAt = performance.now();
    }
    render();
    return true;
  }

  function resumeTimer(reason = 'manual') {
    if (timerState !== 'paused') { chronoLog('resumeTimer() ignored - not paused. reason=', reason, 'state=', timerState); return false; }
    chronoLog('resumeTimer() OK', 'reason=', reason, 'wasPausedReason=', pausedReason, 'elapsedMs=', Math.round(elapsedMs));
    // elapsedMs already contains the exact time at death/pause. Only reset the
    // reference clock; never reset elapsedMs when the player revives.
    startedAt = performance.now();
    timerState = 'running';
    pausedReason = '';
    pendingRevive = false;
    deathPausedAt = 0;
    reviveConfirmationAt = performance.now();
    if (scoreSeen) lastScoreIncreaseAt = performance.now();
    // The game can emit gameplayStart/startAudio immediately after the revive
    // key. Keep that follow-up event from being interpreted as a new run.
    suppressAutoStartUntil = performance.now() + 1500;
    render();
    startTick();
    if (reason === 'manual') saveSettings();
    return true;
  }

  function togglePause() {
    if (timerState === 'running') pauseTimer('manual');
    else if (timerState === 'paused') resumeTimer('manual');
    else startNewRun('manual');
  }

  function resetTimer() {
    stopTick();
    timerState = 'stopped';
    startedAt = 0;
    elapsedMs = 0;
    pausedReason = '';
    pendingRevive = false;
    deathPausedAt = 0;
    reviveConfirmationAt = 0;
    reviveAudioArmedUntil = 0;
    suppressAutoStartUntil = performance.now() + 500;
    resetScoreWatch();
    render();
  }

  /* ---------- colors / rendering ---------- */
  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return { r: 41, g: 204, b: 84 };
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
  }

  function shade(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const target = amount >= 0 ? 255 : 0;
    const p = Math.abs(amount);
    return rgbToHex(r + (target - r) * p, g + (target - g) * p, b + (target - b) * p);
  }

  function currentBaseColor() {
    if (timerState === 'paused' && pausedReason === 'death') return settings.endedColor || '#ff5a5f';
    if (timerState === 'paused' && pausedReason === 'manual') return settings.pausedColor || PAUSED_COLOR;
    if (timerState === 'paused') return settings.stoppedColor || STOPPED_COLOR;
    if (timerState === 'stopped') return settings.stoppedColor || STOPPED_COLOR;
    return settings.runningColor;
  }

  function applyGradientColor() {
    const base = currentBaseColor();
    const shadow = settings.shadowColor || SHADOW_COLOR;
    const signature = base + '|' + shadow;
    if (signature === lastGradientSignature) return;
    lastGradientSignature = signature;
    chronoEl.style.setProperty('--chrono-text-color', base);
    chronoEl.style.setProperty('--chrono-zero-color', base);
    chronoEl.style.setProperty('--chrono-shadow-color', shadow);
    chronoEl.style.setProperty('--chrono-top', shade(base, 0.32));
    chronoEl.style.setProperty('--chrono-bottom', shade(base, -0.22));
  }

  function formatTime(ms) {
    const totalCenti = Math.floor(Math.max(0, ms) / 10);
    const centi = totalCenti % 100;
    const totalSeconds = Math.floor(totalCenti / 100);
    const secs = totalSeconds % 60;
    const mins = Math.floor(totalSeconds / 60) % 60;
    const hrs = Math.floor(totalSeconds / 3600);

    let main;
    if (settings.timeFormat === 'hour') main = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    else if (hrs > 0) main = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    else if (mins > 0) main = `${mins}:${String(secs).padStart(2, '0')}`;
    else main = `${secs}`;

    return { main, fraction: `.${String(centi).padStart(2, '0')}` };
  }

  function render(forceFit = false) {
    const { main, fraction } = formatTime(currentElapsed());
    let needsFit = Boolean(forceFit);

    // Avoid DOM writes on every tick when the displayed value has not changed.
    if (main !== lastRenderedMain) {
      mainEl.textContent = main;
      lastRenderedMain = main;
      needsFit = true;
    }
    if (fraction !== lastRenderedFraction) {
      fractionEl.textContent = fraction;
      lastRenderedFraction = fraction;
    }

    // Colors change only when the timer state/visual settings change.
    applyGradientColor();

    // Reading scrollWidth/scrollHeight forces layout; do it only when the main
    // digits change or the user changes the timer's visual size/settings.
    if (needsFit) fitTimerText();
  }

  function fitTimerText() {
    chronoEl.style.setProperty('--chrono-fit-scale', '1');
    const padX = 18;
    const padY = 4;
    const width = Math.max(1, settings.width - padX * 2);
    const height = Math.max(1, settings.height - padY);
    const measuredWidth = Math.max(1, chronoTimeEl.scrollWidth);
    const measuredHeight = Math.max(1, chronoTimeEl.scrollHeight);
    const widthScale = width / measuredWidth;
    const heightScale = height / measuredHeight;
    const scale = Math.max(0.34, Math.min(1, widthScale, heightScale));
    chronoEl.style.setProperty('--chrono-fit-scale', scale.toFixed(4));
  }

  /* ---------- custom font / background ---------- */
  function applyCustomFont() {
    const id = 'chronoCustomFontStyle';
    let node = document.getElementById(id);

    if (!settings.customFontData) {
      if (node) node.remove();
      chronoEl.style.setProperty('--chrono-font-family', DEFAULT_FONT);
      fontName.textContent = 'Padrão LiveSplit';
      return;
    }

    if (!node) {
      node = document.createElement('style');
      node.id = id;
      document.head.appendChild(node);
    }

    node.textContent = `
      @font-face {
        font-family: "ChronoCustom";
        src: url("${settings.customFontData}");
        font-style: normal;
        font-weight: 700;
        font-display: swap;
      }
    `;
    chronoEl.style.setProperty('--chrono-font-family', '"ChronoCustom", ' + DEFAULT_FONT);
    fontName.textContent = settings.customFontName || 'Fonte personalizada';
  }

  function updateBackgroundPreview() {
    bgPreview.style.backgroundImage = settings.backgroundImage ? `url("${settings.backgroundImage}")` : 'none';
  }

  function applyVisualSettings() {
    chronoEl.style.setProperty('--chrono-width', `${settings.width}px`);
    chronoEl.style.setProperty('--chrono-height', `${settings.height}px`);
    chronoEl.style.setProperty('--chrono-bg', settings.bgColor);
    chronoEl.style.backgroundColor = settings.bgColor;
    chronoEl.style.backgroundImage = 'none';
    chronoBgLayer.style.backgroundColor = 'transparent';
    chronoBgLayer.style.backgroundImage = settings.backgroundImage ? `url("${settings.backgroundImage}")` : 'none';
    chronoEl.style.backgroundSize = '100% 100%';
    chronoEl.style.backgroundPosition = 'center';
    chronoEl.style.backgroundRepeat = 'no-repeat';
    bgInput.value = settings.bgColor;
    fgInput.value = settings.runningColor;
    pausedColorInput.value = settings.pausedColor || PAUSED_COLOR;
    stoppedColorInput.value = settings.stoppedColor || STOPPED_COLOR;
    shadowColorInput.value = settings.shadowColor || SHADOW_COLOR;
    timeFormatInput.value = settings.timeFormat || 'auto';
    applyCustomFont();
    updateBackgroundPreview();
    render(true);
  }

  /* ---------- hotkey mapping ---------- */
  let pendingHotkey = null;

  function hotkeyLabel(hotkey) {
    return hotkey && hotkey.code ? hotkey.label || keyLabel(hotkey.code) : 'Nenhuma';
  }

  function updateHotkeyButtons() {
    keyButtons.start.textContent = hotkeyLabel(settings.startKey);
    keyButtons.pause.textContent = hotkeyLabel(settings.pauseKey);
    keyButtons.reset.textContent = hotkeyLabel(settings.resetKey);
    Object.values(keyButtons).forEach((btn) => btn.classList.remove('waiting'));
  }

  function beginHotkeyCapture(action) {
    pendingHotkey = action;
    Object.values(keyButtons).forEach((btn) => btn.classList.remove('waiting'));
    keyButtons[action].classList.add('waiting');
    keyButtons[action].textContent = 'Pressione a tecla';
  }

  function assignHotkey(event) {
    if (!pendingHotkey) return;
    if (event.key === 'Escape') {
      settings[pendingHotkey + 'Key'] = null;
    } else {
      settings[pendingHotkey + 'Key'] = {
        code: String(event.code || ''),
        key: String(event.key || ''),
        label: keyLabel(String(event.code || event.key || ''))
      };
    }
    pendingHotkey = null;
    updateHotkeyButtons();
    saveSettings();
  }

  keyButtons.start.addEventListener('click', () => beginHotkeyCapture('start'));
  keyButtons.pause.addEventListener('click', () => beginHotkeyCapture('pause'));
  keyButtons.reset.addEventListener('click', () => beginHotkeyCapture('reset'));

  document.addEventListener('keydown', (event) => {
    if (pendingHotkey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      assignHotkey(event);
      return;
    }

    if (popup.style.display === 'block') {
      if (event.key === 'Escape') closePopup();
      return;
    }

    // Let Escape reach the Unity canvas/game. The second keyboard listener
    // pauses the overlay without preventDefault, so the game's menu opens on
    // this same key press.
    if (event.code === 'Escape') return;

    if (hotkeyMatches(event, settings.startKey)) {
      event.preventDefault();
      if (timerState === 'running') pauseTimer('manual');
      else if (timerState === 'paused') resumeTimer('manual');
      else startNewRun('manual');
      return;
    }
    if (hotkeyMatches(event, settings.pauseKey)) {
      event.preventDefault();
      togglePause();
      return;
    }
    if (hotkeyMatches(event, settings.resetKey)) {
      event.preventDefault();
      resetTimer();
    }
  }, true);

  function hotkeyMatches(event, hotkey) {
    return !!hotkey && hotkey.code === event.code && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
  }

  /* ---------- dragging only (no mouse resize) ---------- */
  function clampPosition() {
    const rect = chronoEl.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    settings.left = Math.min(Math.max(Number(settings.left) || 0, 0), maxLeft);
    settings.top = Math.min(Math.max(Number(settings.top) || 0, 0), maxTop);
    chronoEl.style.left = `${Math.round(settings.left)}px`;
    chronoEl.style.top = `${Math.round(settings.top)}px`;
  }

  let timerTapTimeout = 0;
  function handleTimerTap() {
    if (timerTapTimeout) {
      window.clearTimeout(timerTapTimeout);
      timerTapTimeout = 0;
      resetTimer();
      return;
    }
    timerTapTimeout = window.setTimeout(() => {
      timerTapTimeout = 0;
      togglePause();
    }, 300);
  }

  (function enableDrag() {
    let dragging = false;
    let moved = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    chronoEl.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("#chronoSettingsBtn")) return;
      pointerId = event.pointerId;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      const rect = chronoEl.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      chronoEl.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    chronoEl.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 5) {
        moved = true;
        chronoEl.classList.add('dragging');
      }
      if (!moved) return;
      settings.left = event.clientX - offsetX;
      settings.top = event.clientY - offsetY;
      clampPosition();
    });

    const finish = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      chronoEl.classList.remove('dragging');
      if (moved) saveSettings();
      else if (event.type !== 'pointercancel' && popup.style.display !== 'block') handleTimerTap();
      moved = false;
    };

    chronoEl.addEventListener('pointerup', finish);
    chronoEl.addEventListener('pointercancel', finish);
  })();

  /* ---------- settings UI ---------- */
  function openPopup() { popup.style.display = 'block'; updateHotkeyButtons(); }
  function closePopup() { popup.style.display = 'none'; pendingHotkey = null; updateHotkeyButtons(); }

  const settingsBtn = document.getElementById('chronoSettingsBtn');
  settingsBtn.addEventListener('pointerdown', (event) => event.stopPropagation());
  settingsBtn.addEventListener('click', (event) => { event.stopPropagation(); openPopup(); });
  closeBtn.addEventListener('click', closePopup);
  popup.addEventListener('click', (event) => { if (event.target === popup) closePopup(); });

  bgInput.addEventListener('input', () => { settings.bgColor = safeHex(bgInput.value, DEFAULTS.bgColor); applyVisualSettings(); saveSettings(); });
  fgInput.addEventListener('input', () => { settings.runningColor = safeHex(fgInput.value, DEFAULTS.runningColor); applyVisualSettings(); saveSettings(); });
  pausedColorInput.addEventListener('input', () => { settings.pausedColor = safeHex(pausedColorInput.value, PAUSED_COLOR); applyVisualSettings(); saveSettings(); });
  stoppedColorInput.addEventListener('input', () => { settings.stoppedColor = safeHex(stoppedColorInput.value, STOPPED_COLOR); applyVisualSettings(); saveSettings(); });
  shadowColorInput.addEventListener('input', () => { settings.shadowColor = safeHex(shadowColorInput.value, SHADOW_COLOR); applyVisualSettings(); saveSettings(); });
  timeFormatInput.addEventListener('change', () => { settings.timeFormat = timeFormatInput.value === 'hour' ? 'hour' : 'auto'; applyVisualSettings(); saveSettings(); });

  bgImageBtn.addEventListener('click', () => bgImageInput.click());
  bgImageReset.addEventListener('click', () => { settings.backgroundImage = ''; bgImageInput.value = ''; applyVisualSettings(); saveSettings(); });
  bgImageInput.addEventListener('change', () => {
    const file = bgImageInput.files && bgImageInput.files[0];
    if (!file) return;
    if (!IMAGE_TYPES.has(String(file.type || '').toLowerCase())) {
      bgImageInput.value = '';
      return;
    }
    optimizeBackgroundFile(file, (data) => {
      settings.backgroundImage = safeImageData(data);
      applyVisualSettings();
      saveSettings();
    });
  });

  fontBtn.addEventListener('click', () => fontInput.click());
  fontReset.addEventListener('click', () => { settings.customFontData = ''; settings.customFontName = ''; fontInput.value = ''; applyVisualSettings(); saveSettings(); });
  fontInput.addEventListener('change', () => {
    const file = fontInput.files && fontInput.files[0];
    if (!file || !FONT_EXTENSIONS.test(file.name || '') || (file.type && !FONT_TYPES.has(String(file.type).toLowerCase()))) {
      fontInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = safeFontData(reader.result);
      if (!data) return;
      settings.customFontData = data;
      settings.customFontName = file.name;
      applyVisualSettings();
      saveSettings();
    };
    reader.readAsDataURL(file);
  });

  window.addEventListener('resize', () => { clampPosition(); fitTimerText(); }, { passive: true });

  /* ---------- reference runtime event bridge ---------- */
  const runtimeBridgeState = {
    gameplayActive: false,
    gameplayStartedAt: 0,
    wrappedPoki: false,
    lastEventSignature: '',
    lastEventAt: -Infinity,
    monitorStarted: false
  };

  function dispatchRuntimeEvent(type, detail = {}) {
    const eventNow = performance.now();
    const signature = `${type}:${JSON.stringify(detail && { value: detail.value, counterDelta: detail.counterDelta, args: detail.args })}`;
    if (signature === runtimeBridgeState.lastEventSignature && eventNow - runtimeBridgeState.lastEventAt < DUPLICATE_EVENT_MS) return;
    runtimeBridgeState.lastEventSignature = signature;
    runtimeBridgeState.lastEventAt = eventNow;

    if (type === 'poki:gameplayStart' || type === 'poki:roundStart' || type === 'unity:startAudio') {
      runtimeBridgeState.gameplayActive = true;
      runtimeBridgeState.gameplayStartedAt = eventNow;
    } else if (type === 'poki:roundEnd' || type === 'poki:gameplayStop') {
      runtimeBridgeState.gameplayActive = false;
    }

    const payload = { ...detail, type, time: eventNow };
    window.__troUnityRuntimeEvents = [...(window.__troUnityRuntimeEvents || []), payload].slice(-120);
    try { document.documentElement.dataset.troUnityRuntimeEvent = type; } catch (_) {}
    window.dispatchEvent(new CustomEvent('tro:unity-runtime-event', { detail: payload }));
  }

  function wrapPokiSdk() {
    if (runtimeBridgeState.wrappedPoki || !window.PokiSDK || typeof window.PokiSDK !== 'object') return;
    const sdk = window.PokiSDK;
    const methods = ['init', 'commercialBreak', 'rewardedBreak', 'gameplayStart', 'gameplayStop', 'roundEnd', 'roundStart'];
    for (const name of methods) {
      try {
        const original = typeof sdk[name] === 'function' ? sdk[name] : function () { return Promise.resolve(true); };
        if (original.__chronoWrapped) continue;
        const wrapped = function (...args) {
          dispatchRuntimeEvent(`poki:${name}`, { args });
          let result;
          try { result = original.apply(this, args); } catch (error) { throw error; }
          return result;
        };
        wrapped.__chronoWrapped = true;
        sdk[name] = wrapped;
      } catch (_) {}
    }
    runtimeBridgeState.wrappedPoki = true;
  }

  function ensurePokiBridge() {
    wrapPokiSdk();
    if (!runtimeBridgeState.wrappedPoki) window.setTimeout(ensurePokiBridge, 100);
  }

  /* ---------- reference audio automation: start sound and coin sound ---------- */
  const CHRONO_AUDIO_PROFILES = {
    // ignoredLengths keeps the revive jingle (~182786) from ever being
    // mistaken for a fresh-run start - confirmed from a real capture.
    start: { lengths: [167183, 166069], tolerance: 700, expectedDuration: 3.464580535888672, durationTolerance: 0.09, ignoredLengths: [182786, 182787, 182788, 168000] },
    coin: { lengths: [27863], tolerance: 900, durationMin: 0.52, durationMax: 0.589 },
    jump: { lengths: [27863, 28675], tolerance: 900, durationMin: 0.59, durationMax: 0.625 },
    // Confirmed with a real capture: length=182786 duration=3.808 plays right
    // after clicking "usar a chave" and before gameplay resumes.
    revive: { lengths: [182786, 182787, 182788], tolerance: 40, durationMin: 3.7, durationMax: 3.9 }
  };
  const CHRONO_AUDIO_DUPLICATE_MS = 80;
  const CHRONO_AUDIO_START_GUARD_MS = 800;
  const CHRONO_AUDIO_COIN_DUPLICATE_MS = 220;
  let chronoAudioOriginalStart = null;
  let chronoAudioPatchedStart = null;
  let chronoAudioHookInstalled = false;
  let chronoAudioLastSignature = '';
  let chronoAudioLastAt = -Infinity;
  let chronoAudioLastCoinAt = -Infinity;
  let chronoAudioLastJumpAt = -Infinity;

  function chronoAudioMatches(data, profile) {
    const length = Number(data && data.length) || 0;
    const duration = Number(data && data.duration) || 0;
    if (!length || !duration || !profile) return false;
    if (Array.isArray(profile.ignoredLengths) && profile.ignoredLengths.some((value) => Math.abs(length - value) <= 2)) return false;
    const lengthMatch = profile.lengths.some((value) => Math.abs(length - value) <= profile.tolerance);
    if (!lengthMatch) return false;
    if (profile.durationMin != null && (duration < profile.durationMin || duration > profile.durationMax)) return false;
    if (profile.expectedDuration != null && Math.abs(duration - profile.expectedDuration) > profile.durationTolerance) return false;
    return true;
  }

  function chronoAudioKind(data) {
    if (chronoAudioMatches(data, CHRONO_AUDIO_PROFILES.revive)) return 'revive';
    if (chronoAudioMatches(data, CHRONO_AUDIO_PROFILES.start)) return 'start';
    if (chronoAudioMatches(data, CHRONO_AUDIO_PROFILES.coin)) return 'coin';
    if (chronoAudioMatches(data, CHRONO_AUDIO_PROFILES.jump)) return 'jump';
    return '';
  }

  function armReviveAudio(reason = 'input') {
    if (timerState === 'paused' && pausedReason === 'death') {
      reviveAudioArmedUntil = performance.now() + REVIVE_AUDIO_WINDOW_MS;
      pendingRevive = true;
      deathPausedAt = deathPausedAt || performance.now();
    }
  }

  function chronoHandleAudio(data) {
    if (!autoModeEnabled) return;
    const kind = chronoAudioKind(data);
    const now = performance.now();

    if (window.CHRONO_DEBUG) {
      console.log(`[chrono-audio] length=${data && data.length} duration=${data && Number(data.duration).toFixed(3)} -> ${kind || 'sem classificação'} | state=${timerState} ${pausedReason || ''}`);
    }

    // Confirmed with a real capture: this exact sound plays right after using
    // the key to revive, so it is a hard confirmation - no arming window or
    // duration guessing needed.
    if (kind === 'revive') {
      if (timerState === 'paused' && pausedReason === 'death') {
        reviveAudioArmedUntil = 0;
        pendingRevive = false;
        resumeTimer('audio-revive');
      }
      return;
    }

    // Fallback: some builds might not always fire the exact revive sound
    // above (e.g. a slightly different length on other city builds), so keep
    // this generic window as a safety net.
    if (timerState === 'paused' && pausedReason === 'death' && now <= reviveAudioArmedUntil) {
      const length = Number(data && data.length) || 0;
      const duration = Number(data && data.duration) || 0;
      const isKnownMovementSound = kind === 'jump' || kind === 'coin';
      if (!isKnownMovementSound && length > 1000 && duration >= 0.08 && duration <= 2.8) {
        reviveAudioArmedUntil = 0;
        pendingRevive = false;
        resumeTimer('audio-revive');
        return;
      }
    }

    if (!kind) return;
    const signature = `${data.length}:${Math.round(data.duration * 1000)}:${kind}`;
    if (signature === chronoAudioLastSignature && now - chronoAudioLastAt < CHRONO_AUDIO_DUPLICATE_MS) return;
    chronoAudioLastSignature = signature;
    chronoAudioLastAt = now;

    if (kind === 'jump') {
      if (now - chronoAudioLastJumpAt < 320) return;
      return;
    }
    if (kind === 'start') {
      if (timerState === 'stopped' && now - lastAutoStartAt > CHRONO_AUDIO_START_GUARD_MS) startNewRun('auto');
      return;
    }
    if (timerState !== 'running') return;
    if (now - lastAutoStartAt < CHRONO_AUDIO_START_GUARD_MS) return;
    if (now - chronoAudioLastCoinAt < CHRONO_AUDIO_COIN_DUPLICATE_MS) return;
    // Moeda e pulo compartilham o mesmo tamanho de buffer (~27863) e só se
    // diferenciam pela duração. Antes, QUALQUER moeda até 320ms depois de pular
    // era ignorada (e o jogador pula o tempo todo), o que derrubava a pausa em
    // muitas moedas reais. Agora só ignora a faixa ambígua, e só se o pulo foi
    // há menos de 100ms.
    const coinDuration = Number(data && data.duration) || 0;
    const isAmbiguousDuration = coinDuration >= 0.585 && coinDuration <= 0.605;
    if (isAmbiguousDuration && now - chronoAudioLastJumpAt < 100) return;
    chronoAudioLastCoinAt = now;
    pauseTimer('coin');
  }

  function installChronoAudioHook() {
    const proto = window.AudioBufferSourceNode && window.AudioBufferSourceNode.prototype;
    if (!proto || typeof proto.start !== 'function') return false;
    if (chronoAudioHookInstalled && proto.start === chronoAudioPatchedStart) return true;
    if (proto.start.__chronoAudioHook) return true;
    chronoAudioOriginalStart = proto.start;
    chronoAudioPatchedStart = function chronoPatchedAudioStart() {
      const result = chronoAudioOriginalStart.apply(this, arguments);
      if (this.buffer) {
        const buffer = this.buffer;
        queueMicrotask(() => chronoHandleAudio({ length: Number(buffer.length || 0), duration: Number(buffer.duration || 0) }));
      }
      return result;
    };
    chronoAudioPatchedStart.__chronoAudioHook = true;
    proto.start = chronoAudioPatchedStart;
    chronoAudioHookInstalled = true;
    return true;
  }

  function ensureChronoAudioHook() {
    if (installChronoAudioHook()) return;
    window.setTimeout(ensureChronoAudioHook, 100);
  }

  document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') chronoAudioLastJumpAt = performance.now();
  }, true);

  /* ---------- score-driven LiveSplit automation ---------- */
  function scoreValueFrom(detail) {
    const candidates = [detail && detail.score, detail && detail.currentScore, detail && detail.scoreValue, detail && detail.value];
    for (const candidate of candidates) {
      const value = Number(candidate);
      if (Number.isFinite(value) && value >= 0 && value <= 1000000000) return value;
    }
    return null;
  }

  function handleScoreChanged(detail) {
    if (!autoModeEnabled) return;
    const value = scoreValueFrom(detail);
    if (value == null) return;
    const now = performance.now();
    const previous = lastScoreValue;
    lastScoreValue = value;
    scoreSeen = true;

    // A score reset is the reliable boundary between two runs.
    if (previous != null && value < previous && timerState !== 'stopped') {
      lastScoreIncreaseAt = now;
      startNewRun('auto');
      return;
    }

    if (previous == null || value > previous || Number(detail && detail.delta) > 0 || Number(detail && detail.counterDelta) > 0) {
      lastScoreIncreaseAt = now;
      if (timerState === 'paused') resumeTimer('auto');
      else if (timerState === 'stopped' && now >= suppressAutoStartUntil) {
        startNewRun('auto');
        lastScoreValue = value;
        scoreSeen = true;
        lastScoreIncreaseAt = now;
      }
    }
  }

  function handleScoreStopped(detail) {
    if (!autoModeEnabled) return;
    if (timerState !== 'running') return;
    if (detail && detail.reason === 'death') pauseTimer('death');
    else pauseTimer('score');
  }

  function startScoreWatch() {
    if (scoreWatchId) return;
    scoreWatchId = window.setInterval(() => {
      if (timerState !== 'running' || !scoreSeen || !lastScoreIncreaseAt) return;
      // Only use inactivity after a real score signal was observed. This avoids
      // pausing a fresh run before the game exposes its score value.
      if (performance.now() - lastScoreIncreaseAt >= SCORE_IDLE_PAUSE_MS) pauseTimer('score');
    }, 180);
  }

  function resetScoreWatch() {
    lastScoreValue = null;
    lastScoreIncreaseAt = 0;
    scoreSeen = false;
  }

  /* ---------- gameplay/event automation ---------- */
  function onRuntimeEvent(event) {
    if (!autoModeEnabled) return;
    const detail = event && event.detail ? event.detail : {};
    const type = String(detail.type || '');
    const eventNow = performance.now();

    chronoLog('event:', type, '| state=', timerState, pausedReason || '');

    // Horizontal movement is deliberately ignored. It is never a pause/resume trigger.
    if (type === 'input:left' || type === 'input:right' || type === 'input:horizontal') return;

    const reborn = type.startsWith('reborn:');

    if (reborn) {
      if (type === 'reborn:runStarted') {
        startNewRun('auto');
        return;
      }
      if (type === 'reborn:playerDied' || type === 'reborn:saveMeShown') {
        pauseTimer('death');
        return;
      }
      if (type === 'reborn:runEnded' || type === 'reborn:gameEnded') {
        // This is the lobby/exit path, not a successful revive. Cancel any
        // pending first-touch fallback so returning to the lobby never starts
        // the timer again.
            reviveLobbyGuardUntil = eventNow + 3000;
        resetTimer();
        return;
      }
      if ((type === 'reborn:runResumed' || type === 'reborn:resume') && timerState === 'paused' && pausedReason === 'death') {
        // This is the authoritative confirmation emitted by the game after
        // the revive key succeeds. Resume elapsedMs; never startNewRun().
        pendingRevive = false;
        reviveConfirmationAt = eventNow;
        resumeTimer('auto');
        return;
      }
      if (type === 'reborn:pause' && timerState === 'running') {
        pauseTimer('menu');
        return;
      }
      if (type === 'reborn:coinCollected' && timerState === 'running') pauseTimer('coin');
      return;
    }

    if (type === 'poki:roundStart' && timerState === 'paused' && pausedReason === 'coin') {
      // A roundStart is a fresh attempt after leaving the previous run.
      startNewRun('auto');
      return;
    }

    if (type === 'poki:gameplayStart' || type === 'poki:roundStart') {
      // Leaving the game's blue pause/menu resumes the saved run; it is not a new run.
      if (timerState === 'paused' && pausedReason === 'menu') {
        resumeTimer('auto');
        return;
      }
      const isDuplicateStart = eventNow - lastGameplayStartSignalAt < GAMEPLAY_START_DUPLICATE_MS;
      lastGameplayStartSignalAt = eventNow;
      // Coin revives do not necessarily call rewardedBreak. If gameplay resumes
      // shortly after a death, continue the paused run instead of resetting it.
      if (timerState === 'paused' && pausedReason === 'death' && deathPausedAt && eventNow - deathPausedAt <= REVIVE_WINDOW_MS) {
        pendingRevive = false;
        resumeTimer('auto');
        return;
      }
      // A new start signal after the duplicate window is a new run, even if
      // the previous timer was still running.
      if (timerState === 'running' && !isDuplicateStart) {
        startNewRun('auto');
        return;
      }
      // Classic builds confirm a revive with rewardedBreak followed by gameplayStart.
      // Resume the saved elapsed time instead of creating a new run.
      if (pendingRevive && timerState === 'paused' && pausedReason === 'death' && eventNow - deathPausedAt <= REVIVE_WINDOW_MS) {
        resumeTimer('auto');
        pendingRevive = false;
        return;
      }

      // A gameplay start while the timer is already running is a duplicate
      // signal from the game and must never reset the LiveSplit run.
      if (timerState === 'running') return;

      // A start after a completed death/coin pause is a genuinely new run,
      // matching the reference state machine's NotRunning/Ended transition.
      if (timerState === 'paused') {
        // A coin pause is intentionally sticky: opening/closing the Unity menu
        // must not resume or reset the run. Resume only after a real new score.
        if (pausedReason === 'coin') return;
        startNewRun('auto');
        return;
      }

      if (eventNow < suppressAutoStartUntil) return;
      startNewRun('auto');
      return;
    }

    if (type === 'unity:startAudio') {
      // The start sound is only a fallback for a stopped timer. Never let a
      // sound after death/coin pause erase the saved time before revive.
      if (timerState === 'stopped' && eventNow >= suppressAutoStartUntil) startNewRun('auto');
      return;
    }

    if (type === 'reborn:pause') {
      if (timerState === 'running') pauseTimer('menu');
      return;
    }

    if (type === 'poki:gameplayStop') {
      // On death, the game fires gameplayStop A FEW MS BEFORE roundEnd - this
      // was being read as "went back to the menu" and pausing with reason
      // "menu", which blocked the death/revive flow entirely below (revive
      // only resumes when pausedReason === 'death'). Wait briefly; only treat
      // it as a real "menu" pause if no roundEnd confirms a death right after.
      if (timerState === 'running') {
        window.clearTimeout(chronoPendingMenuPauseTimer);
        chronoPendingMenuPauseTimer = window.setTimeout(() => {
          if (timerState === 'running') pauseTimer('menu');
        }, 220);
      }
      return;
    }

    if (type === 'poki:roundEnd' && timerState === 'running') {
      window.clearTimeout(chronoPendingMenuPauseTimer);
      pauseTimer('death');
      return;
    }

    if (type === 'poki:rewardedBreak') {
      if (timerState === 'paused' && pausedReason === 'death') {
        pendingRevive = true;
        deathPausedAt = eventNow;
      }
      return;
    }

    if (type === 'unity:scoreChanged' || type === 'unity:scoreCounterChanged' || type === 'unity:score' || type === 'score:changed' || type === 'reborn:scoreChanged') {
      handleScoreChanged(detail);
      return;
    }

    if (type === 'unity:scoreStopped' || type === 'score:stopped' || type === 'reborn:scoreStopped') {
      handleScoreStopped(detail);
      return;
    }

    if (type === 'unity:coinCollected' && timerState === 'running') {
      if (eventNow - lastCoinPauseAt < COIN_DUPLICATE_MS) return;
      if (eventNow - lastAutoStartAt < STARTUP_COIN_GUARD_MS) return;
      lastCoinPauseAt = eventNow;
      pauseTimer('coin');
      return;
    }

    if (type === 'unity:coinCounterChanged' && timerState === 'running') {
      const delta = Number(detail.counterDelta) || 0;
      if (delta <= 0 || delta > COIN_COUNTER_MAX_DELTA) return;
      if (eventNow - lastCoinPauseAt < COIN_DUPLICATE_MS) return;
      if (eventNow - lastAutoStartAt < STARTUP_COIN_GUARD_MS) return;
      lastCoinPauseAt = eventNow;
      pauseTimer('coin');
    }
  }

  window.addEventListener('tro:unity-runtime-event', onRuntimeEvent);

  // Some builds do not forward the menu button to Poki. Use page visibility as
  // a fallback, but only pause on leaving and resume on returning to the game.
  document.addEventListener('visibilitychange', () => {
    if (!autoModeEnabled) return;
    if (document.hidden) {
      if (timerState === 'running') pauseTimer('menu');
    } else if (timerState === 'paused' && pausedReason === 'menu') {
      resumeTimer('auto');
    }
  }, true);

  /* ---------- input after death: only likely revive controls ---------- */
  document.addEventListener('keydown', (event) => {
    if (pendingHotkey) return;

    if (event.code === 'Escape') {
      if (popup.style.display === 'block') {
        closePopup();
        return;
      }
      // Do not cancel or stop propagation: Unity must receive Escape and open
      // its pause menu on the first press.
      if (timerState === 'running') pauseTimer('menu');
      return;
    }

    if (popup.style.display === 'block') return;
    // With sound effects muted, some Unity builds stop emitting audio callbacks.
    // A real run-start input is the deterministic fallback when no run is active.
    if (autoModeEnabled && timerState === 'stopped' &&
        (event.code === 'Space' || event.code === 'Enter' || event.code === 'ArrowUp' || event.code === 'KeyW')) {
      startNewRun('auto');
      return;
    }
    if (timerState !== 'paused' || pausedReason !== 'death') return;

    // Never use lateral movement as revive.
    if (event.code === 'KeyA' || event.code === 'KeyD' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') return;

    // Common Subway Surfers revive/continue inputs. This is only armed after a
    // death pause and is intentionally not active during normal gameplay.
    const reviveKeys = new Set(['Space', 'Enter', 'ArrowUp', 'KeyW']);
    if (reviveKeys.has(event.code)) {
      // Do not arm pendingRevive here: Space/Enter can also start a fresh run
      // after a death. The game must confirm a revive via rewardedBreak,
      // reborn:runResumed, gameplayStart after rewardedBreak, or revive audio.
    }
  }, true);

  /* ---------- precise coin counter monitor, based on reference site ---------- */
  function getUnityModule() {
    return window.__troUnityModule || window.Module;
  }

  const coinMonitor = {
    armedAt: 0,
    baselineReady: false,
    heapBuffer: null,
    heapLength: 0,
    intervalId: 0,
    lastCoinCount: 0,
    pendingIncreases: [],
    previousSeeds: null,
    running: false,
    scanWindowIndex: 0,
    scanWindows: []
  };

  function validCoinValue(value) {
    return Number.isInteger(value) && value >= 0 && value <= COIN_COUNTER_MAX_VALUE;
  }

  function seedCounters(heap) {
    if (!heap) return [];
    return COIN_COUNTER_SEEDS
      .filter((index) => index >= 0 && index < heap.length)
      .map((index) => ({ index, value: heap[index] }))
      .filter((item) => validCoinValue(item.value));
  }

  function buildScanWindows(heap) {
    if (!heap) return [];
    const ranges = COIN_COUNTER_SEEDS
      .filter((seed) => seed >= 0 && seed < heap.length)
      .map((seed) => ({ start: Math.max(0, seed - COIN_COUNTER_SCAN_RADIUS), end: Math.min(heap.length, seed + COIN_COUNTER_SCAN_RADIUS + 1) }))
      .sort((a, b) => a.start - b.start || a.end - b.end);
    const merged = [];
    for (const range of ranges) {
      const prev = merged[merged.length - 1];
      if (!prev || range.start > prev.end) merged.push({ ...range });
      else prev.end = Math.max(prev.end, range.end);
    }
    return merged.map((range) => {
      const previous = heap.slice(range.start, range.end);
      const stable = new Uint8Array(previous.length);
      stable.fill(COIN_COUNTER_STABILITY);
      return { ...range, cursor: range.start, previous, stable };
    });
  }

  function refreshScanBuffer() {
    const module = getUnityModule();
    const heap = module && module.HEAP32;
    if (!heap) return null;
    if (coinMonitor.heapBuffer === heap.buffer && coinMonitor.heapLength === heap.length && coinMonitor.scanWindows.length) return heap;
    coinMonitor.heapBuffer = heap.buffer;
    coinMonitor.heapLength = heap.length;
    coinMonitor.scanWindowIndex = 0;
    coinMonitor.scanWindows = buildScanWindows(heap);
    return heap;
  }

  function resetCoinMonitor() {
    if (coinMonitor.intervalId) window.clearInterval(coinMonitor.intervalId);
    coinMonitor.intervalId = 0;
    coinMonitor.heapBuffer = null;
    coinMonitor.heapLength = 0;
    coinMonitor.baselineReady = false;
    coinMonitor.pendingIncreases = [];
    coinMonitor.previousSeeds = null;
    coinMonitor.running = false;
    coinMonitor.scanWindowIndex = 0;
    coinMonitor.scanWindows = [];
    coinMonitor.lastCoinCount = 0;
  }

  function seedIncreaseCandidates() {
    const module = getUnityModule();
    const heap = module && module.HEAP32;
    const values = seedCounters(heap);
    if (values.length < COIN_COUNTER_MIN_MATCHES) return [];
    if (!coinMonitor.previousSeeds) {
      coinMonitor.previousSeeds = new Map(values.map((item) => [item.index, item.value]));
      return [];
    }
    const changes = values
      .map((item) => {
        const previous = coinMonitor.previousSeeds.get(item.index);
        const delta = Number.isInteger(previous) ? item.value - previous : 0;
        return { ...item, delta };
      })
      .filter((item) => item.delta > 0 && item.delta <= COIN_COUNTER_MAX_DELTA);
    coinMonitor.previousSeeds = new Map(values.map((item) => [item.index, item.value]));
    return changes.map((item) => ({ ...item, signalSource: 'heapCounterSeed' }));
  }

  function scanWindow(heap, windowState, from, to) {
    const changes = [];
    for (let index = from; index < to; index += 1) {
      const relative = index - windowState.start;
      const previous = windowState.previous[relative];
      const current = heap[index];
      if (!validCoinValue(current) || !validCoinValue(previous)) {
        windowState.previous[relative] = current;
        windowState.stable[relative] = 0;
        continue;
      }
      const delta = current - previous;
      if (delta === 0) {
        if (windowState.stable[relative] < 255) windowState.stable[relative] += 1;
        continue;
      }
      if (delta > 0 && delta <= COIN_COUNTER_MAX_DELTA && windowState.stable[relative] >= COIN_COUNTER_STABILITY) {
        changes.push({ delta, index, signalSource: 'heapCounterScan', value: current });
      }
      windowState.previous[relative] = current;
      windowState.stable[relative] = 0;
    }
    return changes;
  }

  function scanHeap() {
    const heap = refreshScanBuffer();
    if (!heap || !coinMonitor.scanWindows.length) return [];
    const changes = [];
    let budget = COIN_COUNTER_SCAN_BUDGET;
    let windowsLeft = coinMonitor.scanWindows.length + 1;
    while (budget > 0 && windowsLeft > 0) {
      windowsLeft -= 1;
      const windowState = coinMonitor.scanWindows[coinMonitor.scanWindowIndex % coinMonitor.scanWindows.length];
      if (!windowState) break;
      const start = Math.max(windowState.cursor, windowState.start);
      const end = Math.min(windowState.end, start + budget);
      if (end > start) {
        changes.push(...scanWindow(heap, windowState, start, end));
        budget -= end - start;
      }
      windowState.cursor = end;
      if (windowState.cursor >= windowState.end) {
        windowState.cursor = windowState.start;
        coinMonitor.scanWindowIndex = (coinMonitor.scanWindowIndex + 1) % coinMonitor.scanWindows.length;
      } else {
        break;
      }
    }
    return changes;
  }

  function confirmCoinIncrease(candidates) {
    const grouped = new Map();
    for (const item of candidates) {
      if (item.value <= coinMonitor.lastCoinCount) continue;
      const byValue = grouped.get(item.value) || new Map();
      byValue.set(item.index, item);
      grouped.set(item.value, byValue);
    }

    const group = [...grouped.values()]
      .map((map) => [...map.values()])
      .filter((items) => items.length <= COIN_COUNTER_MAX_MATCHES_PER_VALUE)
      .sort((a, b) => b.length - a.length || a[0].value - b[0].value)[0] || [];

    if (group.length < COIN_COUNTER_MIN_MATCHES) return false;
    const value = group[0].value;
    if (value <= coinMonitor.lastCoinCount) return false;
    const delta = value - coinMonitor.lastCoinCount;
    if (delta <= 0 || delta > COIN_COUNTER_MAX_DELTA) return false;

    coinMonitor.lastCoinCount = value;
    dispatchRuntimeEvent('unity:coinCounterChanged', {
      coinCount: value,
      counterDelta: delta,
      matches: group.slice(0, 12).map(({ index, signalSource, value: matchedValue, delta: matchedDelta }) => ({ index, signalSource, value: matchedValue, delta: matchedDelta })),
      signalSource: group.some((item) => item.signalSource === 'heapCounterSeed') ? 'heapCounterSeed' : 'heapCounterScan'
    });
    return true;
  }

  function pushCoinCandidates(candidates) {
    if (!candidates.length) return;
    const eventNow = performance.now();
    coinMonitor.pendingIncreases = [
      ...coinMonitor.pendingIncreases.filter((item) => eventNow - item.time <= COIN_COUNTER_PENDING_MS),
      ...candidates.map((item) => ({ ...item, time: eventNow }))
    ].filter((item) => item.value > coinMonitor.lastCoinCount).slice(-1200);
    if (confirmCoinIncrease(coinMonitor.pendingIncreases)) {
      const current = coinMonitor.lastCoinCount;
      coinMonitor.pendingIncreases = coinMonitor.pendingIncreases.filter((item) => item.value > current);
    }
  }

  function coinMonitorTick() {
    if (!coinMonitor.running || performance.now() < coinMonitor.armedAt) return;
    const module = getUnityModule();
    if (!module) return;
    if (!coinMonitor.baselineReady) {
      const seeds = seedCounters(module.HEAP32);
      coinMonitor.previousSeeds = new Map(seeds.map((item) => [item.index, item.value]));
      refreshScanBuffer();
      coinMonitor.baselineReady = true;
      return;
    }
    const seededCandidates = seedIncreaseCandidates();
    // The known counter offsets are checked every interval. The broad memory
    // scan is only useful during a timed run; don't spend CPU on it in menus.
    if (timerState === 'running') pushCoinCandidates([...seededCandidates, ...scanHeap()]);
    else if (seededCandidates.length) pushCoinCandidates(seededCandidates);
  }

  function startCoinMonitor() {
    if (coinMonitor.running) return;
    coinMonitor.running = true;
    coinMonitor.armedAt = performance.now() + COIN_COUNTER_ARM_DELAY_MS;
    coinMonitor.baselineReady = false;
    coinMonitor.lastCoinCount = 0;
    coinMonitor.pendingIncreases = [];
    coinMonitor.previousSeeds = null;
    coinMonitor.heapBuffer = null;
    coinMonitor.heapLength = 0;
    coinMonitor.scanWindowIndex = 0;
    coinMonitor.scanWindows = [];
    if (!coinMonitor.intervalId) coinMonitor.intervalId = window.setInterval(coinMonitorTick, COIN_COUNTER_INTERVAL_MS);
  }

  function stopCoinMonitor() { resetCoinMonitor(); }

  window.addEventListener('tro:unity-runtime-event', (event) => {
    const type = String(event && event.detail && event.detail.type || '');
    if (type === 'poki:gameplayStart' || type === 'poki:roundStart') startCoinMonitor();
    if (type === 'poki:roundEnd') stopCoinMonitor();
  });

  window.__chronoRuntimeBridge = { dispatchRuntimeEvent, startCoinMonitor, stopCoinMonitor };

  /* ---------- initial state ---------- */
  function applyGlobalChronoVisibility() {
    try { chronoEl.style.display = localStorage.getItem('runner-lab-chrono-enabled') === 'false' ? 'none' : ''; } catch (e) { chronoEl.style.display = ''; }
  }
  window.addEventListener('storage', (event) => { if (event.key === 'runner-lab-chrono-enabled') applyGlobalChronoVisibility(); });

  function restore() {
    chronoEl.style.left = `${settings.left}px`;
    chronoEl.style.top = `${settings.top}px`;
    applyVisualSettings();
    optimizeStoredBackground();
    updateHotkeyButtons();
    clampPosition();
    render();
    ensurePokiBridge();
    window.setTimeout(ensurePokiBridge, 250);
    window.setTimeout(ensurePokiBridge, 1000);
    // Start monitoring before the first gameplay event so early coins are not missed.
    startCoinMonitor();
    startScoreWatch();
    ensureChronoAudioHook();
  }

  restore();
  applyGlobalChronoVisibility();

  window.chrono = {
    setAutoMode: (enabled) => { autoModeEnabled = Boolean(enabled); },
    setVisualOptions: (options = {}) => { for (const key of ['runningColor','pausedColor','stoppedColor','endedColor']) if (/^#[0-9a-f]{6}$/i.test(options[key] || '')) settings[key] = options[key]; lastGradientSignature = ''; applyGradientColor(); render(); },
    start: () => startNewRun('manual'),
    pause: () => pauseTimer('manual'),
    reset: resetTimer,
    resume: () => resumeTimer('manual'),
    toggle: togglePause,
    state: () => ({ timerState, elapsedMs: currentElapsed(), pausedReason })
  };
})();

