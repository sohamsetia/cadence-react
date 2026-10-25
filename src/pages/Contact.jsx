/* CONTACT US (contact.html + js/contact.js): client-side validation
   and a success state. There's no server, so submissions are kept in
   localStorage and the success message says so honestly. */

import { useState } from "react";
import { Clock, LifeBuoy, Mail } from "lucide-react";
import { isValidEmail } from "../lib/auth";
import { useDocumentTitle } from "../hooks/usePageSetup";
import { Banner, FieldError } from "../components/FormControls";

const EMPTY = { name: "", email: "", subject: "", message: "" };

function saveSubmissionLocally(entry) {
  try {
    const key = "cadence_contact_messages";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...entry, submittedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.error("Cadence: could not save contact submission", err);
  }
}

export default function Contact() {
  useDocumentTitle("Contact Us — Cadence");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    const next = {};

    if (name.length < 2) next.name = "Enter your full name.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!form.subject) next.subject = "Choose a topic.";
    if (message.length < 10) next.message = "Give us a few more details (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    saveSubmissionLocally({ name, email, subject: form.subject, message });
    setBanner({
      type: "success",
      message: `Thanks, ${name.split(" ")[0]} — your message has been submitted. Since this is a front-end-only project, it's saved locally rather than emailed anywhere, but the form itself is fully functional.`
    });
    setForm(EMPTY);
  }

  return (
    <>
      {/* ============ PAGE HERO ============ */}
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Get in touch</p>
          <h1>We'd like to hear from you</h1>
          <p>Question, bug report, or just feedback on the dashboard — send it over and we'll get back to you.</p>
        </div>
      </section>

      {/* ============ CONTACT GRID ============ */}
      <section className="contact-section">
        <div className="contact-grid">

          {/* Info column */}
          <div>
            <div className="contact-info-card">
              <div className="contact-info-icon"><Mail /></div>
              <h3>Email us</h3>
              <p>For general questions or support: <a href="mailto:hello@cadence.app">hello@cadence.app</a></p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon"><Clock /></div>
              <h3>Response time</h3>
              <p>We typically reply within 1–2 business days. This is a student project, so weekends may be quieter.</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon"><LifeBuoy /></div>
              <h3>Already a user?</h3>
              <p>For account issues, use the Support link in your dashboard sidebar — it'll get you here faster with your context attached.</p>
            </div>
          </div>

          {/* Form column */}
          <div className="contact-form-card">
            <h2>Send a message</h2>
            <p>Fields marked with an asterisk are required.</p>

            <Banner banner={banner} />

            <form noValidate onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="auth-field">
                  <label htmlFor="contactName">Full name *</label>
                  <input type="text" id="contactName" className="auth-input" placeholder="Jordan Avery" autoComplete="name" required value={form.name} onChange={set("name")} />
                  <FieldError message={errors.name} />
                </div>
                <div className="auth-field">
                  <label htmlFor="contactEmail">Email *</label>
                  <input type="email" id="contactEmail" className="auth-input" placeholder="you@school.edu" autoComplete="email" required value={form.email} onChange={set("email")} />
                  <FieldError message={errors.email} />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="contactSubject">Subject *</label>
                <select id="contactSubject" className="auth-input" required value={form.subject} onChange={set("subject")}>
                  <option value="" disabled>Choose a topic</option>
                  <option value="Bug report">Bug report</option>
                  <option value="Feature request">Feature request</option>
                  <option value="Account help">Account help</option>
                  <option value="Feedback">General feedback</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError message={errors.subject} />
              </div>

              <div className="auth-field">
                <label htmlFor="contactMessage">Message *</label>
                <textarea id="contactMessage" className="auth-input" rows="5" placeholder="What's going on?" required value={form.message} onChange={set("message")}></textarea>
                <FieldError message={errors.message} />
              </div>

              <button type="submit" className="btn btn-primary auth-submit" style={{ width: "auto" }}>Send message</button>
            </form>
          </div>

        </div>
      </section>
    </>
  );
}
