/* SCHEDULE (schedule.html + js/schedule.js): large deadline calendar
   beside the Upcoming Deadlines list; clicking a date filters it. */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CadenceDB from "../lib/storage";
import { scheduleDueLabel } from "../lib/tasks";
import { selectTasks } from "../store/tasksSlice";
import { useDocumentTitle } from "../hooks/usePageSetup";
import DeadlineCalendar from "../components/DeadlineCalendar";

function dayOfWeek(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}
function dayOfMonth(dateStr) {
  return new Date(dateStr + "T00:00:00").getDate();
}

export default function Schedule() {
  useDocumentTitle("Schedule — Cadence");
  const tasks = useSelector(selectTasks);
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState(null);
  const today = CadenceDB.todayKey();

  let upcoming = tasks.filter(t => t.dueDate && t.status !== "completed");
  if (dateFilter) upcoming = upcoming.filter(t => t.dueDate === dateFilter);
  upcoming = CadenceDB.sortTasks(upcoming, "dueDate").slice(0, 20);

  return (
    <>
      <h1 className="dashboard-title">Schedule</h1>

      <div className="schedule-grid">

        {/* Deadline calendar (large) */}
        <div className="widget widget-calendar large">
          <DeadlineCalendar tasks={tasks} onDayClick={date => setDateFilter(f => (f === date ? null : date))} />
          <div className="cal-legend">
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: "var(--orange)" }}></span> Today</div>
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: "var(--lime)" }}></span> Task due — click a date to filter the list</div>
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="widget">
          <div className="widget-head">
            <h3>Upcoming Deadlines</h3>
            <Link to="/my-tasks" className="widget-link">Manage all</Link>
          </div>
          <div>
            {upcoming.length === 0 ? (
              <p className="empty-state">{dateFilter ? "Nothing due on that date." : "No upcoming deadlines — you're all caught up."}</p>
            ) : upcoming.map(task => (
              <div className="deadline-item" key={task.id} onClick={() => navigate("/my-tasks")}>
                <div className={`deadline-date-badge ${task.dueDate <= today ? "is-urgent" : ""}`}>
                  <span className="dow">{dayOfWeek(task.dueDate)}</span>
                  <span className="dom">{dayOfMonth(task.dueDate)}</span>
                </div>
                <div className="deadline-info">
                  <p>{task.title}</p>
                  <span>{task.subject} · {scheduleDueLabel(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
