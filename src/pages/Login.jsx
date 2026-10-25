/* LOG IN (login.html + initLoginPage() in js/auth.js) */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CadenceDB from "../lib/storage";
import { isValidEmail } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/usePageSetup";
import AuthLayout from "../layouts/AuthLayout";
import { Banner, Captcha, FieldError, PasswordInput, useCaptcha } from "../components/FormControls";

const MOCK = (
  <>
    <div className="auth-mock-row">
      <div className="auth-mock-card auth-mock-hero">
        <p className="mock-label">Due Today</p>
        <div className="auth-mock-bar b1"><span></span></div>
        <div className="auth-mock-bar b2"><span></span></div>
      </div>
      <div className="auth-mock-card auth-mock-ring">
        <div className="ring" style={{ "--val": 72, "--c": "#7c6ffa" }}>72%</div>
      </div>
    </div>
    <div className="auth-mock-card">
      <div className="auth-mock-list">
        <div className="auth-mock-list-item"><span className="auth-mock-dot lime"></span>Essay draft — due Friday</div>
        <div className="auth-mock-list-item"><span className="auth-mock-dot orange"></span>Lab report — due Monday</div>
        <div className="auth-mock-list-item"><span className="auth-mock-dot purple"></span>Group wireframes — due Wed</div>
      </div>
    </div>
  </>
);

export default function Login() {
  useDocumentTitle("Log in — Cadence");
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const captcha = useCaptcha();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const next = {};

    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    const captchaOk = captcha.check(captchaValue);
    setCaptchaValue("");
    if (!captchaOk) next.captcha = "That code didn't match. Try the new one below.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const user = CadenceDB.verifyCredentials(email, password);
    if (!user) {
      setBanner({ type: "error", message: "Incorrect email or password. Please try again." });
      return;
    }

    signIn(user);
    setBanner({ type: "success", message: "Welcome back! Redirecting to your dashboard…" });
    setSubmitting(true);
    setTimeout(() => navigate("/dashboard"), 700);
  }

  return (
    <AuthLayout
      back={{ to: "/home", label: "Back to home" }}
      heading={<>Every deadline,<br />one clear view.</>}
      text="Log back in to see exactly what's due today, what's slipping, and what you can leave for later."
      mock={MOCK}
      quote={{ strong: "\"I finally stopped missing submission windows.\"" }}
    >
      <div className="auth-card-head">
        <h1>Welcome back</h1>
        <p>New to Cadence? <Link to="/register">Create an account</Link></p>
      </div>

      <Banner banner={banner} />

      <form noValidate onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="loginEmail">Email</label>
          <input type="email" id="loginEmail" className="auth-input" placeholder="you@school.edu" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <FieldError message={errors.email} />
        </div>

        <div className="auth-field">
          <label htmlFor="loginPassword">Password</label>
          <PasswordInput id="loginPassword" value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" />
          <FieldError message={errors.password} />
        </div>

        <div className="auth-row-between">
          <label className="auth-checkbox">
            <input type="checkbox" id="loginRemember" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>

        <Captcha captcha={captcha} inputId="loginCaptchaInput" value={captchaValue} onChange={setCaptchaValue} error={errors.captcha} />

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>Log in</button>
      </form>
    </AuthLayout>
  );
}
