/* Add / Edit / Delete task modal. One component replaces the three
   copies of this markup (dashboard.html, my-tasks.html, and the one
   main.js injected for global search) and their three submit handlers. */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import CadenceDB from "../lib/storage";
import { addTask, deleteTask, updateTask } from "../store/tasksSlice";
import { useToast } from "../context/ToastContext";

function initialForm(task) {
  const today = CadenceDB.todayKey();
  let status = task ? task.status : "pending";
  if (task && task.dueDate && task.dueDate < today && task.status !== "completed") {
    status = "overdue";
  }
  return {
    title: task ? task.title : "",
    subject: task ? task.subject || "" : "",
    dueDate: task ? task.dueDate || "" : "",
    priority: task ? task.priority || "medium" : "medium",
    status,
    description: task ? task.description || "" : ""
  };
}

/**
 * @param modal   { task, source } — task is null when adding; source is
 *                "search" when opened from the topbar search results
 *                (it kept main.js's slightly different toast/confirm text)
 */
export default function TaskModal({ modal, onClose }) {
  const showToast = useToast();
  const dispatch = useDispatch();
  const { task, source } = modal;
  const isEdit = Boolean(task);
  const fromSearch = source === "search";

  const [form, setForm] = useState(() => initialForm(task));
  const [titleError, setTitleError] = useState("");
  const titleRef = useRef(null);
  const backdropRef = useRef(null);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setTitleError("Give this task a title.");
      return;
    }

    let statusVal = form.status;
    if (statusVal === "overdue") statusVal = "in-progress";

    const payload = {
      title,
      subject: form.subject.trim() || "General",
      dueDate: form.dueDate || null,
      priority: form.priority,
      status: statusVal,
      description: form.description.trim(),
      progress: statusVal === "completed" ? 100
        : statusVal === "pending" ? 0
        : undefined
    };
    if (payload.progress === undefined) delete payload.progress;

    if (isEdit) {
      dispatch(updateTask(task.id, payload));
      showToast(fromSearch ? "Task saved successfully!" : "Task updated.");
    } else {
      dispatch(addTask(payload));
      showToast(fromSearch ? "Task saved successfully!" : "Task added.");
    }

    onClose();
  }

  function handleDelete() {
    const ok = window.confirm(fromSearch ? "Delete this task?" : "Delete this task? This can't be undone.");
    if (ok) {
      dispatch(deleteTask(task.id));
      showToast("Task deleted.");
    }
    if (ok || !fromSearch) onClose();
  }

  return (
    <div
      className="modal-backdrop"
      id="taskModalBackdrop"
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="taskModalTitle">
        <div className="modal-head">
          <h3 id="taskModalTitle">{isEdit ? "Edit Task" : "Add Task"}</h3>
          <button
            className="icon-btn-ghost"
            style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }}
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label htmlFor="taskTitle">Title</label>
            <input type="text" id="taskTitle" ref={titleRef} className="auth-input" placeholder="e.g. Chemistry lab report" required value={form.title} onChange={set("title")} />
            <span className="auth-field-error">{titleError}</span>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="taskSubject">Subject</label>
              <input type="text" id="taskSubject" className="auth-input" placeholder="e.g. Chemistry" value={form.subject} onChange={set("subject")} />
            </div>
            <div className="modal-field">
              <label htmlFor="taskDueDate">Due date</label>
              <input type="date" id="taskDueDate" className="auth-input" value={form.dueDate} onChange={set("dueDate")} />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="taskPriority">Priority</label>
              <select id="taskPriority" className="auth-input" value={form.priority} onChange={set("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-field">
              <label htmlFor="taskStatus">Status</label>
              <select id="taskStatus" className="auth-input" value={form.status} onChange={set("status")}>
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-field">
            <label htmlFor="taskDescription">Notes (optional)</label>
            <textarea id="taskDescription" className="auth-input" rows="3" placeholder="Any extra detail…" value={form.description} onChange={set("description")}></textarea>
          </div>

          <div className="modal-actions">
            {isEdit && <button type="button" className="btn btn-outline" onClick={handleDelete}>Delete task</button>}
            <button type="submit" className="btn btn-primary">{isEdit ? "Save changes" : "Add task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
