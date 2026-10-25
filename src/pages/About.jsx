/* ABOUT US (about.html) */

import { Link } from "react-router-dom";
import { Feather, Lock, Target } from "lucide-react";
import { useDocumentTitle } from "../hooks/usePageSetup";

const VALUES = [
  { Icon: Target, title: "Built for real deadlines", text: "Every screen answers one question first: what's actually due soon. Everything else is secondary." },
  { Icon: Feather, title: "No busywork", text: "No streaks to maintain, no gamification, no notifications begging you to log back in. Just your tasks." },
  { Icon: Lock, title: "Your data stays yours", text: "Cadence runs entirely in your browser's local storage — nothing is uploaded to a server we control." }
];

export default function About() {
  useDocumentTitle("About Us — Cadence");

  return (
    <>
      {/* ============ PAGE HERO ============ */}
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Why we built this</p>
          <h1>A calmer way to get through the semester</h1>
          <p>Cadence started from a simple complaint: coursework doesn't live in one place, so nothing ever feels finished. Here's what we're trying to fix, and how.</p>
        </div>
      </section>

      {/* ============ STORY ============ */}
      <section className="about-story">
        <p>Most students don't miss deadlines because they don't care — they miss them because the deadline was buried in a syllabus PDF, a group chat, or an email from three weeks ago. Every class hands you a different system, and by week six you're keeping track of six different systems at once.</p>
        <p>Cadence doesn't try to replace your school's tools. It just gives every assignment, reading, quiz and project one place to live, with the same three questions answered at a glance: what's due, how far along is it, and what actually needs attention today.</p>
        <p>It's built with plain HTML, CSS and JavaScript, and everything is stored right in your browser — there's no account database in the cloud, no ads, and nothing to configure. You open it, add what's on your plate, and it stays out of your way until you need it.</p>
      </section>

      {/* ============ VALUES ============ */}
      <section className="features" id="values">
        <div className="section-head">
          <p className="eyebrow"><span className="eyebrow-dot"></span>What we care about</p>
          <h2>A few principles we don't compromise on</h2>
        </div>

        <div className="feature-grid">
          {VALUES.map(({ Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <Icon className="feature-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to see your semester clearly?</h2>
          <p>It takes less than a minute to add your first few tasks.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create your free account</Link>
        </div>
      </section>
    </>
  );
}
