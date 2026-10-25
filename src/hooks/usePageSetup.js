import { useEffect } from "react";

/** Sets <title> the way each original .html page did. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/** The original pages put layout classes on <body> (auth-body, dashboard-body). */
export function useBodyClass(className) {
  useEffect(() => {
    if (!className) return undefined;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);
}
