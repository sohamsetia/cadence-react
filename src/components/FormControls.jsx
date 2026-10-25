/* Form building blocks shared by the auth pages and Profile
   (were setupPasswordToggle / setupStrengthMeter / setupCaptcha
   and showBanner in js/auth.js). */

import { useCallback, useState } from "react";
import { generateCaptcha, passwordStrength } from "../lib/auth";

/* ---------------- banner ---------------- */

export function Banner({ banner }) {
  if (!banner) return null;
  return <div className={`auth-banner ${banner.type}`}>{banner.message}</div>;
}

export function FieldError({ message }) {
  return <span className="auth-field-error">{message || ""}</span>;
}

/* ---------------- password show/hide ---------------- */

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 4.2A11 11 0 0123 12s-1.6 2.8-4.4 4.8M6.1 6.9C3.6 8.6 2 11 2 12s4 7 11 7c1.4 0 2.7-.2 3.9-.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-input-wrap">
      <input
        type={visible ? "text" : "password"}
        id={id}
        className="auth-input has-icon-right"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button"
        className="auth-input-icon-btn"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(v => !v)}
      >
        {visible ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
}

/* ---------------- strength meter ---------------- */

const ACTIVE_CLASS = ["", "active-weak", "active-medium", "active-strong"];

export function StrengthMeter({ password }) {
  const { score, label } = passwordStrength(password);
  const activeClass = ACTIVE_CLASS[score];
  return (
    <>
      <div className="auth-strength">
        {[0, 1, 2].map(i => (
          <span key={i} className={`auth-strength-bar${i < score && activeClass ? " " + activeClass : ""}`} />
        ))}
      </div>
      <span className="auth-strength-label">{label}</span>
    </>
  );
}

/* ---------------- CAPTCHA ---------------- */

/**
 * Returns the current code plus check(value), which compares
 * case-insensitively and always rotates the code afterwards,
 * pass or fail — same contract as the original setupCaptcha().
 */
export function useCaptcha() {
  const [code, setCode] = useState(generateCaptcha);
  const [spinning, setSpinning] = useState(false);

  const regenerate = useCallback(() => {
    setCode(generateCaptcha());
    setSpinning(true);
    setTimeout(() => setSpinning(false), 200);
  }, []);

  const check = useCallback(value => {
    const match = String(value || "").trim().toUpperCase() === code.toUpperCase();
    regenerate();
    return match;
  }, [code, regenerate]);

  return { code, spinning, regenerate, check };
}

export function Captcha({ captcha, inputId, value, onChange, error }) {
  return (
    <div className="auth-captcha">
      <div className="auth-captcha-row">
        <div className="auth-captcha-code">{captcha.code.split("").join(" ")}</div>
        <button
          type="button"
          className={`auth-captcha-refresh${captcha.spinning ? " spin" : ""}`}
          aria-label="Get a new code"
          onClick={captcha.regenerate}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <input
        type="text"
        id={inputId}
        className="auth-input"
        placeholder="Enter the code above"
        autoComplete="off"
        required
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <FieldError message={error} />
    </div>
  );
}
