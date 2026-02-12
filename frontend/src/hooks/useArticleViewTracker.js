import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getSessionId } from "../utils/session";

export default function useArticleViewTracker({
  articleId,
  title,
  category,
  section = "",
}) {
  const API = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const lastSentRef = useRef("");

  useEffect(() => {
    if (!API || !articleId) return;

    const key = `${location.pathname}|${articleId}`;
    if (lastSentRef.current === key) return;
    lastSentRef.current = key;

    fetch(`${API}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        type: "article_view",
        sessionId: getSessionId(),
        path: location.pathname,
        articleId,
        title: title || "",
        category: category || "",
        section,
      }),
    }).catch(() => {});
  }, [API, articleId, title, category, section, location.pathname]);
}

