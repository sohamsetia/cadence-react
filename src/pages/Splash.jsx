/* Branded loading moment (was index.html), then continue into the app. */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/usePageSetup";
import "../styles/splash.css";

export default function Splash() {
  useDocumentTitle("Loading — Cadence");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home", { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="splash">
      <div className="splash-loader" role="status" aria-live="polite">
        <div className="splash-mark" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path d="M2 14L7 4L10 11L13 6L18 14" stroke="#D8F34E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="splash-name">Cadence</p>

        <div className="splash-bar-track">
          <div className="splash-bar-fill"></div>
        </div>

        <p className="splash-status">
          <span>Getting things ready</span>
          <span className="dots"><span>.</span><span>.</span><span>.</span></span>
        </p>
      </div>
    </div>
  );
}
