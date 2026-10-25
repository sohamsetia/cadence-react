/* PROFILE (profile.html + js/profile.js): editable name/email, avatar
   upload (stored as a data URL in localStorage), password change, and
   personal task stats. */

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AlarmClock, Camera, CheckCircle2, Hourglass, ListChecks, LogOut, TrendingUp } from "lucide-react";
import CadenceDB from "../lib/storage";
import { isValidEmail, isValidPassword } from "../lib/auth";
import { selectTaskStats } from "../store/tasksSlice";
import { useApp } from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/usePageSetup";
import { Banner, FieldError, PasswordInput, StrengthMeter } from "../components/FormControls";
import StatTile from "../components/StatTile";

const MAX_AVATAR_BYTES = 350 * 1024; // ~350KB — keeps localStorage happy

function initialsFrom(name) {
  return String(name).trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || "").join("") || "U";
}

/* ---------------- personal details ---------------- */

function DetailsCard({ session }) {
  const { refreshSession, logout } = useAuth();
  const showToast = useToast();
  const fileRef = useRef(null);
  const [name, setName] = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const since = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "recently";

  function handleAvatarChange() {
    const fileInput = fileRef.current;
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.", "error");
      fileInput.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast("That image is too large — please use one under 350KB.", "error");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = CadenceDB.updateUserProfile(session.id, { avatarDataUrl: reader.result });
      if (updated) {
        refreshSession(); // topbar avatar updates from the session
        showToast("Profile photo updated.");
      }
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const current = CadenceDB.getSession();
    const next = {};

    if (trimmedName.length < 2) next.name = "Enter your full name.";
    if (!isValidEmail(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    } else if (trimmedEmail.toLowerCase() !== current.email.toLowerCase() && CadenceDB.emailExists(trimmedEmail)) {
      next.email = "That email is already in use by another account.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const updated = CadenceDB.updateUserProfile(current.id, { name: trimmedName, email: trimmedEmail.toLowerCase() });
    if (updated) {
      refreshSession();
      setName(updated.name);
      setEmail(updated.email);
      setBanner({ type: "success", message: "Your profile was updated." });
    }
  }

  return (
    <div className="widget">
      <div className="widget-head">
        <h3>Personal details</h3>
      </div>

      <div className="profile-avatar-row">
        <div className="profile-avatar">
          {session.avatarDataUrl
            ? <img src={session.avatarDataUrl} alt="" />
            : <span>{session.avatarInitials || initialsFrom(session.name)}</span>}
          <button type="button" className="profile-avatar-upload-btn" aria-label="Change profile photo" onClick={() => fileRef.current.click()}>
            <Camera width={13} height={13} />
          </button>
          <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="profile-meta-name">{session.name}</p>
          <p className="profile-meta-since">Member since {since}</p>
        </div>
      </div>

      <Banner banner={banner} />

      <form noValidate onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="profileName">Full name</label>
          <input type="text" id="profileName" className="auth-input" required value={name} onChange={e => setName(e.target.value)} />
          <FieldError message={errors.name} />
        </div>
        <div className="modal-field">
          <label htmlFor="profileEmail">Email</label>
          <input type="email" id="profileEmail" className="auth-input" required value={email} onChange={e => setEmail(e.target.value)} />
          <FieldError message={errors.email} />
        </div>
        <button type="submit" className="btn btn-primary">Save changes</button>
      </form>

      <div className="profile-footer-actions">
        <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Signed in on this device</span>
        <button type="button" className="profile-logout-link" onClick={logout}>
          <LogOut width={14} height={14} /> Log out
        </button>
      </div>
    </div>
  );
}

/* ---------------- change password ---------------- */

const EMPTY_PASSWORDS = { current: "", next: "", confirm: "" };

function PasswordCard() {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const set = field => v => setValues(s => ({ ...s, [field]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const current = CadenceDB.getSession();
    const next = {};

    if (!CadenceDB.verifyCredentials(current.email, values.current)) next.current = "That current password isn't correct.";
    if (!isValidPassword(values.next)) next.next = "Use at least 8 characters, including a number.";
    if (values.confirm !== values.next) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    CadenceDB.resetPassword(current.email, values.next);
    setBanner({ type: "success", message: "Your password was updated." });
    setValues(EMPTY_PASSWORDS); // also clears the strength meter
  }

  return (
    <div className="widget">
      <div className="widget-head">
        <h3>Change password</h3>
      </div>

      <Banner banner={banner} />

      <form noValidate onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="currentPassword">Current password</label>
          <PasswordInput id="currentPassword" value={values.current} onChange={set("current")} autoComplete="current-password" />
          <FieldError message={errors.current} />
        </div>

        <div className="modal-field">
          <label htmlFor="newPassword">New password</label>
          <PasswordInput id="newPassword" value={values.next} onChange={set("next")} placeholder="At least 8 characters" autoComplete="new-password" />
          <StrengthMeter password={values.next} />
          <FieldError message={errors.next} />
        </div>

        <div className="modal-field">
          <label htmlFor="confirmNewPassword">Confirm new password</label>
          <PasswordInput id="confirmNewPassword" value={values.confirm} onChange={set("confirm")} autoComplete="new-password" />
          <FieldError message={errors.confirm} />
        </div>

        <button type="submit" className="btn btn-primary">Update password</button>
      </form>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Profile() {
  useDocumentTitle("Profile — Cadence");
  const { session } = useApp();
  const stats = useSelector(selectTaskStats);

  return (
    <>
      <h1 className="dashboard-title">Profile</h1>

      <div className="profile-grid">
        <DetailsCard session={session} />
        <PasswordCard />
      </div>

      {/* Personal task stats */}
      <p className="widget-subheading" style={{ marginTop: "28px" }}>Your stats</p>
      <div className="stats-grid">
        <StatTile Icon={ListChecks} value={stats.total} label="Total tasks" />
        <StatTile Icon={CheckCircle2} value={stats.completed} label="Completed" />
        <StatTile Icon={Hourglass} value={stats.pending} label="Pending" />
        <StatTile Icon={AlarmClock} value={stats.dueToday} label="Due today" />
        <StatTile Icon={TrendingUp} value={`${stats.completionPercentage}%`} label="Completion rate" />
      </div>
    </>
  );
}
