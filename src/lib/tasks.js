/* =========================================================
   CADENCE — SHARED TASK HELPERS (src/lib/tasks.js)
   Helpers that were copy-pasted across main.js, tasks.js,
   dashboard.js, my-tasks.js, schedule.js and analytics.js.
   Where pages used slightly different wording (e.g. "Due today"
   vs "Today"), each variant is kept so the UI text is unchanged.
   ========================================================= */

import CadenceDB from "./storage";

export const SUBJECT_ICONS = {
  "Mathematics": "📐",
  "English Literature": "📖",
  "Chemistry": "🧪",
  "History": "📜",
  "Computer Science": "💻",
  "Biology": "🧬",
  "Personal": "🗂️",
  "General": "📘"
};

export function iconFor(subject) { return SUBJECT_ICONS[subject] || "📘"; }
export function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function tomorrowKey() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return CadenceDB.todayKey(tomorrow);
}

function shortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isOverdue(task, today = CadenceDB.todayKey()) {
  return Boolean(task.dueDate && task.dueDate < today && task.status !== "completed");
}

/** Dashboard widgets (js/tasks.js): "Completed" / "Due today" / "Overdue" / "Due tomorrow" / "Due Mar 4". */
export function formatDue(dateStr, status) {
  if (status === "completed") return "Completed";
  return formatDueLabel(dateStr);
}

/** Dashboard hero card (js/dashboard.js) — same as formatDue but ignores status. */
export function formatDueLabel(dateStr) {
  if (!dateStr) return "No due date";
  const today = CadenceDB.todayKey();
  if (dateStr === today) return "Due today";
  if (dateStr < today) return "Overdue";
  if (dateStr === tomorrowKey()) return "Due tomorrow";
  return "Due " + shortDate(dateStr);
}

/** My Tasks table (js/my-tasks.js): "Today" / "Tomorrow" / "Mar 4". */
export function formatDueShort(dateStr, status) {
  if (!dateStr) return "No due date";
  const today = CadenceDB.todayKey();
  if (status !== "completed" && dateStr < today) return "Overdue";
  if (dateStr === today) return "Today";
  if (dateStr === tomorrowKey()) return "Tomorrow";
  return shortDate(dateStr);
}

/** Schedule list (js/schedule.js) — overdue check comes first. */
export function scheduleDueLabel(dateStr) {
  const today = CadenceDB.todayKey();
  if (dateStr < today) return "Overdue";
  if (dateStr === today) return "Due today";
  if (dateStr === tomorrowKey()) return "Due tomorrow";
  return "Due " + shortDate(dateStr);
}

export function statusBadge(task) {
  const today = CadenceDB.todayKey();
  if (task.status === "completed") return { text: "Completed", cls: "s-completed" };
  if (task.dueDate && task.dueDate < today) return { text: "Overdue", cls: "s-overdue" };
  if (task.status === "in-progress") return { text: "In progress", cls: "s-in-progress" };
  return { text: "Pending", cls: "s-pending" };
}

/* ---------------- productivity chart series (dashboard + analytics) ---------------- */

export function buildDailySeries(tasks) {
  const labels = [], data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = CadenceDB.todayKey(d);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    data.push(tasks.filter(t => t.completedAt && t.completedAt.slice(0, 10) === key).length);
  }
  return { labels, data };
}

export function buildWeeklySeries(tasks) {
  const labels = [], data = [];
  for (let w = 7; w >= 0; w--) {
    const end = new Date();
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    labels.push(`Wk ${8 - w}`);
    data.push(tasks.filter(t => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= start && d <= end;
    }).length);
  }
  return { labels, data };
}

export function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
