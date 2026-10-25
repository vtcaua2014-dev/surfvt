import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { GripHorizontal, Pause, Play, RotateCcw, Settings, Zap } from "lucide-react";
import "./p14-overlays.css";

type TimerStyle = "native" | "livesplit" | "chrono";
type WidgetId = "floating" | "livesplit" | "chrono" | "fps" | "wasd";
type WidgetPrefs = {
  x: number;
  y: number;
  scale: number;
  color: string;
  background: string;
  font: string;
  opacity: number;
};
type WidgetPrefsMap = Record<WidgetId, WidgetPrefs>;

type P14OverlaysProps = {
  timerEnabled: boolean;
  timerStyle: TimerStyle;
  timerCompatible: boolean;
  fpsEnabled: boolean;
  fpsCap: string;
  wasdEnabled: boolean;
  controlKeys: string[];
  pressedKey: string | null;
  isDesktop: boolean;
  autoBoostEnabled: boolean;
  onAutoBoost: () => void;
  onControlPress: (key: string, down: boolean) => void;
};

const PREFS_KEY = "surfvt14-p14-overlay-prefs-v1";
const FONTS = ["Century Gothic", "Roboto", "Arial", "Verdana", "Tahoma", "Georgia", "monospace"];

function defaultPrefs(): WidgetPrefsMap {
  const width = typeof window === "undefined" ? 1024 : window.innerWidth;
  const height = typeof window === "undefined" ? 768 : window.innerHeight;
  const base = (x: number, y: number, color: string, background: string): WidgetPrefs => ({
    x, y, scale: 1, color, background, font: "Century Gothic", opacity: 100,
  });
  return {
    floating: base(14, 74, "#ffffff", "#000000"),
    livesplit: base(14, 18, "#29cc54", "#000000"),
    chrono: base(14, 18, "#ffffff", "rgba(0,0,0,.88)"),
    fps: base(Math.max(12, width - 110), 18, "#29cc54", "rgba(0,0,0,.78)"),
    wasd: base(18, Math.max(60, height - 170), "#ffffff", "transparent"),
  };
}

function readPrefs(): WidgetPrefsMap {
  const defaults = defaultPrefs();
  try {
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    return Object.fromEntries(
      (Object.keys(defaults) as WidgetId[]).map((id) => [
        id,
        { ...defaults[id], ...(stored[id] || {}) },
      ]),
    ) as WidgetPrefsMap;
  } catch {
    return defaults;
  }
}

function formatTime(ms: number, style: TimerStyle) {
  const value = Math.max(0, ms);
  const cs = Math.floor(value / 10) % 100;
  const t = Math.floor(value / 100) % 10;
  const totalSeconds = Math.floor(value / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (style === "chrono") return [pad(hours), pad(minutes), pad(seconds)];
  if (style === "native") return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) + "." + t;
  const main = hours > 0
    ? hours + ":" + pad(minutes) + ":" + pad(seconds)
    : minutes > 0 ? minutes + ":" + pad(seconds) : String(seconds);
  return [main, "." + pad(cs)] as const;
}

function OverlaySettings({
  id, prefs, update,
}: { id: WidgetId; prefs: WidgetPrefs; update: (patch: Partial<WidgetPrefs>) => void }) {
  return (
    <div className="p14-settings-panel" onPointerDown={(event) => event.stopPropagation()}>
      <strong>{id === "wasd" ? "HOTKEYS" : id === "fps" ? "FPS" : "CRONÔMETRO"}</strong>
      <label>Cor<input type="color" value={prefs.color} onChange={(event) => update({ color: event.target.value })} /></label>
      {id !== "wasd" && (
        <label>Fundo<input type="color" value={prefs.background.startsWith("#") ? prefs.background : "#000000"} onChange={(event) => update({ background: event.target.value })} /></label>
      )}
      <label>Fonte
        <select value={prefs.font} onChange={(event) => update({ font: event.target.value })}>
          {FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>
      </label>
      <label>Tamanho
        <input type="range" min="60" max="220" value={Math.round(prefs.scale * 100)} onChange={(event) => update({ scale: Number(event.target.value) / 100 })} />
      </label>
      <label>Opacidade
        <input type="range" min="20" max="100" value={prefs.opacity} onChange={(event) => update({ opacity: Number(event.target.value) })} />
      </label>
    </div>
  );
}

function OverlayWidget({
  id, title, prefs, update, children, className = "", longPress,
}: {
  id: WidgetId;
  title: string;
  prefs: WidgetPrefs;
  update: (patch: Partial<WidgetPrefs>) => void;
  children: ReactNode;
  className?: string;
  longPress?: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const drag = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const resize = useRef<{ pointerId: number; x: number; y: number; scale: number } | null>(null);
  const hold = useRef<number | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);

  const dragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    moved.current = false;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: prefs.x, top: prefs.y };
  };
  const dragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    update({
      x: Math.max(0, Math.min(window.innerWidth - 24, drag.current.left + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 24, drag.current.top + dy)),
    });
  };
  const dragEnd = () => { drag.current = null; };

  const resizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resize.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scale: prefs.scale };
  };
  const resizeMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!resize.current || resize.current.pointerId !== event.pointerId) return;
    const delta = (event.clientX - resize.current.x + event.clientY - resize.current.y) / 150;
    update({ scale: Math.max(.6, Math.min(2.2, resize.current.scale + delta)) });
  };
  const resizeEnd = () => { resize.current = null; };

  const contentDown = () => {
    if (!longPress) return;
    moved.current = false;
    if (hold.current != null) window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => {
      moved.current = true;
      suppressClick.current = true;
      setSettingsOpen(true);
      longPress();
    }, 2000);
  };
  const contentUp = () => {
    if (hold.current != null) window.clearTimeout(hold.current);
    hold.current = null;
  };

  const style: CSSProperties & Record<string, string | number> = {
    left: prefs.x,
    top: prefs.y,
    transform: "scale(" + prefs.scale + ")",
    transformOrigin: "top left",
    opacity: prefs.opacity / 100,
    "--p14-color": prefs.color,
    "--p14-background": prefs.background,
    "--p14-font": prefs.font,
  };

  return (
    <section className={"p14-widget p14-widget-" + id + " " + className} style={style} aria-label={title}>
      <div className="p14-widget-tools">
        <button
          type="button"
          className="p14-drag-button"
          aria-label={"Mover " + title}
          title="Arraste para mover"
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
          onClick={(event) => { if (moved.current) event.preventDefault(); }}
        >
          <GripHorizontal aria-hidden="true" />
        </button>
        <button
          type="button"
          className={"p14-settings-button" + (settingsOpen ? " is-open" : "")}
          aria-label={"Configurações de " + title}
          title="Configurações"
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <Settings aria-hidden="true" />
        </button>
      </div>
      <div className="p14-widget-content" onPointerDown={contentDown} onPointerUp={contentUp} onPointerCancel={contentUp} onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
        {children}
      </div>
      {(["nw", "ne", "sw", "se"] as const).map((corner) => (
        <button
          type="button"
          key={corner}
          className={"p14-resize-handle p14-resize-" + corner}
          aria-label={"Redimensionar " + title}
          onPointerDown={resizeStart}
          onPointerMove={resizeMove}
          onPointerUp={resizeEnd}
          onPointerCancel={resizeEnd}
        />
      ))}
      {settingsOpen && <OverlaySettings id={id} prefs={prefs} update={update} />}
    </section>
  );
}

export default function P14Overlays(props: P14OverlaysProps) {
  const [prefs, setPrefs] = useState<WidgetPrefsMap>(readPrefs);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);
  const [fps, setFps] = useState(0);
  const startedAt = useRef(0);
  const baseElapsed = useRef(0);
  const elapsedRef = useRef(0);
  const tapTimer = useRef<number | null>(null);
  const mode: TimerStyle = props.timerStyle;
  const widgetId: WidgetId = mode === "native" ? "floating" : mode;
  const timerVisible = props.timerEnabled && props.timerCompatible;

  const updatePrefs = useCallback((id: WidgetId, patch: Partial<WidgetPrefs>) => {
    setPrefs((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* storage pode estar bloqueado */ }
  }, [prefs]);

  const currentElapsed = () => running ? baseElapsed.current + performance.now() - startedAt.current : elapsedRef.current;
  const startOrPause = () => {
    if (running) {
      const value = currentElapsed();
      baseElapsed.current = value;
      elapsedRef.current = value;
      setElapsed(value);
      setRunning(false);
    } else {
      if (elapsedRef.current === 0) baseElapsed.current = 0;
      startedAt.current = performance.now();
      setRunning(true);
    }
  };
  const reset = () => {
    baseElapsed.current = 0;
    elapsedRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setSplits([]);
    startedAt.current = 0;
  };
  const split = () => {
    const value = currentElapsed();
    elapsedRef.current = value;
    setElapsed(value);
    setSplits((items) => [...items, value].slice(-8));
  };

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      const value = currentElapsed();
      elapsedRef.current = value;
      setElapsed(value);
    }, 30);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const toggle = () => startOrPause();
    const clear = () => reset();
    const addSplit = () => split();
    const gameEvent = (event: Event) => {
      const type = String((event as CustomEvent<{type?: string}>).detail?.type || "");
      if (["poki:gameplayStart", "poki:roundStart", "reborn:runStarted"].includes(type) && !running) startOrPause();
      if (["poki:roundEnd", "reborn:playerDied", "reborn:gameEnded"].includes(type) && running) startOrPause();
    };
    window.addEventListener("SURFVT14_TIMER_TOGGLE", toggle);
    window.addEventListener("SURFVT14_TIMER_RESET", clear);
    window.addEventListener("SURFVT14_TIMER_SPLIT", addSplit);
    window.addEventListener("tro:unity-runtime-event", gameEvent);
    return () => {
      window.removeEventListener("SURFVT14_TIMER_TOGGLE", toggle);
      window.removeEventListener("SURFVT14_TIMER_RESET", clear);
      window.removeEventListener("SURFVT14_TIMER_SPLIT", addSplit);
      window.removeEventListener("tro:unity-runtime-event", gameEvent);
    };
  }, [running]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === "F2") { event.preventDefault(); startOrPause(); }
      if (event.code === "F3") { event.preventDefault(); split(); }
      if (event.code === "F4") { event.preventDefault(); reset(); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [running]);

  useEffect(() => {
    if (!props.fpsEnabled) { setFps(0); return; }
    let frames = 0;
    let start = performance.now();
    let raf = 0;
    let timeout = 0;
    const cap = props.fpsCap === "unlocked" ? 0 : 1000 / Number(props.fpsCap);
    const measure = (now: number) => {
      frames++;
      if (now - start >= 1000) {
        setFps(Math.round(frames * 1000 / (now - start)));
        frames = 0;
        start = now;
      }
      if (cap) timeout = window.setTimeout(() => { raf = requestAnimationFrame(measure); }, cap);
      else raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [props.fpsEnabled, props.fpsCap]);

  useEffect(() => () => {
    if (tapTimer.current != null) window.clearTimeout(tapTimer.current);
  }, []);

  const timerTap = () => {
    if (tapTimer.current != null) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      reset();
    } else {
      tapTimer.current = window.setTimeout(() => {
        tapTimer.current = null;
        startOrPause();
      }, 260);
    }
  };

  const timerPrefs = prefs[widgetId];
  const updateTimerPrefs = (patch: Partial<WidgetPrefs>) => updatePrefs(widgetId, patch);
  const formatted = formatTime(elapsed, mode);
  const timerOverlay = timerVisible && (
    <OverlayWidget
      id={widgetId}
      title={mode === "native" ? "Floating Clock" : mode === "chrono" ? "Chrono" : "LiveSplit"}
      prefs={timerPrefs}
      update={updateTimerPrefs}
      className={mode === "native" ? "p14-timer-floating" : mode === "chrono" ? "p14-timer-chrono" : "p14-timer-livesplit"}
      longPress={() => {}}
    >
      {mode === "native" && (
        <>
          <div className="p14-timer-heading"><span className="p14-clock-icon">9:00</span> Floating Clock</div>
          <div className="p14-floating-time">{formatted}</div>
          <div className="p14-floating-actions">
            <button type="button" onClick={startOrPause} aria-label={running ? "Pausar" : "Iniciar"}>{running ? <Pause /> : <Play />}</button>
            <button type="button" onClick={reset} aria-label="Reiniciar"><RotateCcw /></button>
          </div>
        </>
      )}
      {mode === "chrono" && (
        <div className="p14-chrono-cells" onClick={timerTap} onDoubleClick={(event) => { event.preventDefault(); }}>
          {(formatted as unknown as string[]).map((part, index) => <span className="p14-chrono-cell" key={index}>{part}</span>)}
        </div>
      )}
      {mode === "livesplit" && (
        <div className="p14-livesplit" onClick={timerTap}>
          <div className="p14-live-time"><span>{(formatted as unknown as readonly string[])[0]}</span><small>{(formatted as unknown as readonly string[])[1]}</small></div>
          {splits.length > 0 && <div className="p14-splits">{splits.map((value, index) => <div key={index}><span>#{index + 1}</span><b>{formatTime(value, "chrono").join(":")}</b></div>)}</div>}
        </div>
      )}
    </OverlayWidget>
  );

  const fpsOverlay = props.fpsEnabled && (
    <OverlayWidget id="fps" title="FPS" prefs={prefs.fps} update={(patch) => updatePrefs("fps", patch)} className="p14-fps-widget">
      <span className="p14-fps-readout">{fps} FPS</span>
    </OverlayWidget>
  );

  const wasdOverlay = props.wasdEnabled && (
    <OverlayWidget id="wasd" title="WASD" prefs={prefs.wasd} update={(patch) => updatePrefs("wasd", patch)} className="p14-keys-widget">
      <div className="p14-keys-board" aria-label={"Controles " + (props.isDesktop ? "teclado" : "toque")}>
        <span className="p14-key-spacer" />
        {props.controlKeys.map((key, index) => {
          const slot = ["p14-key-up", "p14-key-left", "p14-key-down", "p14-key-right"][index] || "";
          const active = props.pressedKey?.toLowerCase() === key.toLowerCase();
          return (
            <button
              type="button"
              key={key}
              className={"p14-keycap " + slot + (active ? " is-active" : "")}
              onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); props.onControlPress(key, true); }}
              onPointerUp={() => props.onControlPress(key, false)}
              onPointerCancel={() => props.onControlPress(key, false)}
              onPointerLeave={() => props.onControlPress(key, false)}
              onContextMenu={(event) => event.preventDefault()}
            >
              {key}
            </button>
          );
        })}
      </div>
      {props.autoBoostEnabled && !props.isDesktop && (
        <button type="button" className="p14-boost-key" onClick={props.onAutoBoost}><Zap aria-hidden="true" /> BOOST</button>
      )}
    </OverlayWidget>
  );

  return <>{timerOverlay}{fpsOverlay}{wasdOverlay}</>;
}
