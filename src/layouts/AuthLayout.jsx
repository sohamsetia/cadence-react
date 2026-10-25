/* Split-screen shell shared by Login, Register and Forgot Password:
   left illustration panel, right card, compact footer. */

import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import { useBodyClass } from "../hooks/usePageSetup";

function AuthFooter() {
  return (
    <footer className="auth-footer">
      <p>&copy; {new Date().getFullYear()} Cadence. All rights reserved.</p>
      <nav className="auth-footer-links" aria-label="Footer">
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
      </nav>
      <div className="auth-footer-social">
        <a href="#" aria-label="Cadence on Twitter / X">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 3h3l-7.5 8.6L22 21h-6.6l-5.2-6.4L4 21H1l8-9.2L2 3h6.8l4.7 5.8L18 3z" fill="currentColor" /></svg>
        </a>
        <a href="#" aria-label="Cadence on Instagram">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /></svg>
        </a>
      </div>
    </footer>
  );
}

/**
 * @param back     { to, label } for the "Back to …" link
 * @param heading  panel headline (JSX, may contain <br />)
 * @param text     panel paragraph
 * @param mock     the decorative dashboard mock for this page
 * @param quote    { strong } — the bold testimonial text
 */
export default function AuthLayout({ back, heading, text, mock, quote, children }) {
  useBodyClass("auth-body");

  return (
    <>
      <ThemeToggle floating />
      <div className="auth-shell">

        {/* ============ LEFT — illustration panel ============ */}
        <aside className="auth-panel">
          <div className="auth-panel-top">
            <Link to={back.to} className="auth-back-link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {back.label}
            </Link>
            <Brand />
          </div>

          <div className="auth-panel-copy">
            <h2>{heading}</h2>
            <p>{text}</p>
          </div>

          <div className="auth-mock" aria-hidden="true">{mock}</div>

          <p className="auth-panel-quote"><strong>{quote.strong}</strong> — a Cadence student</p>
        </aside>

        {/* ============ RIGHT — auth form ============ */}
        <section className="auth-form-side">
          <div className="auth-card">{children}</div>
        </section>

        <AuthFooter />
      </div>
    </>
  );
}
