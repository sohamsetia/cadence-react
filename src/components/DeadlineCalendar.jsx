/* Month grid used by the dashboard widget and the Schedule page
   (was js/calendar.js). Marks today and any date with a
   non-completed task due; clicking a date calls onDayClick(date)
   instead of dispatching "cadence:calendarDayClick". */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CadenceDB from "../lib/storage";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildCells(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  const cells = [];

  // leading muted days from the previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthTotalDays - i, muted: true, dateStr: null });
  }
  // real days of this month
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, muted: false, dateStr });
  }
  // trailing muted days to complete the final week
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: trailing++, muted: true, dateStr: null });
  }
  return cells;
}

/** Renders the nav + grid; the surrounding widget markup is left to the page. */
export default function DeadlineCalendar({ tasks, onDayClick, navStyle }) {
  const [view, setView] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() }; // month is 0-indexed
  });

  const deadlineSet = new Set();
  tasks.forEach(t => { if (t.dueDate && t.status !== "completed") deadlineSet.add(t.dueDate); });
  const todayStr = CadenceDB.todayKey();

  const label = new Date(view.year, view.month, 1).toLocaleString("default", { month: "long", year: "numeric" });

  function goToPrevMonth() {
    setView(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }));
  }
  function goToNextMonth() {
    setView(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }));
  }

  return (
    <>
      <div className="cal-nav" style={navStyle}>
        <button className="cal-nav-btn" aria-label="Previous month" onClick={goToPrevMonth}><ChevronLeft /></button>
        <span className="cal-month-label">{label}</span>
        <button className="cal-nav-btn" aria-label="Next month" onClick={goToNextMonth}><ChevronRight /></button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map(day => <span key={day} className="cal-weekday">{day}</span>)}
        {buildCells(view.year, view.month).map((cell, i) => {
          if (cell.muted) return <span key={i} className="cal-day is-muted">{cell.day}</span>;
          const cls = ["cal-day"];
          if (cell.dateStr === todayStr) cls.push("is-today");
          if (deadlineSet.has(cell.dateStr)) cls.push("has-deadline");
          return (
            <span
              key={i}
              className={cls.join(" ")}
              data-date={cell.dateStr}
              style={{ cursor: "pointer" }}
              onClick={() => onDayClick && onDayClick(cell.dateStr)}
            >
              {cell.day}
            </span>
          );
        })}
      </div>
    </>
  );
}
