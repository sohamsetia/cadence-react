/* =========================================================
   DASHBOARD (dashboard.html + js/dashboard.js + js/tasks.js)
   Hero task, Due Today, stat chip, Task Progress, Pomodoro,
   productivity chart, High Priority Tasks, Recent Activity
   and the deadline calendar.
   ========================================================= */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpRight, CalendarCheck2, ChevronLeft, ChevronRight, Clock, Flag,
  ListChecks, MoreHorizontal, Pencil, Plus, Trash2
} from "lucide-react";
import CadenceDB from "../lib/storage";
import { capitalize, formatDue, formatDueLabel, iconFor, isOverdue } from "../lib/tasks";
import { deleteTask, selectTasks, selectTaskStats, toggleTaskComplete } from "../store/tasksSlice";
import { useApp } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/usePageSetup";
import DeadlineCalendar from "../components/DeadlineCalendar";
import Pomodoro from "../components/Pomodoro";
import ProductivityChart, { ChartRangeToggle } from "../components/ProductivityChart";

const PAGE_SIZE = 4;
const THUMB_TINTS = [
  "rgba(216, 243, 78, 0.18)",
  "rgba(255, 122, 69, 0.18)",
  "rgba(124, 111, 250, 0.18)",
  "rgba(91, 141, 253, 0.18)"
];
const GHOST_BTN_STYLE = { background: "var(--surface-alt)", color: "var(--text-secondary)" };

function EmptyState({ children }) {
  return <p className="empty-state" style={{ gridColumn: "1 / -1" }}>{children}</p>;
}

/* ---------------- hero task card ---------------- */

function pickHeroTask(tasks) {
  const withDue = tasks
    .filter(t => t.status !== "completed" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return withDue[0] || tasks.find(t => t.status !== "completed") || null;
}

function HeroTask({ tasks }) {
  const task = pickHeroTask(tasks);
  return (
    <div className="area-hero widget widget-hero" id="heroTaskWidget">
      <div className="widget-head">
        <h3>Your Tasks</h3>
        <div className="widget-controls">
          <span className="preview-pill">Continue</span>
          <button className="icon-btn-ghost" aria-label="More options"><MoreHorizontal /></button>
        </div>
      </div>
      <div className="hero-task-card">
        <div className="hero-task-icon">{task ? iconFor(task.subject) : "🎉"}</div>
        <div>
          <p className="hero-task-title">{task ? task.title : "All caught up!"}</p>
          <p className="hero-task-meta">{task ? `${formatDueLabel(task.dueDate)} · ${task.subject}` : "No active tasks right now."}</p>
        </div>
      </div>
      <div className="hero-task-stats">
        {task && (
          <>
            <span><ListChecks width={14} height={14} /> {task.progress}% done</span>
            <span><Flag width={14} height={14} /> {capitalize(task.priority)} priority</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Due Today + stat chip ---------------- */

function DueToday({ stats }) {
  const n = stats.dueToday;
  return (
    <div className="area-due widget widget-due">
      <div className="widget-head">
        <h3>Due Today</h3>
        <button className="icon-btn-ghost" style={GHOST_BTN_STYLE} aria-label="Expand">
          <ArrowUpRight />
        </button>
      </div>
      <div className="widget-due-body">
        <p>You have {n === 0 ? "no" : n} task{n === 1 ? "" : "s"} due today</p>
        <p>Stay ahead by tackling your high-priority tasks first — Cadence has already sorted them for you.</p>
        <div className="widget-due-tags">
          <span className="tag-pill">{n} task{n === 1 ? "" : "s"}</span>
          <span><Clock width={14} height={14} /> Today</span>
        </div>
      </div>
      <Link to="/my-tasks" className="btn btn-accent-orange" style={{ width: "100%", justifyContent: "center" }}>View Tasks</Link>
    </div>
  );
}

function StatChip({ stats }) {
  return (
    <div className="area-chip widget widget-chip">
      <div className="widget-chip-icon"><CalendarCheck2 /></div>
      <p className="widget-chip-value">{stats.completed}/{stats.total}</p>
      <p className="widget-chip-label">done today</p>
    </div>
  );
}

/* ---------------- Task Progress (paged, right column) ---------------- */

function TaskProgress({ tasks, onToggle, onDelete, onEdit, onAdd }) {
  const [page, setPage] = useState(0);
  const active = CadenceDB.sortTasks(tasks.filter(t => t.status !== "completed"), "dueDate");
  const totalPages = Math.max(1, Math.ceil(active.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const pageTasks = active.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="area-side widget widget-progress">
      <div className="widget-head">
        <div>
          <h3>Task Progress</h3>
          <p className="widget-sub">This week</p>
        </div>
        <div className="widget-controls">
          <Link to="/my-tasks" className="widget-link" style={{ marginRight: "4px" }}>View all</Link>
          <button className="icon-btn-ghost" style={GHOST_BTN_STYLE} aria-label="Previous tasks" disabled={current === 0} onClick={() => setPage(current - 1)}>
            <ChevronLeft />
          </button>
          <button className="icon-btn-ghost" style={GHOST_BTN_STYLE} aria-label="Next tasks" disabled={current >= totalPages - 1} onClick={() => setPage(current + 1)}>
            <ChevronRight />
          </button>
        </div>
      </div>
      <div>
        {pageTasks.length === 0 ? (
          <EmptyState>No active tasks — add one below to get started.</EmptyState>
        ) : pageTasks.map((task, i) => {
          const color = isOverdue(task) ? "var(--orange)" : (task.status === "in-progress" ? "var(--purple)" : "#38bdf8");
          return (
            <div className="progress-item" key={task.id} onClick={() => onEdit(task)}>
              <div className="progress-thumb" style={{ background: THUMB_TINTS[i % THUMB_TINTS.length] }}>{iconFor(task.subject)}</div>
              <div className="progress-info">
                <p>{task.title}</p>
                <a href="#" onClick={e => e.preventDefault()}>{formatDue(task.dueDate, task.status)}</a>
              </div>
              <div
                className="ring"
                data-clickable=""
                style={{ "--val": task.progress, "--c": color }}
                onClick={e => { e.stopPropagation(); onToggle(task.id); }}
              >
                {task.progress}%
              </div>
              <div className="progress-item-actions">
                <button type="button" aria-label="Edit task" onClick={e => { e.stopPropagation(); onEdit(task); }}><Pencil width={13} height={13} /></button>
                <button type="button" className="delete-btn" aria-label="Delete task" onClick={e => { e.stopPropagation(); onDelete(task.id); }}><Trash2 width={13} height={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn widget-add-btn" onClick={onAdd}>
        <Plus /> Add new task
      </button>
    </div>
  );
}

/* ---------------- High Priority Tasks ---------------- */

function PriorityTasks({ tasks, search, dateFilter, onOpen }) {
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("dueDate");

  let list = CadenceDB.filterTasks(tasks, { status, search });
  if (dateFilter) list = list.filter(t => t.dueDate === dateFilter);
  list = CadenceDB.sortTasks(list, sort).slice(0, 9);

  return (
    <div className="area-priority widget" id="tasks">
      <div className="widget-head">
        <h3>High Priority Tasks</h3>
        <div className="widget-controls">
          <Link to="/my-tasks" className="widget-link" style={{ marginRight: "4px" }}>View all</Link>
          <select className="widget-select" aria-label="Filter tasks" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="widget-select" aria-label="Sort tasks" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>
      </div>
      <div className="priority-list">
        {list.length === 0 ? (
          <EmptyState>No tasks match your search or filters.</EmptyState>
        ) : list.map(task => {
          const accent = isOverdue(task) ? " is-overdue-card" : (task.priority === "high" ? " is-accent" : "");
          return (
            <article className={"priority-card" + accent} key={task.id} onClick={() => onOpen(task)}>
              <div className="priority-card-icon">{iconFor(task.subject)}</div>
              <h4>{task.title}</h4>
              <p className="priority-card-meta">{task.subject}</p>
              <div className="priority-card-stats">
                <div><span>Due</span><strong>{formatDue(task.dueDate, task.status)}</strong></div>
                <div><span>Priority</span><strong>{capitalize(task.priority)}</strong></div>
                <div><span>Progress</span><strong>{task.progress}%</strong></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Recent Activity ---------------- */

function ActivityBar({ label, pct, color }) {
  return (
    <div className="activity-bar-row">
      <div className="activity-bar-head"><span>{label}</span><span>{pct}%</span></div>
      <div className="activity-bar-track">
        <div className={`activity-bar-fill ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function RecentActivity({ tasks, stats }) {
  const total = stats.total || 1;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  return (
    <div className="area-activity widget">
      <div className="widget-head">
        <h3>Recent Activity</h3>
      </div>
      <div className="widget-activity-illustration" aria-hidden="true"></div>
      <ActivityBar label="Tasks Completed" pct={Math.round((stats.completed / total) * 100)} color="c-lime" />
      <ActivityBar label="In Progress" pct={Math.round((inProgressCount / total) * 100)} color="c-purple" />
      <ActivityBar label="Overdue" pct={Math.round((overdueCount / total) * 100)} color="c-orange" />
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Dashboard() {
  useDocumentTitle("Dashboard — Cadence");
  const { search, openTaskModal } = useApp();
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const stats = useSelector(selectTaskStats);
  const showToast = useToast();
  const [chartRange, setChartRange] = useState("daily");
  const [dateFilter, setDateFilter] = useState(null);

  function toggleComplete(taskId) {
    const updated = dispatch(toggleTaskComplete(taskId));
    if (updated) {
      showToast(updated.status === "completed" ? "Task marked complete." : "Task reopened.");
    }
  }

  function confirmDelete(taskId) {
    if (!window.confirm("Delete this task? This can't be undone.")) return;
    dispatch(deleteTask(taskId));
    showToast("Task deleted.");
  }

  function handleDayClick(date) {
    setDateFilter(f => (f === date ? null : date));
    const section = document.getElementById("tasks");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid">
        <HeroTask tasks={tasks} />
        <DueToday stats={stats} />
        <StatChip stats={stats} />
        <TaskProgress
          tasks={tasks}
          onToggle={toggleComplete}
          onDelete={confirmDelete}
          onEdit={task => openTaskModal(task)}
          onAdd={() => openTaskModal()}
        />
        <Pomodoro />

        {/* Productivity Analytics */}
        <div className="area-analytics widget widget-chart" id="analytics">
          <div className="widget-head">
            <h3>Productivity Analytics</h3>
            <div className="widget-controls">
              <Link to="/analytics" className="widget-link">Full view</Link>
              <ChartRangeToggle range={chartRange} onChange={setChartRange} />
            </div>
          </div>
          <div className="chart-canvas-wrap">
            <ProductivityChart tasks={tasks} range={chartRange} />
          </div>
        </div>

        <PriorityTasks tasks={tasks} search={search} dateFilter={dateFilter} onOpen={task => openTaskModal(task)} />
        <RecentActivity tasks={tasks} stats={stats} />

        {/* Deadline Calendar */}
        <div className="area-cal widget widget-calendar" id="calendar">
          <div className="widget-head" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              Deadlines</h3>
            <Link to="/schedule" className="widget-link">Full schedule</Link>
          </div>
          <DeadlineCalendar tasks={tasks} onDayClick={handleDayClick} navStyle={{ marginTop: "14px" }} />
          <div className="cal-legend">
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: "var(--orange)" }}></span> Today
            </div>
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: "var(--lime)" }}></span> Task due
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
