/* Installed before Unity and map listeners. Observe physical input once, then
 * remap it once. React receives state only; it never replays iframe input. */
(() => {
  "use strict";
  if (window.__surfvt14InputBridge) return;
  window.__surfvt14InputBridge = true;
  let settings = {};
  try {
    settings = JSON.parse(
      new URLSearchParams(location.search).get("hubSettings") || "{}",
    );
  } catch (_) {}
  const arrows = { ArrowUp: 38, ArrowLeft: 37, ArrowDown: 40, ArrowRight: 39 };
  const normalize = (value) =>
    ({ "↑": "arrowup", "←": "arrowleft", "↓": "arrowdown", "→": "arrowright" })[
      value
    ] ||
    String(value || "")
      .trim()
      .toLowerCase();
  const typing = (target) =>
    target &&
    (target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  const post = (data) => {
    if (parent !== window) parent.postMessage(data, location.origin);
  };
  const held = new Map();
  function mapping() {
    const keys =
      settings.controls === "IJKL"
        ? ["I", "J", "K", "L"]
        : settings.controls === "SETAS"
          ? Object.keys(arrows)
          : settings.controls === "PERSONALIZADO"
            ? ["up", "left", "down", "right"].map(
                (d, i) =>
                  settings.customControls?.[d] || ["T", "F", "G", "H"][i],
              )
            : ["W", "A", "S", "D"];
    return Object.fromEntries(
      keys.map((k, i) => [normalize(k), Object.keys(arrows)[i]]),
    );
  }
  // Insertion order follows the visual board: up, left, down, right.
  function dispatch(type, key, repeat) {
    const event = new KeyboardEvent(type, {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
      repeat: !!repeat,
    });
    Object.defineProperties(event, {
      keyCode: { value: arrows[key] || 0 },
      which: { value: arrows[key] || 0 },
      __surfVT14Forwarded: { value: true },
    });
    (
      document.querySelector("canvas") ||
      document.body ||
      document
    ).dispatchEvent(event);
  }
  function clear() {
    for (const key of held.values()) dispatch("keyup", key, false);
    held.clear();
    post({ type: "SURFVT14_KEY_VISUAL", clear: true });
  }
  function key(event) {
    if (
      !event.isTrusted ||
      typing(event.target) ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    )
      return;
    post({
      type: "SURFVT14_KEY_VISUAL",
      key: event.key,
      code: event.code,
      down: event.type === "keydown",
    });
    if (
      event.type === "keydown" &&
      window.__surfvt14TimerController?.handleKey(event)
    )
      return;
    const mapped =
      event.type === "keyup"
        ? held.get(event.code) || mapping()[normalize(event.key)]
        : mapping()[normalize(event.key)];
    if (!mapped) return;
    if (event.type === "keydown") held.set(event.code, mapped);
    else held.delete(event.code);
    event.preventDefault();
    event.stopImmediatePropagation();
    dispatch(event.type, mapped, event.repeat);
  }
  window.addEventListener("keydown", key, true);
  window.addEventListener("keyup", key, true);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  window.addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== location.origin) return;
    const data = event.data || {};
    if (data.type === "SURFVT14_HUB_SETTINGS") {
      clear();
      settings = { ...settings, ...data.settings };
    }
    if (data.type === "SURFVT14_KEY") {
      const mapped = arrows[data.key]
        ? data.key
        : mapping()[normalize(data.key)];
      if (mapped && ["keydown", "keyup"].includes(data.eventType))
        dispatch(data.eventType, mapped, data.repeat);
    }
  });
})();
