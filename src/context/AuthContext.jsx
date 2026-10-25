/* Session state. CadenceDB still owns persistence (cadence_session in
   localStorage); this context just mirrors it into React state so the
   topbar, guards and pages re-render when it changes. */

import { createContext, startTransition, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CadenceDB from "../lib/storage";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => CadenceDB.getSession());
  const navigate = useNavigate();
  const showToast = useToast();

  /** Re-read the session after CadenceDB.updateUserProfile() changes it. */
  const refreshSession = useCallback(() => {
    setSessionState(CadenceDB.getSession());
  }, []);

  const signIn = useCallback(user => {
    CadenceDB.setSession(user);
    CadenceDB.seedDemoTasksIfNeeded(user.id);
    setSessionState(user);
  }, []);

  const logout = useCallback(() => {
    CadenceDB.clearSession();
    showToast("You've been logged out successfully.", "success");
    // React Router runs navigation in a transition; clearing the session in the
    // same transition stops the app guard from bouncing to /login first.
    startTransition(() => {
      setSessionState(null);
      navigate("/home");
    });
  }, [navigate, showToast]);

  return (
    <AuthContext.Provider value={{ session, signIn, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
