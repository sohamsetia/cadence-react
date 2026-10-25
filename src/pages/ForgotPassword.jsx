/* RESET PASSWORD (forgot-password.html + initForgotPasswordPage() in
   js/auth.js): step 1 verifies the email, step 2 sets a new password
   directly — there's no mail server in this front-end-only project. */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CadenceDB from "../lib/storage";
import { isValidEmail, isValidPassword } from "../lib/auth";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/usePageSetup";
import AuthLayout from "../layouts/AuthLayout";
import { Banner, Captcha, FieldError, PasswordInput, StrengthMeter, useCaptcha } from "../components/FormControls";

const MOCK = (
  <>
    <div className="auth-mock-card auth-mock-hero">
      <p className="mock-label">Task Progress</p>
      <div className="auth-mock-bar b1"><span></span></div>
      <div className="auth-mock-bar b2"><span></span></div>
    </div>
    <div className="auth-mock-card">
      <div className="auth-mock-list">
        <div className="auth-mock-list-item"><span className="auth-mock-dot lime"></span>Everything stays exactly as you left it</div>
        <div className="auth-mock-list-item"><span className="auth-mock-dot purple"></span>Your tasks and progress are safe</div>
      </div>
    </div>
  </>
);

function VerifyEmailStep({ onVerified }) {
  const captcha = useCaptcha();
  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const next = {};

    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    const captchaOk = captcha.check(captchaValue);
    setCaptchaValue("");
    if (!captchaOk) next.captcha = "That code didn't match. Try the new one below.";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!CadenceDB.emailExists(email)) {
      setBanner({ type: "error", message: "No account found with that email address." });
      return;
    }
    onVerified(email.trim().toLowerCase());
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <h1>Reset your password</h1>
        <p>Enter the email on your account and we'll verify it's you.</p>
      </div>

      <Banner banner={banner} />

      <div className="auth-field">
        <label htmlFor="forgotEmail">Email</label>
        <input type="email" id="forgotEmail" className="auth-input" placeholder="you@school.edu" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <FieldError message={errors.email} />
      </div>

      <Captcha captcha={captcha} inputId="forgotCaptchaInput1" value={captchaValue} onChange={setCaptchaValue} error={errors.captcha} />

      <button type="submit" className="btn btn-primary auth-submit">Continue</button>
    </form>
  );
}

function NewPasswordStep({ email }) {
  const navigate = useNavigate();
  const showToast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!isValidPassword(password)) next.password = "Use at least 8 characters, including a number.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    CadenceDB.resetPassword(email, password);
    setTimeout(() => {
      showToast("Your password was reset. Please log in with your new password.", "success");
      navigate("/login");
    }, 300);
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <h1>Set a new password</h1>
        <p>Choose something you haven't used before.</p>
      </div>

      <Banner banner={{
        type: "success",
        message: `Email verified. Since Cadence has no mail server in this demo, set a new password for ${email} directly below.`
      }} />

      <div className="auth-field">
        <label htmlFor="forgotNewPassword">New password</label>
        <PasswordInput id="forgotNewPassword" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
        <StrengthMeter password={password} />
        <FieldError message={errors.password} />
      </div>

      <div className="auth-field">
        <label htmlFor="forgotConfirmPassword">Confirm new password</label>
        <PasswordInput id="forgotConfirmPassword" value={confirm} onChange={setConfirm} placeholder="Re-enter your new password" autoComplete="new-password" />
        <FieldError message={errors.confirm} />
      </div>

      <button type="submit" className="btn btn-primary auth-submit">Reset password</button>
    </form>
  );
}

export default function ForgotPassword() {
  useDocumentTitle("Reset your password — Cadence");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  return (
    <AuthLayout
      back={{ to: "/login", label: "Back to log in" }}
      heading={<>Locked out<br />happens to everyone.</>}
      text="Verify your email and you'll be back to your task board in under a minute — no new account needed."
      mock={MOCK}
      quote={{ strong: "\"Reset my password in like 30 seconds.\"" }}
    >
      {verifiedEmail
        ? <NewPasswordStep email={verifiedEmail} />
        : <VerifyEmailStep onVerified={setVerifiedEmail} />}
    </AuthLayout>
  );
}
