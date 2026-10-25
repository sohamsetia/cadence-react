/* PRIVACY POLICY (privacy-policy.html) */

import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/usePageSetup";

export default function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy — Cadence");

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Legal</p>
          <h1>Privacy Policy</h1>
          <p>Plain-language summary: Cadence has no server and no database. Everything lives in your browser.</p>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <article className="legal-content">
        <p className="legal-updated">Last updated: July 30, 2026</p>

        <h2>1. Overview</h2>
        <p>Cadence is a front-end-only student project built with HTML, CSS and vanilla JavaScript. It has no backend server and no cloud database. This policy explains, honestly and specifically, what data exists, where it lives, and who can see it.</p>

        <h2>2. Information stored locally</h2>
        <p>When you use Cadence, the following information is saved using your browser's <strong>localStorage</strong> and <strong>sessionStorage</strong> — never sent to us, because there is no "us" to send it to:</p>
        <ul>
          <li>Account details you provide during registration: name, email, and a hashed version of your password.</li>
          <li>Tasks you create: titles, subjects, due dates, priority, status, and notes.</li>
          <li>A profile photo, if you choose to upload one (stored as an in-browser image, not uploaded anywhere).</li>
          <li>Your current session, so you stay logged in between visits to this browser.</li>
          <li>Contact form submissions, saved locally so the form isn't a dead end (see the Contact page for details).</li>
        </ul>

        <h2>3. Where your data lives</h2>
        <p>All of the above stays on the device and browser you used to create it. It is not synced across devices, not backed up by us, and not accessible to anyone else using a different browser or computer. Clearing your browser's site data for this page will permanently delete it.</p>

        <h2>4. Third-party services</h2>
        <p>To render fonts and icons and to draw charts, Cadence loads a small number of resources from third-party content delivery networks: Google Fonts, unpkg.com (for icons), and jsdelivr.net (for the charting library). Loading these files means your browser makes a direct request to those providers, which may log standard technical information (like your IP address) under their own privacy practices. Cadence itself does not share any of your account or task data with these services.</p>

        <h2>5. Cookies</h2>
        <p>Cadence does not use cookies. Authentication and preferences are handled entirely through localStorage and sessionStorage, which are not sent to any server on every request the way cookies are.</p>

        <h2>6. Your choices</h2>
        <p>Because everything is stored locally, you're always in control:</p>
        <ul>
          <li>You can edit or delete any task at any time from your dashboard.</li>
          <li>You can update or remove your profile photo from the Profile page.</li>
          <li>You can permanently erase all Cadence data by clearing your browser's site data or local storage for this page.</li>
        </ul>

        <h2>7. Children's privacy</h2>
        <p>Cadence is built as a general student productivity tool and is not directed at children under 13. If you believe a child has used this project to store personal information, simply clear your browser's local storage for this page to remove it.</p>

        <h2>8. Changes to this policy</h2>
        <p>As this is a student project, this policy may be updated to stay accurate as features change. The "Last updated" date at the top will reflect the most recent revision.</p>

        <h2>9. Contact</h2>
        <p>Questions about this policy? Reach out via the <Link to="/contact">Contact page</Link>.</p>
      </article>
    </>
  );
}
