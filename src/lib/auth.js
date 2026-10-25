/* =========================================================
   CADENCE — AUTH HELPERS (src/lib/auth.js)
   The pure, DOM-free parts of the original js/auth.js:
   validation rules, password strength and CAPTCHA generation.
   The form wiring itself now lives in the Login / Register /
   ForgotPassword components. The sessionStorage "flash" toast is
   no longer needed: the toast container survives route changes.
   ========================================================= */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAPTCHA_CHARS = "ABCDEFGHJKMNPQRSTUVWXY346789"; // no 0/O/1/I/l — avoids ambiguity

export function generateCaptcha(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email).trim());
}

/**
 * Password rule: at least 8 characters and at least one number.
 * Kept simple and clearly communicated to the user, rather than
 * an opaque complex regex.
 */
export function isValidPassword(password) {
  return password.length >= 8 && /\d/.test(password);
}

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  const capped = Math.min(score, 3);
  const labels = ["Too weak", "Weak", "Good", "Strong"];
  return { score: capped, label: password ? labels[capped] : "" };
}
