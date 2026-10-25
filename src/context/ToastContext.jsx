/* Flash toast (was showToast() in js/main.js). Mounted once at the
   app root, so a toast fired just before navigating — "logged out",
   "password reset" — stays visible on the next page. */

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const remove = useCallback(id => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++nextId.current;
    setToasts(list => [...list, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts(list => list.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast ${t.type === "error" ? "error" : ""} ${t.leaving ? "is-leaving" : ""}`.trim()}
            onAnimationEnd={() => { if (t.leaving) remove(t.id); }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
