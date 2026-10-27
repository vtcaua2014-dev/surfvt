/* Coordinates the three supplied timer scripts inside the game iframe. */
(() => {
  "use strict";
  if (window.__surfvt14TimerController) return;

  let config = { enabled: false, mode: "chrono", toggleHotkey: "q", resetHotkey: "r" };
  let previousMode = "";
  let previousMaster = "";
  let previousTarget = "";

  const validModes = new Set(["native", "chrono", "livesplit"]);
  function apiFor(mode) {
    if (mode === "livesplit") return window.chrono || null;
    if (mode === "chrono") return window.P14Chrono || null;
    if (mode === "native") return window.P14FloatingClock || null;
    return null;
  }
  function stateFor(mode) {
    const api = apiFor(mode);
    if (!api) return "";
    if (mode === "livesplit") {
      try { return String(api.state()?.timerState || ""); } catch (_) { return ""; }
    }
    try { return String(api.state || ""); } catch (_) { return ""; }
  }
  function setState(mode, desired) {
    const api = apiFor(mode);
    if (!api || !desired) return;
    const current = stateFor(mode);
    if (desired === "stopped") {
      if (current !== "stopped") api.reset?.();
      return;
    }
    if (desired === "running") {
      if (current === "stopped") api.start?.();
      else if (current === "paused") {
        if (mode === "livesplit") api.resume?.();
        else api.start?.();
      }
      return;
    }
    if (desired === "paused") {
      if (current === "stopped") {
        api.start?.();
        api.pause?.();
      } else if (current === "running") api.pause?.();
    }
  }
  function applyVisibility() {
    const visibility = {
      livesplit: ["#chrono"],
      chrono: ["#p14-chrono"],
      native: ["#p14-floatingclock"]
    };
    const settingsPopup = document.querySelector("#chronoSettingsPopup");
    if (settingsPopup && (!config.enabled || config.mode !== "livesplit")) settingsPopup.style.display = "none";
    for (const mode of validModes) {
      for (const selector of visibility[mode]) {
        const node = document.querySelector(selector);
        if (node) node.style.display = config.enabled && config.mode === mode ? "" : "none";
      }
    }
  }
  function sync() {
    applyVisibility();
    const master = stateFor("livesplit");
    const target = stateFor(config.mode);
    if (!master || !target) return;
    if (config.mode === "livesplit") {
      previousMode = config.mode;
      previousMaster = master;
      previousTarget = target;
      return;
    }
    if (previousMode !== config.mode) {
      setState(config.mode, master);
    } else if (master !== previousMaster && target === previousTarget) {
      setState(config.mode, master);
    } else if (target !== previousTarget && master === previousMaster) {
      setState("livesplit", target);
    } else if (target !== master) {
      setState(config.mode, master);
    }
    previousMode = config.mode;
    previousMaster = stateFor("livesplit");
    previousTarget = stateFor(config.mode);
  }
  function toggleMaster() {
    const api = apiFor("livesplit");
    const state = stateFor("livesplit");
    if (!api) return;
    if (state === "running") api.pause?.();
    else if (state === "paused") api.resume?.();
    else api.start?.();
    sync();
  }
  function resetMaster() {
    apiFor("livesplit")?.reset?.();
    sync();
  }
  function onKey(event) {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target?.isContentEditable) return;
    const key = String(event.key || "").toLowerCase();
    if (key !== config.toggleHotkey && key !== config.resetHotkey) return;
    if (!config.enabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (key === config.toggleHotkey) toggleMaster();
    else resetMaster();
  }
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    const data = event.data || {};
    if (data.type === "SURFVT14_TIMERS_CONFIG") {
      config = {
        enabled: Boolean(data.enabled),
        mode: validModes.has(data.mode) ? data.mode : "chrono",
        toggleHotkey: String(data.toggleHotkey || "q").toLowerCase(),
        resetHotkey: String(data.resetHotkey || "r").toLowerCase()
      };
      sync();
    } else if (data.type === "SURFVT14_TIMER_COMMAND" && config.enabled) {
      if (data.action === "toggle") toggleMaster();
      if (data.action === "reset") resetMaster();
    }
  });
  window.addEventListener("SURFVT14_TIMER_TOGGLE", () => { if (config.enabled) toggleMaster(); });
  window.addEventListener("SURFVT14_TIMER_RESET", () => { if (config.enabled) resetMaster(); });
  document.addEventListener("keydown", onKey, true);
  window.__surfvt14TimerController = { sync, setConfig(value) { config = { ...config, ...value }; sync(); } };
  window.setInterval(sync, 80);
  sync();
})();
