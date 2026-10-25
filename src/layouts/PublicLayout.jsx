/* Navbar + footer shared by Home, About, Contact, Privacy and Terms. */

import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";

function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const activeClass = ({ isActive }) => (isActive ? "is-active" : undefined);

  return (
    <header className="site-header" id="siteHeader">
      <nav className="navbar" aria-label="Primary">
        <Brand />

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="navMenu"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span><span></span>
        </button>

        <div className={`nav-menu${open ? " open" : ""}`} id="navMenu">
          <ul className="nav-links">
            <li><Link to="/home#features" onClick={close}>Features</Link></li>
            <li><Link to="/home#how-it-works" onClick={close}>How it works</Link></li>
            <li><NavLink to="/about" className={activeClass} onClick={close}>About</NavLink></li>
            <li><NavLink to="/contact" className={activeClass} onClick={close}>Contact</NavLink></li>
          </ul>
          <div className="nav-actions">
            <ThemeToggle />
            <Link to="/login" className="btn btn-ghost" onClick={close}>Log in</Link>
            <Link to="/register" className="btn btn-primary" onClick={close}>Get started</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Brand size={18} />
          <p>A calmer way to manage coursework.</p>
        </div>

        <nav className="footer-col" aria-label="Company">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Legal">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions">Terms &amp; Conditions</Link></li>
          </ul>
        </nav>

        <div className="footer-col">
          <h4>Follow</h4>
          <div className="social-links">
            <a href="#" aria-label="Cadence on Twitter / X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 3h3l-7.5 8.6L22 21h-6.6l-5.2-6.4L4 21H1l8-9.2L2 3h6.8l4.7 5.8L18 3z" fill="currentColor" /></svg>
            </a>
            <a href="#" aria-label="Cadence on Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg>
            </a>
            <a href="#" aria-label="Cadence on LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M7.5 10v7M7.5 7.2v.1M11 17v-4.2c0-1.5 1-2.5 2.3-2.5S15.5 11.3 15.5 12.8V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Cadence. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
