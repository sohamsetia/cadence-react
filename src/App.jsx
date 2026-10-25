/* Routes. Each original .html page is a route; the old .html URLs
   redirect to their new paths so existing links/bookmarks still work. */

import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import Analytics from "./pages/Analytics";
import Schedule from "./pages/Schedule";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";

const LEGACY_PAGES = [
  "home", "about", "contact", "privacy-policy", "terms-and-conditions",
  "login", "register", "forgot-password",
  "dashboard", "my-tasks", "analytics", "schedule", "notes", "profile"
];

/** New page → top of the page; "/home#features" → that section (like a full page load did). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />

          <Route element={<PublicLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {LEGACY_PAGES.map(page => (
            <Route key={page} path={`/${page}.html`} element={<Navigate to={`/${page}`} replace />} />
          ))}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
