/* =========================================================
   Authenticated app shell: sidebar, topbar (search, theme toggle,
   avatar, logout), footer, the shared task modal, and the auth
   guard every app page had in an inline <script>.

   State split:
   - Redux store (src/store): the user's tasks and notes — shared
     data that many widgets read and several pages change. This
     replaces the original "cadence:tasksChanged" DOM event.
   - AppContext (below): UI wiring for this shell only — the
     session, the topbar search text and openTaskModal().
   ========================================================= */

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BarChart3, CalendarDays, Home, LifeBuoy, ListChecks, LogOut, Menu, NotebookPen } from "lucide-react";
import { loadTasks, selectTasks, selectTasksUserId, tasksCleared } from "../store/tasksSlice";
import { loadNotes, notesCleared } from "../store/notesSlice";
import { iconFor, statusBadge } from "../lib/tasks";
import { useAuth } from "../context/AuthContext";
import { useBodyClass } from "../hooks/usePageSetup";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import TaskModal from "../components/TaskModal";

const AppContext = createContext(null);

/** { session, search, openTaskModal } for the app pages. Tasks and notes come from Redux. */
export function useApp() {
  return useContext(AppContext);
}

/* ---------------- sidebar ---------------- */

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", Icon: Home },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/my-tasks", label: "My Tasks", Icon: ListChecks },
  { to: "/schedule", label: "Schedule", Icon: CalendarDays },
  { to: "/notes", label: "Notes", Icon: NotebookPen }
];

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? " is-open" : ""}`}>
        <div className="sidebar-header">
          <Brand to="/dashboard" />
        </div>

        <p className="sidebar-section-title">Main Tools</p>
        <nav className="sidebar-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-nav-link${isActive ? " is-active" : ""}`}
              onClick={onClose}
            >
              <Icon className="nav-icon" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-promo">
          <div className="sidebar-promo-icon">
            <LifeBuoy />
          </div>
          <h4>Support</h4>
          <p>Stuck on something? Our team can help you get back on track.</p>
          <Link to="/contact" className="sidebar-promo-btn" onClick={onClose}>Go to Support</Link>
        </div>
      </aside>
      <div
        className="sidebar-backdrop"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 55, display: open ? "block" : "none" }}
        onClick={onClose}
      />
    </>
  );
}

/* ---------------- global search (topbar) ---------------- */

function GlobalSearch({ tasks, value, onChange, onPick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const q = value.trim().toLowerCase();

  useEffect(() => {
    const onDocClick = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const matches = q
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)))
    : [];

  return (
    <div className="topbar-search" ref={wrapRef}>
      <svg className="topbar-search-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        id="globalSearchInput"
        ref={inputRef}
        placeholder="Search tasks, subjects..."
        autoComplete="off"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(Boolean(e.target.value.trim())); }}
        onFocus={e => { if (e.target.value.trim()) setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Escape") { setOpen(false); inputRef.current.blur(); }
        }}
      />
      {open && q && (
        <div className="global-search-results">
          {matches.length === 0 ? (
            <div className="global-search-empty">No tasks found matching "{value}"</div>
          ) : (
            <>
              <div className="global-search-header">Matching Tasks ({matches.length})</div>
              {matches.map(task => {
                const st = statusBadge(task);
                return (
                  <div
                    key={task.id}
                    className="search-result-item"
                    onClick={e => {
                      e.stopPropagation();
                      setOpen(false);
                      onChange("");
                      inputRef.current.blur();
                      onPick(task);
                    }}
                  >
                    <div className="search-result-left">
                      <div className="search-result-icon">{iconFor(task.subject)}</div>
                      <div className="search-result-info">
                        <div className="search-result-title">{task.title}</div>
                        <div className="search-result-sub">{task.subject} · Due {task.dueDate || "No date"}</div>
                      </div>
                    </div>
                    <div className="search-result-right">
                      <span className={`status-badge ${st.cls}`}>{st.text}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- topbar ---------------- */

function greetingFor(pathname, session) {
  switch (pathname) {
    case "/dashboard":
      return <>Welcome back, <span id="greetingName">{session.name.split(" ")[0] || "Student"}</span>!</>;
    case "/my-tasks": return "All your work, in one table";
    case "/analytics": return "How the semester's actually going";
    case "/schedule": return "Everything due, laid out on a calendar";
    case "/notes": return "Quick thoughts, kept close to your tasks";
    case "/profile": return "Account settings";
    default: return "";
  }
}

function Topbar({ session, search, onSearch, onPickTask, onToggleSidebar }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const tasks = useSelector(selectTasks);

  return (
    <div className="dashboard-topbar">
      <p className="topbar-greeting">{greetingFor(pathname, session)}</p>

      <GlobalSearch tasks={tasks} value={search} onChange={onSearch} onPick={onPickTask} />

      <div className="topbar-actions">
        <ThemeToggle />
        <button className="topbar-icon-btn" id="sidebarToggle" aria-label="Toggle menu" onClick={onToggleSidebar}>
          <Menu />
        </button>
        <Link to="/profile" className={`topbar-avatar${pathname === "/profile" ? " is-active" : ""}`} aria-label="Your profile">
          {session.avatarDataUrl
            ? <img src={session.avatarDataUrl} alt={session.name || "Profile"} />
            : <span className="topbar-avatar-fallback">{session.avatarInitials || "U"}</span>}
        </Link>
        <button className="topbar-icon-btn" aria-label="Log out" onClick={logout}>
          <LogOut />
        </button>
      </div>
    </div>
  );
}

/* ---------------- footer ---------------- */

function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <p>&copy; {new Date().getFullYear()} Cadence. All rights reserved.</p>
      <nav className="dashboard-footer-links" aria-label="Footer">
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
      </nav>
      <div className="dashboard-footer-social">
        <a href="#" aria-label="Cadence on Twitter / X">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 3h3l-7.5 8.6L22 21h-6.6l-5.2-6.4L4 21H1l8-9.2L2 3h6.8l4.7 5.8L18 3z" fill="currentColor" /></svg>
        </a>
        <a href="#" aria-label="Cadence on Instagram">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /></svg>
        </a>
      </div>
    </footer>
  );
}

/* ---------------- shell ---------------- */

function AppShell({ session }) {
  useBodyClass("dashboard-body");
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const userId = session.id;
  const loadedFor = useSelector(selectTasksUserId);

  // Load this user's tasks + notes into the store before the first paint;
  // clear them when the shell unmounts (logout).
  useLayoutEffect(() => {
    dispatch(loadTasks(userId));
    dispatch(loadNotes(userId));
    return () => {
      dispatch(tasksCleared());
      dispatch(notesCleared());
    };
  }, [dispatch, userId]);

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null); // { task, source } | null
  const modalKey = useRef(0);

  // Each original page started with an empty search box.
  useEffect(() => { setSearch(""); }, [pathname]);

  const openTaskModal = useCallback((task = null, source = "page") => {
    modalKey.current += 1;
    setModal({ task, source });
  }, []);
  const closeTaskModal = useCallback(() => setModal(null), []);

  const value = { session, search, openTaskModal };

  if (loadedFor !== userId) return null; // store not loaded yet

  return (
    <AppContext.Provider value={value}>
      <div className="dashboard-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="dashboard-main">
          <Topbar
            session={session}
            search={search}
            onSearch={setSearch}
            onPickTask={task => openTaskModal(task, "search")}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
          />
          <Outlet />
          <DashboardFooter />
        </main>
      </div>

      {modal && (
        <TaskModal
          key={modalKey.current}
          modal={modal}
          onClose={closeTaskModal}
        />
      )}
    </AppContext.Provider>
  );
}

export default function AppLayout() {
  const { session } = useAuth();
  // Guard: redirect before any widget renders (was an inline <script> on each page).
  if (!session) return <Navigate to="/login" replace />;
  return <AppShell key={session.id} session={session} />;
}
