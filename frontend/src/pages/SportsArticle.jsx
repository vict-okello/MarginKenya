import { useEffect, useMemo, useState } from "react";
import ArticlePage from "./ArticlePage";

function normalizeStories(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return Object.values(input);
  return [];
}

export default function SportsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const [stories, setStories] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadSports() {
      try {
        const res = await fetch(`${API}/api/sports`);
        const json = await res.json().catch(() => []);
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted) setStories(normalizeStories(next));
      } catch {}
    }

    if (API) loadSports();
    return () => {
      mounted = false;
    };
  }, [API]);

  const data = useMemo(() => {
    return normalizeStories(stories).map((item) => {
      const image = String(item?.image || "");
      if (!image) return item;
      if (/^https?:\/\//i.test(image)) return item;
      if (/^\/?uploads\//i.test(image)) {
        const normalized = image.startsWith("/") ? image : `/${image}`;
        return { ...item, image: base ? `${base}${normalized}` : normalized };
      }
      return item;
    });
  }, [stories, base]);

  return <ArticlePage data={data} backTo="/sports" backLabel="Back to Sports" sectionName="Sports" />;
}
