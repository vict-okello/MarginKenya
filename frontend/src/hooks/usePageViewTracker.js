import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSessionId } from "../utils/session";

export default function usePageViewTracker() {
  const API = import.meta.env.VITE_API_URL;
  const location = useLocation();

  useEffect(() => {
    fetch(`${API}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "page_view",
        sessionId: getSessionId(),
        path: location.pathname, // tracks every page
      }),
    }).catch(() => {});
  }, [API, location.pathname]);
}