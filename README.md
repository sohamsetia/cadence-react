# Cadence (React + Vite)

Student Task Management System. This is the React version of the original HTML/CSS/vanilla-JS
site in the parent folder. The design, data and behavior are the same.

## Run it locally

Requires Node.js 18 or newer.

```bash
cd cadence-react
npm install       # first time only
npm run dev       # http://localhost:5173 (opens the browser)
```

Production build:

```bash
npm run build     # outputs to dist/
npm run preview   # serves dist/ at http://localhost:4173
```

`dist/` is a single-page app. If you host it on a static server, configure the server to return
`index.html` for unknown paths so deep links like `/dashboard` work on refresh.

## Project structure

```
src/
  main.jsx                 entry: router + the original stylesheets
  App.jsx                  routes (+ redirects from the old *.html URLs)
  styles/
    style.css auth.css dashboard.css   copied from ../css (one stray "}" removed, see below)
    splash.css             the old index.html inline <style>, scoped under .splash
    react-overrides.css    one rule: #root { display: contents }
  lib/
    storage.js             js/storage.js, unchanged except `export default`
    auth.js                validation, password strength, CAPTCHA (from js/auth.js)
    tasks.js               shared icons, due-date labels, chart series (from several page scripts)
  store/                   Redux Toolkit
    index.js               configureStore({ tasks, notes })
    tasksSlice.js          tasks: slice, thunks (add/update/delete/toggle), selectors (+ memoized stats)
    notesSlice.js          notes: slice, thunks, selectors
  context/
    AuthContext.jsx        session state, sign in, log out
    ToastContext.jsx       flash toasts (from showToast in js/main.js)
  layouts/
    PublicLayout.jsx       navbar + footer (home, about, contact, legal)
    AuthLayout.jsx         split-screen panel (login, register, forgot password)
    AppLayout.jsx          sidebar, topbar, global search, task modal, auth guard
  components/              Brand, ThemeToggle, FormControls (password, strength, captcha,
                           banner), TaskModal, DeadlineCalendar, Pomodoro, ChartCanvas,
                           ProductivityChart, StatTile
  pages/                   one component per original .html page
```

| Original | React |
|---|---|
| `index.html` | `pages/Splash.jsx` (`/`) |
| `home.html`, `about.html`, `contact.html`, `privacy-policy.html`, `terms-and-conditions.html` | `pages/Home`, `About`, `Contact`, `PrivacyPolicy`, `Terms` |
| `login.html`, `register.html`, `forgot-password.html` + `js/auth.js` | `pages/Login`, `Register`, `ForgotPassword` |
| `dashboard.html` + `js/dashboard.js`, `js/tasks.js`, `js/calendar.js`, `js/pomodoro.js` | `pages/Dashboard.jsx`, `components/DeadlineCalendar`, `Pomodoro`, `TaskModal` |
| `my-tasks.html`, `analytics.html`, `schedule.html`, `notes.html`, `profile.html` + their scripts | `pages/MyTasks`, `Analytics`, `Schedule`, `Notes`, `Profile` |
| `js/main.js` | `layouts/*`, `ThemeToggle`, `ToastContext`, global search in `AppLayout` |

## State management

| Where | What | Why there |
|---|---|---|
| Redux store (`src/store`) | Tasks and notes | Shared data that many widgets read (lists, stats, charts, calendar, search) and several pages change. |
| `AuthContext` | Logged-in session, `signIn`, `logout`, `refreshSession` | App-wide but rarely changes; also guards routes. |
| `ToastContext` | `showToast()` | A UI service used everywhere. It holds no business data. |
| `AppContext` (in `AppLayout`) | Topbar search text, `openTaskModal()` | Belongs only to the logged-in app shell. |
| Local `useState` | Form fields, filters, modal open/closed, Pomodoro | Used by a single component. |

Data flow for a change: component → `dispatch(addTask(...))` → the thunk writes through `CadenceDB`
(localStorage) → `tasksLoaded` puts the fresh list in the store → every `useSelector(selectTasks)`
re-renders.

## Data

Everything is still stored in `localStorage`, using the same keys (`cadence_users`, `cadence_session`,
`cadence_tasks_<id>`, `cadence_notes_<id>`, `cadence_theme`, `cadence_pomo`,
`cadence_contact_messages`). Browsers keep storage separate for each origin, so accounts created
while the old site ran on a different host or port won't appear here.

## Differences from the original

- **Fixed:** saving a task that was opened from the topbar search on the Dashboard or My Tasks page
  used to save it *and* add a duplicate copy. That no longer happens.
- **Fixed:** the Profile avatar showed a broken-image icon (an empty `<img>`) next to the initials.
- **Fixed:** `dashboard.css` had a stray `}` that made browsers ignore the `.table-actions button:hover`
  rule after it. It was removed in the copy because Vite's CSS parser rejects it. That hover color now works.
- **Changed:** Lucide icons come from the `lucide-react` package instead of the unpinned
  `lucide@latest` CDN script, and Chart.js comes from npm instead of a CDN.
