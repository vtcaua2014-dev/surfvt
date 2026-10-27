
/* P14 Functions — Teclas na tela / WASD
 * Adaptado das funções renderKeys, keyGroups e handleKey de overlay.js.
 * Funciona em páginas HTML normais, sem APIs da extensão.
 * API: window.P14WASD.show(), hide(), configure({...}), destroy().
 */
(() => {
  'use strict';
  if (window.P14WASD) return;

  const config = {
    show: true,
    move: true,
    arrows: false,
    only4: false,
    extra: [],
    size: 52,
    accent: '#6366f1',
    left: 12,
    bottom: 12,
    wasd: {
      up: 'KeyW',
      left: 'KeyA',
      down: 'KeyS',
      right: 'KeyD'
    }
  };

  const pressed = new Set();
  let host, root, panel;

  const label = code => {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);

    return ({
      Space: 'SPACE',
      ShiftLeft: 'SHIFT',
      ShiftRight: 'SHIFT',
      ControlLeft: 'CTRL',
      ControlRight: 'CTRL',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Enter: 'ENTER',
      Escape: 'ESC',
      Tab: 'TAB',
      Backspace: '⌫'
    })[code] || code.replace(/(Left|Right)$/, '').toUpperCase();
  };

  function create() {
    if (host) return;

    host = document.createElement('div');
    host.id = 'p14-wasd-overlay';
    host.style.cssText =
      'position:fixed;z-index:2147483000;left:12px;bottom:12px;pointer-events:auto;user-select:none;touch-action:none';

    root = host.attachShadow({mode:'open'});

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing:border-box; }

      .panel {
        display:flex;
        flex-direction:column;
        gap:6px;
        align-items:flex-start;
        cursor:grab;
        touch-action:none;
      }

      .panel.dragging { cursor:grabbing; }

      .clusters {
        display:flex;
        gap:18px;
        align-items:flex-end;
      }

      .grid {
        display:grid;
        grid-auto-columns:var(--ks,52px);
        grid-auto-rows:var(--ks,52px);
        gap:4px;
      }

      .others {
        display:flex;
        flex-wrap:wrap;
        gap:4px;
        max-width:360px;
      }

      .cap {
        display:grid;
        place-items:center;
        width:var(--ks,52px);
        height:var(--ks,52px);
        background:rgba(10,10,12,.78);
        color:white;
        border:2px solid rgba(255,255,255,.5);
        border-radius:11px;
        font:700 calc(var(--ks,52px)*.4)/1 system-ui,sans-serif;
        transition:background .06s,transform .06s,border-color .06s;
        text-shadow:0 1px 2px rgba(0,0,0,.6);
        white-space:nowrap;
        pointer-events:none;
      }

      .others .cap {
        width:auto;
        min-width:var(--ks,52px);
        padding:0 12px;
        font-size:calc(var(--ks,52px)*.26);
      }

      .others .wide {
        min-width:calc(var(--ks,52px)*3);
      }

      .cap.on {
        background:var(--acc,#6366f1);
        border-color:rgba(255,255,255,.85);
        transform:scale(.94);
      }
    `;

    panel = document.createElement('div');
    panel.className = 'panel';

    root.append(style, panel);
    document.body.appendChild(host);

    let start = null;

    panel.addEventListener('pointerdown', e => {
      if(e.button !== 0 && e.pointerType === 'mouse') return;

      const r = host.getBoundingClientRect();

      start = {
        x: e.clientX,
        y: e.clientY,
        left: r.left,
        top: r.top,
        id: e.pointerId
      };

      panel.setPointerCapture(e.pointerId);
      panel.classList.add('dragging');
    });

    panel.addEventListener('pointermove', e => {
      if(!start || start.id !== e.pointerId) return;

      host.style.left =
        Math.max(0, Math.min(
          innerWidth - host.offsetWidth,
          start.left + e.clientX - start.x
        )) + 'px';

      host.style.top =
        Math.max(0, Math.min(
          innerHeight - host.offsetHeight,
          start.top + e.clientY - start.y
        )) + 'px';

      host.style.bottom = 'auto';
      host.style.right = 'auto';
    });

    const end = e => {
      if(start && e.pointerId === start.id) {
        start = null;
        panel.classList.remove('dragging');
      }
    };

    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  function cap(code, row, column) {
    const el = document.createElement('div');

    el.className = 'cap';
    el.dataset.code = code;
    el.textContent = label(code);

    if(row) el.style.gridRow = row;
    if(column) el.style.gridColumn = column;

    return el;
  }

  function cluster(c) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    grid.append(
      cap(c.up, 1, 2),
      cap(c.left, 2, 1),
      cap(c.down, 2, 2),
      cap(c.right, 2, 3)
    );

    return grid;
  }

  function refresh() {
    if(!panel) return;

    panel.querySelectorAll('.cap').forEach(el =>
      el.classList.toggle(
        'on',
        pressed.has(el.dataset.code)
      )
    );
  }

  function render() {
    create();

    host.style.display = config.show ? '' : 'none';

    host.style.setProperty(
      '--ks',
      Math.max(28, Math.min(80, Number(config.size) || 52)) + 'px'
    );

    host.style.setProperty('--acc', config.accent);

    panel.replaceChildren();

    const clusters = document.createElement('div');
    clusters.className = 'clusters';

    if(config.move || config.only4) {
      clusters.appendChild(cluster(config.wasd));
    }

    if(config.arrows && !config.only4) {
      clusters.appendChild(cluster({
        up: 'ArrowUp',
        left: 'ArrowLeft',
        down: 'ArrowDown',
        right: 'ArrowRight'
      }));
    }

    if(clusters.childElementCount) {
      panel.appendChild(clusters);
    }

    if(!config.only4 && config.extra.length) {
      const others = document.createElement('div');
      others.className = 'others';

      config.extra.forEach(code => {
        let el = cap(code);

        if(code === 'Space') {
          el.classList.add('wide');
        }

        others.appendChild(el);
      });

      panel.appendChild(others);
    }

    refresh();
  }

  const down = e => {
    pressed.add(e.code);
    refresh();
  };

  const up = e => {
    pressed.delete(e.code);
    refresh();
  };

  const blur = () => {
    pressed.clear();
    refresh();
  };

  addEventListener('keydown', down, true);
  addEventListener('keyup', up, true);
  addEventListener('blur', blur);

  const api = {
    show() {
      config.show = true;
      render();
    },

    hide() {
      config.show = false;
      render();
    },

    configure(options = {}) {
      if(options.wasd) {
        Object.assign(config.wasd, options.wasd);
      }

      for(const [key, value] of Object.entries(options)) {
        if(key !== 'wasd' && key in config) {
          config[key] = value;
        }
      }

      render();
      return api;
    },

    destroy() {
      removeEventListener('keydown', down, true);
      removeEventListener('keyup', up, true);
      removeEventListener('blur', blur);

      host?.remove();

      host = null;
      root = null;
      panel = null;

      delete window.P14WASD;
    }
  };

  window.P14WASD = api;

  if(document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      render,
      {once:true}
    );
  } else {
    render();
  }
})();

