import { useEffect, useRef } from "react";
import { getSessionId } from "../utils/session";

export default function useReadTracker({
  articleId,
  title,
  category,
  section = "",
  minSeconds = 20,
  minScrollPercent = 60,
}) {
  const API = import.meta.env.VITE_API_URL;

  const startRef = useRef(0);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!API || !articleId || !title) return;
    startRef.current = Date.now();
    sentRef.current = false;

    function getScrollPercent() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return 100;
      return Math.round((scrollTop / scrollHeight) * 100);
    }

    async function maybeSendRead() {
      if (sentRef.current) return;

      const seconds = Math.floor((Date.now() - startRef.current) / 1000);
      const scrollPct = getScrollPercent();

      if (seconds >= minSeconds && scrollPct >= minScrollPercent) {
        sentRef.current = true;

        fetch(`${API}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            type: "read",
            sessionId: getSessionId(),
            path: window.location.pathname,
            articleId,
            title,
            category,
            section,
            readTimeSec: seconds,
          }),
        }).catch(() => {});
      }
    }

    const interval = setInterval(maybeSendRead, 3000);
    window.addEventListener("scroll", maybeSendRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", maybeSendRead);
    };
  }, [API, articleId, title, category, section, minSeconds, minScrollPercent]);
}
