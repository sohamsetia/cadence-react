/* =========================================================
   CADENCE — POMODORO FOCUS TIMER (was js/pomodoro.js)
   The timer logic is kept as-is in a mutable ref; where the
   original called updateDisplay() to patch the DOM, this calls
   rerender() and the JSX below reads the same state.
   ========================================================= */

import { useEffect, useReducer, useRef, useState } from "react";
import { Coffee, Eye, RotateCcw, Settings, SkipForward, X } from "lucide-react";

/* ---- Constants ---- */
const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88 from the SVG circle
const LS_KEY = "cadence_pomo";

/* ---- Defaults ---- */
const DEFAULTS = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longAfter: 4,
  soundEnabled: true,
  autoBreak: false,
  autoFocus: false
};

const MODE_LABELS = { focus: "FOCUS", short: "SHORT BREAK", long: "LONG BREAK" };

/* ---- Persistence ---- */
function loadConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY));
    return Object.assign({}, DEFAULTS, stored);
  } catch (_) {
    return Object.assign({}, DEFAULTS);
  }
}

function saveConfig(config) {
  localStorage.setItem(LS_KEY, JSON.stringify(config));
}

/* ---- Helpers ---- */
function pad(n) { return String(n).padStart(2, "0"); }

function formatTime(sec) {
  return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
}

/* ---- Audio ---- */
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  } catch (_) { /* no audio context available */ }
}

/* ---- Timer engine (the original module-level state + functions) ---- */
function createTimer(rerender) {
  const config = loadConfig();
  const t = {
    config,
    mode: "focus",          // 'focus' | 'short' | 'long'
    totalSeconds: config.focusMin * 60,
    remaining: config.focusMin * 60,
    running: false,
    timerInterval: null,
    currentSession: 1       // 1-based session counter (focus sessions)
  };

  function getDuration(m) {
    if (m === "focus") return t.config.focusMin * 60;
    if (m === "short") return t.config.shortMin * 60;
    return t.config.longMin * 60;
  }

  function startTimer() {
    if (t.running) return;
    t.running = true;
    t.timerInterval = setInterval(tick, 1000);
    rerender();
  }

  function pauseTimer() {
    t.running = false;
    clearInterval(t.timerInterval);
    t.timerInterval = null;
    rerender();
  }

  function resetTimer() {
    pauseTimer();
    t.totalSeconds = getDuration(t.mode);
    t.remaining = t.totalSeconds;
    rerender();
  }

  function tick() {
    if (t.remaining <= 0) {
      onTimerComplete();
      return;
    }
    t.remaining--;
    rerender();
  }

  function onTimerComplete() {
    pauseTimer();

    // Sound alert
    if (t.config.soundEnabled) playChime();

    if (t.mode === "focus") {
      // Move to break
      switchMode(t.currentSession >= t.config.longAfter ? "long" : "short");
      if (t.config.autoBreak) startTimer();
    } else {
      // After break, advance session
      if (t.mode === "long") t.currentSession = 1;
      else t.currentSession++;
      switchMode("focus");
      if (t.config.autoFocus) startTimer();
    }
  }

  function switchMode(newMode) {
    pauseTimer();
    t.mode = newMode;
    t.totalSeconds = getDuration(t.mode);
    t.remaining = t.totalSeconds;
    rerender();
  }

  function skipToNext() {
    if (t.mode === "focus") {
      switchMode(t.currentSession >= t.config.longAfter ? "long" : "short");
    } else {
      if (t.mode === "long") t.currentSession = 1;
      else t.currentSession++;
      switchMode("focus");
    }
  }

  function applySettings(next) {
    t.config = next;
    saveConfig(next);
    // Reset timer with new durations
    t.totalSeconds = getDuration(t.mode);
    t.remaining = t.totalSeconds;
    if (t.currentSession > t.config.longAfter) t.currentSession = 1;
    rerender();
  }

  function dispose() {
    clearInterval(t.timerInterval);
    t.timerInterval = null;
    t.running = false;
  }

  return { state: t, startTimer, pauseTimer, resetTimer, switchMode, skipToNext, applySettings, dispose };
}

/* ---- Settings modal ---- */
const STEPPERS = [
  { key: "focusMin", label: "Focus Session", unit: "min", max: 90 },
  { key: "shortMin", label: "Short Break", unit: "min", max: 90 },
  { key: "longMin", label: "Long Break", unit: "min", max: 90 },
  { key: "longAfter", label: "Long break after", unit: "sess.", max: 10 }
];
const TOGGLES = [
  { key: "soundEnabled", label: "Sound alert" },
  { key: "autoBreak", label: "Auto-start breaks" },
  { key: "autoFocus", label: "Auto-start focus" }
];

function PomodoroSettings({ config, onSave, onClose }) {
  const [draft, setDraft] = useState(config);
  const [tab, setTab] = useState("duration");
  const backdropRef = useRef(null);

  function step(key, delta, max) {
    // Clamp
    setDraft(d => ({ ...d, [key]: Math.max(1, Math.min(max, d[key] + delta)) }));
  }

  return (
    <div className="pomo-modal-backdrop" ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}>
      <div className="pomo-modal" role="dialog" aria-modal="true" aria-labelledby="pomoModalTitle">
        <div className="pomo-modal-head">
          <h3 id="pomoModalTitle">Settings</h3>
          <button className="icon-btn-ghost" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }} onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="pomo-modal-tabs">
          <button className={`pomo-modal-tab${tab === "duration" ? " is-active" : ""}`} onClick={() => setTab("duration")}>Duration</button>
          <button className={`pomo-modal-tab${tab === "notifications" ? " is-active" : ""}`} onClick={() => setTab("notifications")}>Notifications</button>
        </div>

        {/* Duration Tab */}
        <div className="pomo-modal-panel" style={tab === "duration" ? undefined : { display: "none" }}>
          {STEPPERS.map(({ key, label, unit, max }) => (
            <div className="pomo-setting-row" key={key}>
              <span className="pomo-setting-label">{label}</span>
              <div className="pomo-setting-stepper">
                <button className="pomo-stepper-btn" onClick={() => step(key, -1, max)}>−</button>
                <span className="pomo-stepper-value">{draft[key]}</span>
                <span className="pomo-stepper-unit">{unit}</span>
                <button className="pomo-stepper-btn" onClick={() => step(key, 1, max)}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications Tab */}
        <div className="pomo-modal-panel" style={tab === "notifications" ? undefined : { display: "none" }}>
          {TOGGLES.map(({ key, label }) => (
            <div className="pomo-setting-row" key={key}>
              <span className="pomo-setting-label">{label}</span>
              <label className="pomo-toggle">
                <input type="checkbox" checked={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))} />
                <span className="pomo-toggle-track"></span>
              </label>
            </div>
          ))}
        </div>

        <button className="btn btn-primary pomo-modal-save" onClick={() => onSave(draft)}>Save Changes</button>
      </div>
    </div>
  );
}

/* ---- Widget ---- */
export default function Pomodoro() {
  const [, rerender] = useReducer(x => x + 1, 0);
  const timerRef = useRef(null);
  if (!timerRef.current) timerRef.current = createTimer(rerender);
  const timer = timerRef.current;
  const s = timer.state;
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => () => timer.dispose(), [timer]);

  const elapsed = s.totalSeconds - s.remaining;
  const fraction = s.totalSeconds > 0 ? elapsed / s.totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - fraction); // 0 = full ring

  const widgetCls = ["area-group", "widget", "widget-pomodoro"];
  if (s.running) widgetCls.push("is-running");
  if (s.mode !== "focus") widgetCls.push("is-break");

  const dots = [];
  for (let i = 1; i <= s.config.longAfter; i++) {
    let cls = "pomo-dot";
    if (i < s.currentSession) cls += " is-done";
    if (i === s.currentSession && s.mode === "focus" && s.running) cls += " is-active";
    dots.push(<span key={i} className={cls}></span>);
  }

  return (
    <>
      <div className={widgetCls.join(" ")} id="pomodoroWidget">
        <div className="widget-head">
          <h3>Pomodoro</h3>
          <div className="widget-controls">
            <button className="pomo-settings-btn" aria-label="Timer settings" onClick={() => setSettingsOpen(true)}>
              <Settings width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Mode selector pills */}
        <div className="pomo-mode-pills">
          {[["focus", "Focus"], ["short", "Short Break"], ["long", "Long Break"]].map(([m, label]) => (
            <button
              key={m}
              className={`pomo-pill${s.mode === m ? " is-active" : ""}`}
              onClick={() => { if (s.mode !== m) timer.switchMode(m); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="pomo-ring-wrap">
          <svg className="pomo-ring-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--lime)" />
                <stop offset="100%" stopColor="var(--purple)" />
              </linearGradient>
            </defs>
            <circle className="pomo-ring-track" cx="100" cy="100" r="88" />
            <circle
              className="pomo-ring-progress"
              cx="100" cy="100" r="88"
              style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: offset }}
            />
          </svg>
          <div className="pomo-ring-inner">
            <span className="pomo-mode-icon" aria-hidden="true">
              {s.mode === "focus" ? <Eye width={18} height={18} /> : <Coffee width={18} height={18} />}
            </span>
            <span className="pomo-time">{formatTime(s.remaining)}</span>
            <span className="pomo-mode-label">{MODE_LABELS[s.mode]}</span>
            {/* Session dots */}
            <div className="pomo-session-dots">{dots}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="pomo-controls">
          <button className="pomo-ctrl-btn pomo-ctrl-secondary" aria-label="Reset timer" onClick={timer.resetTimer}>
            <RotateCcw width={16} height={16} />
          </button>
          <button className="pomo-ctrl-btn pomo-ctrl-primary" onClick={() => (s.running ? timer.pauseTimer() : timer.startTimer())}>
            {s.running ? "PAUSE" : (s.remaining < s.totalSeconds ? "RESUME" : "START")}
          </button>
          <button className="pomo-ctrl-btn pomo-ctrl-secondary" aria-label="Skip to next" onClick={timer.skipToNext}>
            <SkipForward width={16} height={16} />
          </button>
        </div>

        {/* Session counter */}
        <p className="pomo-session-count">Session {s.currentSession} of {s.config.longAfter}</p>
      </div>

      {settingsOpen && (
        <PomodoroSettings
          config={s.config}
          onClose={() => setSettingsOpen(false)}
          onSave={draft => {
            timer.applySettings({
              ...draft,
              focusMin: parseInt(draft.focusMin, 10) || DEFAULTS.focusMin,
              shortMin: parseInt(draft.shortMin, 10) || DEFAULTS.shortMin,
              longMin: parseInt(draft.longMin, 10) || DEFAULTS.longMin,
              longAfter: parseInt(draft.longAfter, 10) || DEFAULTS.longAfter
            });
            setSettingsOpen(false);
          }}
        />
      )}
    </>
  );
}
