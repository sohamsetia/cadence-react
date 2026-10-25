/* TERMS & CONDITIONS (terms-and-conditions.html) */

import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/usePageSetup";

export default function Terms() {
  useDocumentTitle("Terms & Conditions — Cadence");

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Legal</p>
          <h1>Terms &amp; Conditions</h1>
          <p>The short version: this is a student project, it's free, and you're responsible for your own data since it lives in your browser.</p>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <article className="legal-content">
        <p className="legal-updated">Last updated: July 30, 2026</p>

        <h2>1. Acceptance of terms</h2>
        <p>By using Cadence, you agree to these terms. If you don't agree with them, please don't use the application. Since Cadence runs entirely in your browser with no account verification beyond what's stored locally, using the app at all constitutes acceptance.</p>

        <h2>2. Description of service</h2>
        <p>Cadence is a front-end student task management tool built with HTML, CSS and vanilla JavaScript. It helps you track assignments, deadlines and personal tasks. It has no server, and all data is stored locally in your browser using localStorage.</p>

        <h2>3. Account registration</h2>
        <p>To use the dashboard features, you create a local account with a name, email, and password. Because there's no server-side verification, you can register with any email address — Cadence does not send confirmation emails or verify identity. You're responsible for remembering your own password; if you forget it, the "Forgot Password" flow lets you reset it directly since there's no mail server to send a reset link through.</p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to use Cadence to:</p>
        <ul>
          <li>Attempt to interfere with or disrupt the application's functionality.</li>
          <li>Use the CAPTCHA, authentication, or storage systems for any purpose other than personal task management.</li>
          <li>Misrepresent your identity in a way intended to harm others.</li>
        </ul>

        <h2>5. Your content</h2>
        <p>Any tasks, notes, or profile information you create belong to you. Cadence does not claim ownership over your task data, and since it's stored only in your browser, you retain full and exclusive control over it at all times.</p>

        <h2>6. Intellectual property</h2>
        <p>The Cadence name, design, and code structure (excluding open-source libraries it depends on, like the icon and charting libraries, which remain under their own licenses) are part of this project. Icons are provided by Lucide and charts by Chart.js, each under their respective open-source licenses.</p>

        <h2>7. No warranty</h2>
        <p>Cadence is provided "as is," as a student project, without warranties of any kind, express or implied. Because all data is stored client-side, we cannot guarantee against data loss from clearing your browser, switching devices, or browser storage limits — please don't rely on it as your only record of critical deadlines.</p>

        <h2>8. Limitation of liability</h2>
        <p>To the fullest extent permitted, Cadence and its creator are not liable for any missed deadlines, lost data, or other damages arising from use of this application. This is an educational project, not a commercial service with support guarantees.</p>

        <h2>9. Termination</h2>
        <p>You may stop using Cadence at any time and delete all your data by clearing your browser's local storage for this page. There is no account deletion request process because there is no server-side account to delete.</p>

        <h2>10. Changes to these terms</h2>
        <p>These terms may be updated as the project evolves. Continued use after a change means you accept the revised terms. The "Last updated" date above reflects the latest revision.</p>

        <h2>11. Contact</h2>
        <p>Questions about these terms? Reach out via the <Link to="/contact">Contact page</Link>.</p>
      </article>
    </>
  );
}
