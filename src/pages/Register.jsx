/* CREATE ACCOUNT (register.html + initRegisterPage() in js/auth.js) */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CadenceDB from "../lib/storage";
import { isValidEmail, isValidPassword } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/usePageSetup";
import AuthLayout from "../layouts/AuthLayout";
import { Banner, Captcha, FieldError, PasswordInput, StrengthMeter, useCaptcha } from "../components/FormControls";

const MOCK = (
  <>
    <div className="auth-mock-card auth-mock-hero">
      <p className="mock-label">Your Tasks</p>
      <div className="auth-mock-bar b1"><span></span></div>
      <div className="auth-mock-bar b2"><span></span></div>
    </div>
    <div className="auth-mock-row">
      <div className="auth-mock-card auth-mock-ring">
        <div className="ring" style={{ "--val": 45, "--c": "#ff7a45" }}>45%</div>
      </div>
      <div className="auth-mock-card">
        <div className="auth-mock-list">
          <div className="auth-mock-list-item"><span className="auth-mock-dot lime"></span>Quiz — Biology</div>
          <div className="auth-mock-list-item"><span className="auth-mock-dot purple"></span>Reading — History</div>
        </div>
      </div>
    </div>
  </>
);

export default function Register() {
  useDocumentTitle("Create your account — Cadence");
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const captcha = useCaptcha();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [captchaValue, setCaptchaValue] = useState("");
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const set = field => v => setForm(f => ({ ...f, [field]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const { name, email, password, confirm, terms } = form;
    const next = {};

    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    } else if (CadenceDB.emailExists(email)) {
      next.email = "An account with this email already exists.";
    }
    if (!isValidPassword(password)) next.password = "Use at least 8 characters, including a number.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    if (!terms) next.terms = "You need to accept the Terms & Conditions.";
    const captchaOk = captcha.check(captchaValue);
    setCaptchaValue("");
    if (!captchaOk) next.captcha = "That code didn't match. Try the new one below.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const user = CadenceDB.createUser({ name, email, password });
      signIn(user);
      setBanner({ type: "success", message: "Account created! Redirecting to your dashboard…" });
      setSubmitting(true);
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Something went wrong. Please try again." });
    }
  }

  return (
    <AuthLayout
      back={{ to: "/home", label: "Back to home" }}
      heading={<>Set up your<br />board in a minute.</>}
      text="Add your first assignments, pick a priority, and Cadence sorts the rest — free for every student."
      mock={MOCK}
      quote={{ strong: "\"Setup took less time than my morning coffee.\"" }}
    >
      <div className="auth-card-head">
        <h1>Create your account</h1>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>

      <Banner banner={banner} />

      <form noValidate onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="registerName">Full name</label>
          <input type="text" id="registerName" className="auth-input" placeholder="Jordan Avery" autoComplete="name" required value={form.name} onChange={e => set("name")(e.target.value)} />
          <FieldError message={errors.name} />
        </div>

        <div className="auth-field">
          <label htmlFor="registerEmail">Email</label>
          <input type="email" id="registerEmail" className="auth-input" placeholder="you@school.edu" autoComplete="email" required value={form.email} onChange={e => set("email")(e.target.value)} />
          <FieldError message={errors.email} />
        </div>

        <div className="auth-field">
          <label htmlFor="registerPassword">Password</label>
          <PasswordInput id="registerPassword" value={form.password} onChange={set("password")} placeholder="At least 8 characters" autoComplete="new-password" />
          <StrengthMeter password={form.password} />
          <FieldError message={errors.password} />
        </div>

        <div className="auth-field">
          <label htmlFor="registerConfirmPassword">Confirm password</label>
          <PasswordInput id="registerConfirmPassword" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter your password" autoComplete="new-password" />
          <FieldError message={errors.confirm} />
        </div>

        <Captcha captcha={captcha} inputId="registerCaptchaInput" value={captchaValue} onChange={setCaptchaValue} error={errors.captcha} />

        <div className="auth-field">
          <label className="auth-checkbox wraps">
            <input type="checkbox" id="registerTerms" checked={form.terms} onChange={e => set("terms")(e.target.checked)} />
            <span>I agree to the <a href="/terms-and-conditions" className="auth-link" target="_blank" rel="noopener">Terms &amp; Conditions</a> and <a href="/privacy-policy" className="auth-link" target="_blank" rel="noopener">Privacy Policy</a></span>
          </label>
          <FieldError message={errors.terms} />
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>Create account</button>
      </form>
    </AuthLayout>
  );
}
