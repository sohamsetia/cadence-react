/* =========================================================
   CADENCE — DATA LAYER (src/lib/storage.js, ported from js/storage.js)
   All localStorage access for users, the active session, and
   tasks lives here so auth.js / dashboard.js / tasks.js never
   touch localStorage directly.

   NOTE ON PASSWORDS: this is a front-end-only college project
   with no server, so there is nowhere secure to store a real
   password hash. The djb2Hash() below only prevents storing
   passwords as plain readable text in DevTools — it is NOT
   cryptographically secure and must never be used this way
   in a real production system.
   ========================================================= */

const CadenceDB = (() => {

  const KEYS = {
    USERS: "cadence_users",
    SESSION: "cadence_session",
    TASKS_PREFIX: "cadence_tasks_",
    SEEDED_PREFIX: "cadence_seeded_"
  };

  /* ---------------- low-level helpers ---------------- */

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`CadenceDB: failed to read "${key}"`, err);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`CadenceDB: failed to write "${key}"`, err);
      return false;
    }
  }

  function generateId(prefix = "id") {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // djb2 string hash — see security note above.
  function djb2Hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function todayKey(date = new Date()) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /* ---------------- users ---------------- */

  function getUsers() {
    return readJSON(KEYS.USERS, []);
  }

  function saveUsers(users) {
    return writeJSON(KEYS.USERS, users);
  }

  function findUserByEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    return getUsers().find(u => u.email.toLowerCase() === normalized) || null;
  }

  function findUserById(id) {
    return getUsers().find(u => u.id === id) || null;
  }

  function emailExists(email) {
    return findUserByEmail(email) !== null;
  }

  /**
   * Creates a new user record. Throws if the email is already registered.
   * @returns {object} the public-safe user object (no passwordHash)
   */
  function createUser({ name, email, password }) {
    if (emailExists(email)) {
      throw new Error("An account with this email already exists.");
    }
    const user = {
      id: generateId("user"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: djb2Hash(password),
      createdAt: nowISO(),
      avatarInitials: initialsFrom(name)
    };
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    return toPublicUser(user);
  }

  function verifyCredentials(email, password) {
    const user = findUserByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== djb2Hash(password)) return null;
    return toPublicUser(user);
  }

  /**
   * Used by Forgot Password: resets a user's password if the email exists.
   * Returns true if a matching account was found and updated.
   */
  function resetPassword(email, newPassword) {
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (idx === -1) return false;
    users[idx].passwordHash = djb2Hash(newPassword);
    saveUsers(users);
    return true;
  }

  function updateUserProfile(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, id: users[idx].id, passwordHash: users[idx].passwordHash };
    if (updates.name) users[idx].avatarInitials = initialsFrom(updates.name);
    saveUsers(users);
    const updated = toPublicUser(users[idx]);
    // keep session in sync if this is the active user
    const session = getSession();
    if (session && session.id === userId) setSession(updated);
    return updated;
  }

  function initialsFrom(name) {
    return String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join("") || "U";
  }

  function toPublicUser(user) {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }

  /* ---------------- session ---------------- */

  function setSession(publicUser) {
    return writeJSON(KEYS.SESSION, publicUser);
  }

  function getSession() {
    return readJSON(KEYS.SESSION, null);
  }

  function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  /**
   * Guard for pages that require auth. Redirects to login.html if
   * there's no active session, and returns the session user otherwise.
   */
  function requireAuth(redirectTo = "login.html") {
    const session = getSession();
    if (!session) {
      window.location.href = redirectTo;
      return null;
    }
    return session;
  }

  /* ---------------- tasks ---------------- */

  function tasksKey(userId) {
    return `${KEYS.TASKS_PREFIX}${userId}`;
  }

  function getTasks(userId) {
    return readJSON(tasksKey(userId), []);
  }

  function saveTasks(userId, tasks) {
    return writeJSON(tasksKey(userId), tasks);
  }

  function addTask(userId, task) {
    const tasks = getTasks(userId);
    const status = task.status || "pending";
    const isComplete = status === "completed";
    const newTask = {
      id: generateId("task"),
      title: task.title.trim(),
      subject: task.subject || "General",
      description: task.description || "",
      priority: task.priority || "medium", // low | medium | high
      dueDate: task.dueDate || null, // "YYYY-MM-DD"
      status: status, // pending | in-progress | completed
      progress: typeof task.progress === "number" ? task.progress : (isComplete ? 100 : 0),
      createdAt: nowISO(),
      completedAt: isComplete ? (task.completedAt || nowISO()) : null
    };
    tasks.push(newTask);
    saveTasks(userId, tasks);
    return newTask;
  }

  function updateTask(userId, taskId, updates) {
    const tasks = getTasks(userId);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return null;
    
    const oldTask = tasks[idx];
    const newStatus = updates.status !== undefined ? updates.status : oldTask.status;
    let completedAt = oldTask.completedAt;
    
    if (newStatus === "completed" && oldTask.status !== "completed") {
      completedAt = updates.completedAt || nowISO();
    } else if (newStatus !== "completed" && oldTask.status === "completed") {
      completedAt = null;
    } else if (updates.completedAt !== undefined) {
      completedAt = updates.completedAt;
    }

    let progress = updates.progress;
    if (progress === undefined) {
      if (newStatus === "completed") progress = 100;
      else if (newStatus === "pending" && oldTask.status === "completed") progress = 0;
      else progress = oldTask.progress;
    }

    tasks[idx] = { ...oldTask, ...updates, id: oldTask.id, status: newStatus, progress, completedAt };
    saveTasks(userId, tasks);
    return tasks[idx];
  }

  function deleteTask(userId, taskId) {
    const tasks = getTasks(userId).filter(t => t.id !== taskId);
    saveTasks(userId, tasks);
    return true;
  }

  function toggleComplete(userId, taskId) {
    const tasks = getTasks(userId);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return null;
    const isNowComplete = tasks[idx].status !== "completed";
    tasks[idx].status = isNowComplete ? "completed" : "pending";
    tasks[idx].progress = isNowComplete ? 100 : 0;
    tasks[idx].completedAt = isNowComplete ? nowISO() : null;
    saveTasks(userId, tasks);
    return tasks[idx];
  }

  /* ---------------- task queries ---------------- */

  function filterTasks(tasks, { status, priority, search } = {}) {
    const today = todayKey();
    return tasks.filter(t => {
      if (status && status !== "all") {
        if (status === "overdue") {
          if (!t.dueDate || t.dueDate >= today || t.status === "completed") return false;
        } else if (t.status !== status) {
          return false;
        }
      }
      if (priority && priority !== "all" && t.priority !== priority) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  function sortTasks(tasks, sortBy = "dueDate") {
    const copy = [...tasks];
    const priorityRank = { high: 0, medium: 1, low: 2 };
    switch (sortBy) {
      case "priority":
        return copy.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
      case "title":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "createdAt":
        return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "dueDate":
      default:
        return copy.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }
  }

  function getStats(userId) {
    const tasks = getTasks(userId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = total - completed;
    const dueToday = tasks.filter(t => t.dueDate === todayKey() && t.status !== "completed").length;
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, dueToday, completionPercentage };
  }

  /* ---------------- demo seeding ----------------
     Gives a first-time user a populated dashboard instead of an
     empty state, matching the widgets the reference layout expects.
  */
  function seedDemoTasksIfNeeded(userId) {
    const seededKey = `${KEYS.SEEDED_PREFIX}${userId}`;
    if (localStorage.getItem(seededKey)) return;
    if (getTasks(userId).length > 0) {
      localStorage.setItem(seededKey, "1");
      return;
    }

    const today = new Date();
    const inDays = n => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return todayKey(d);
    };

    const demoTasks = [
      { title: "Linear Algebra Problem Set", subject: "Mathematics", priority: "high", dueDate: inDays(1), status: "in-progress", progress: 65 },
      { title: "Essay draft: Modern Poetry", subject: "English Literature", priority: "high", dueDate: inDays(2), status: "in-progress", progress: 80 },
      { title: "Lab report: Titration analysis", subject: "Chemistry", priority: "medium", dueDate: inDays(4), status: "in-progress", progress: 34 },
      { title: "Read chapters 4–5", subject: "History", priority: "low", dueDate: inDays(6), status: "pending", progress: 0 },
      { title: "Group project: App wireframes", subject: "Computer Science", priority: "medium", dueDate: inDays(3), status: "in-progress", progress: 50 },
      { title: "Quiz: Cell biology", subject: "Biology", priority: "high", dueDate: inDays(0), status: "pending", progress: 0 },
      { title: "Submit scholarship form", subject: "Personal", priority: "medium", dueDate: inDays(5), status: "pending", progress: 0 },
      { title: "Statistics homework #6", subject: "Mathematics", priority: "low", dueDate: inDays(-1), status: "completed", progress: 100, completedAt: nowISO() }
    ];

    demoTasks.forEach(t => addTask(userId, t));
    localStorage.setItem(seededKey, "1");
  }

  /* ---------------- notes ---------------- */

  function notesKey(userId) {
    return `cadence_notes_${userId}`;
  }

  function getNotes(userId) {
    return readJSON(notesKey(userId), []);
  }

  function saveNotes(userId, notes) {
    return writeJSON(notesKey(userId), notes);
  }

  function addNote(userId, note) {
    const notes = getNotes(userId);
    const newNote = {
      id: generateId("note"),
      title: (note.title || "").trim() || "Untitled note",
      content: (note.content || "").trim(),
      createdAt: nowISO(),
      updatedAt: nowISO()
    };
    notes.unshift(newNote);
    saveNotes(userId, notes);
    return newNote;
  }

  function updateNote(userId, noteId, updates) {
    const notes = getNotes(userId);
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) return null;
    notes[idx] = { ...notes[idx], ...updates, id: notes[idx].id, updatedAt: nowISO() };
    saveNotes(userId, notes);
    return notes[idx];
  }

  function deleteNote(userId, noteId) {
    const notes = getNotes(userId).filter(n => n.id !== noteId);
    saveNotes(userId, notes);
    return true;
  }

  /* ---------------- public API ---------------- */

  return {
    // users
    getUsers, createUser, findUserByEmail, findUserById, emailExists,
    verifyCredentials, resetPassword, updateUserProfile,
    // session
    setSession, getSession, clearSession, isLoggedIn, requireAuth,
    // tasks
    getTasks, addTask, updateTask, deleteTask, toggleComplete,
    filterTasks, sortTasks, getStats, seedDemoTasksIfNeeded,
    // notes
    getNotes, addNote, updateNote, deleteNote,
    // utils
    generateId, todayKey
  };
})();

export default CadenceDB;
