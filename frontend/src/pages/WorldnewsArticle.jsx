import { useEffect, useMemo, useState } from "react";
import ArticlePage from "./ArticlePage";

function normalizeWorldArticles(payload) {
  const lead = payload?.lead && typeof payload.lead === "object" ? payload.lead : null;
  const stories = Array.isArray(payload?.stories) ? payload.stories : [];

  const mappedLead = lead
    ? [
        {
          id: lead.articleId || lead.id || "lead-worldnews",
          title: lead.title || "",
          category: lead.label || "World News",
          date: lead.date || "",
          image: lead.image || "",
          summary: lead.summary || "",
          body: lead.body || lead.content || "",
        },
      ]
    : [];

  const mappedStories = stories.map((story, idx) => ({
    id: story?.id || `world-story-${idx}`,
    title: story?.title || "",
    category: story?.label || "World News",
    date: story?.date || "",
    image: story?.image || "",
    summary: story?.summary || "",
    body: story?.body || story?.content || "",
  }));

  return [...mappedLead, ...mappedStories];
}

export default function WorldnewsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadWorldArticle() {
      try {
        const res = await fetch(`${API}/api/worldnews`);
        const json = await res.json();
        if (!res.ok) return;
        const next = normalizeWorldArticles(json).map((item) => {
          const image = String(item.image || "");
          if (!image || /^https?:\/\//i.test(image)) return item;
          return { ...item, image: `${API}${image}` };
        });
        if (alive) setData(next);
      } catch {
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (API) {
      loadWorldArticle();
    } else {
      setLoading(false);
    }
    return () => {
      alive = false;
    };
  }, [API]);

  const mergedData = useMemo(() => data, [data]);

  if (loading) {
    return null;
  }

  return (
    <ArticlePage
      data={mergedData}
      backTo="/worldnews"
      backLabel="Back to World News"
      sectionName="World"
    />
  );
}
