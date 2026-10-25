/* LANDING PAGE (home.html) */

import { Link } from "react-router-dom";
import { Bell, CalendarClock, BarChart3, Flame, ListChecks, Users } from "lucide-react";
import { useDocumentTitle } from "../hooks/usePageSetup";

const FEATURES = [
  { Icon: ListChecks, title: "Task Progress", accent: true, text: "Track every assignment from \"not started\" to \"done,\" with visual progress rings that update as you check off subtasks." },
  { Icon: CalendarClock, title: "Deadline Calendar", text: "A month view built for students — every due date, quiz and submission marked exactly where it falls." },
  { Icon: Flame, title: "High Priority Tasks", text: "Surface what actually needs your attention today, ranked by deadline and weight, not just the order you typed it in." },
  { Icon: BarChart3, title: "Productivity Analytics", text: "See your completion trend week over week, and spot the days you tend to fall behind before it becomes a pattern." },
  { Icon: Users, title: "Shared Tasks", text: "Split group project work with classmates and see who owns what, without another spreadsheet." },
  { Icon: Bell, title: "Due Today", text: "A single, honest number each morning — exactly what's due today, so you always know where to start." }
];

const STEPS = [
  { num: "01", title: "Add your tasks", text: "Drop in assignments, readings and projects as they're assigned — set a subject, priority and due date in seconds." },
  { num: "02", title: "Let Cadence sort it", text: "Everything lands on your dashboard already organized by what's due today, this week, and what can wait." },
  { num: "03", title: "Track your momentum", text: "Check things off, watch your completion rate climb, and walk into finals week without a single surprise." }
];

export default function Home() {
  useDocumentTitle("Cadence — Every deadline, one clear view");

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot"></span>Built for students juggling everything</p>
            <h1 className="hero-title">Every deadline,<br />one clear view.</h1>
            <p className="hero-sub">
              Cadence turns your scattered assignments, projects and quizzes into a single calm
              dashboard — so nothing slips through the cracks between classes.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get started free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link to="/home#how-it-works" className="btn btn-outline btn-lg">See how it works</Link>
            </div>
            <p className="hero-note">No install needed. Free for every student, always.</p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="preview-card preview-hero">
              <div className="preview-hero-head">
                <span>Your Tasks</span>
                <span className="preview-pill">Continue</span>
              </div>
              <div className="preview-hero-body">
                <div className="preview-icon">📐</div>
                <div>
                  <p className="preview-hero-title">Linear Algebra Problem Set</p>
                  <p className="preview-hero-sub">Due tomorrow · 4 of 6 done</p>
                </div>
              </div>
              <div className="preview-hero-stats">
                <span>7 subtasks</span>
                <span>2 files</span>
                <span>3h left</span>
              </div>
            </div>

            <div className="preview-card preview-ring">
              <p className="preview-ring-label">Task Progress</p>
              <div className="ring-row">
                <div className="ring" style={{ "--val": 80, "--c": "#ff8a4c" }}>80%</div>
                <div className="ring-text">
                  <p>Essay draft</p>
                  <span>Due Fri</span>
                </div>
              </div>
              <div className="ring-row">
                <div className="ring" style={{ "--val": 34, "--c": "#8b7dff" }}>34%</div>
                <div className="ring-text">
                  <p>Lab report</p>
                  <span>Due Mon</span>
                </div>
              </div>
            </div>

            <div className="preview-card preview-cal">
              <div className="preview-cal-head">
                <span>March</span>
              </div>
              <div className="preview-cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={"h" + i} className="muted">{d}</span>)}
                <span></span><span></span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span className="dot-today">8</span><span>9</span><span className="dot-task">10</span><span>11</span><span>12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS STRIP ============ */}
      <section className="stats-strip">
        <div className="stats-inner">
          <div className="stat">
            <p className="stat-num">48,200+</p>
            <p className="stat-label">Tasks organized this term</p>
          </div>
          <div className="stat">
            <p className="stat-num">96%</p>
            <p className="stat-label">Deadlines met on time</p>
          </div>
          <div className="stat">
            <p className="stat-num">3.2 hrs</p>
            <p className="stat-label">Average time saved weekly</p>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="features" id="features">
        <div className="section-head">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Everything in one place</p>
          <h2>Built around how coursework actually works</h2>
          <p className="section-sub">Six views that mirror the way assignments actually pile up — not another generic to-do list.</p>
        </div>

        <div className="feature-grid">
          {FEATURES.map(({ Icon, title, text, accent }) => (
            <article key={title} className={`feature-card${accent ? " feature-accent-lime" : ""}`}>
              <Icon className="feature-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-head">
          <p className="eyebrow"><span className="eyebrow-dot"></span>Three steps, every week</p>
          <h2>From syllabus chaos to a clear week</h2>
        </div>

        <div className="steps">
          {STEPS.map(step => (
            <div className="step" key={step.num}>
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to get ahead of your deadlines?</h2>
          <p>Join Cadence and turn your semester into something you can actually see.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create your free account</Link>
        </div>
      </section>
    </>
  );
}
