/* MY TASKS (my-tasks.html + js/my-tasks.js): full task table with
   live search / filter / sort and the shared Add/Edit modal. */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import CadenceDB from "../lib/storage";
import { capitalize, formatDueShort, iconFor, statusBadge } from "../lib/tasks";
import { deleteTask, selectTasks, toggleTaskComplete } from "../store/tasksSlice";
import { useApp } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/usePageSetup";

function progressFillColor(task, today) {
  if (task.status === "completed") return "var(--lime)";
  if (task.dueDate && task.dueDate < today && task.status !== "completed") return "var(--orange)";
  if (task.status === "in-progress") return "var(--purple)";
  return "#38bdf8"; // cyan for pending
}

export default function MyTasks() {
  useDocumentTitle("My Tasks — Cadence");
  const { search, openTaskModal } = useApp();
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const showToast = useToast();
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("dueDate");

  let list = CadenceDB.filterTasks(tasks, { status, search });
  if (priority !== "all") list = list.filter(t => t.priority === priority);
  list = CadenceDB.sortTasks(list, sort);

  const total = tasks.length;
  const today = CadenceDB.todayKey();

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

  return (
    <>
      <h1 className="dashboard-title">My Tasks</h1>

      <div className="task-toolbar">
        <div className="task-toolbar-filters">
          <select className="widget-select" aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>
          <select className="widget-select" aria-label="Filter by priority" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="widget-select" aria-label="Sort tasks" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="dueDate">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
            <option value="createdAt">Sort: Newest</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => openTaskModal()}>
          <Plus /> Add task
        </button>
      </div>

      <p className="task-count">
        {list.length === total ? `${total} task${total === 1 ? "" : "s"}` : `Showing ${list.length} of ${total} tasks`}
      </p>

      <div className="widget">
        <div className="task-table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th></th>
                <th>Task</th>
                <th>Priority</th>
                <th>Due date</th>
                <th>Progress</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="7" className="empty-state">No tasks match your search or filters.</td></tr>
              ) : list.map(task => {
                const st = statusBadge(task);
                return (
                  <tr key={task.id} onClick={() => openTaskModal(task)}>
                    <td>
                      <button className={`table-check ${task.status === "completed" ? "is-done" : ""}`} aria-label="Mark complete" onClick={e => { e.stopPropagation(); toggleComplete(task.id); }}>
                        <Check width={13} height={13} />
                      </button>
                    </td>
                    <td>
                      <div className="table-task-title">{iconFor(task.subject)} {task.title}</div>
                      <div className="table-task-subject">{task.subject}</div>
                    </td>
                    <td><span className={`priority-badge p-${task.priority}`}>{capitalize(task.priority)}</span></td>
                    <td>{formatDueShort(task.dueDate, task.status)}</td>
                    <td>
                      <span className="table-progress-track"><span className="table-progress-fill" style={{ width: `${task.progress}%`, background: progressFillColor(task, today) }}></span></span>
                      {" "}
                      <span className="table-progress-label">{task.progress}%</span>
                    </td>
                    <td><span className={`status-badge ${st.cls}`}>{st.text}</span></td>
                    <td>
                      <div className="table-actions">
                        <button aria-label="Edit task" onClick={e => { e.stopPropagation(); openTaskModal(task); }}><Pencil width={13} height={13} /></button>
                        <button className="delete-btn" aria-label="Delete task" onClick={e => { e.stopPropagation(); confirmDelete(task.id); }}><Trash2 width={13} height={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
