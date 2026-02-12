import { useEffect, useMemo, useState } from "react";
import ArticlePage from "./ArticlePage";
import { worldNewsArticles } from "../data/worldNewsArticles";

export default function WorldnewsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(worldNewsArticles);

  useEffect(() => {
    let alive = true;

    async function loadWorldArticle() {
      try {
        const res = await fetch(`${API}/api/worldnews`);
        const json = await res.json();
        if (!res.ok) return;

        const lead = json?.lead && typeof json.lead === "object" ? json.lead : null;
        const stories = Array.isArray(json?.stories) ? json.stories : [];

        const mergedLead = lead
          ? (() => {
              const leadId = lead.articleId || lead.id || "lead-worldnews";
              const existing = worldNewsArticles.find((item) => String(item.id) === String(leadId));
              const resolvedImage = lead.image
                ? /^https?:\/\//i.test(lead.image)
                  ? lead.image
                  : `${API}${lead.image}`
                : existing?.image || "";

              return {
                ...(existing || {}),
                id: leadId,
                title: lead.title || existing?.title || "",
                category: lead.label || existing?.category || "World News",
                date: lead.date || existing?.date || "",
                image: resolvedImage,
                summary: lead.summary || existing?.summary || "",
                body: lead.body || lead.content || existing?.body || "",
              };
            })()
          : null;

        const mappedStories = stories.map((story, idx) => {
          const id = story?.id || `world-story-${idx}`;
          const existing = worldNewsArticles.find((item) => String(item.id) === String(id));
          const resolvedImage = story?.image
            ? /^https?:\/\//i.test(story.image)
              ? story.image
              : `${API}${story.image}`
            : existing?.image || "";

          return {
            ...(existing || {}),
            id,
            title: story?.title || existing?.title || "",
            category: story?.label || existing?.category || "World News",
            date: story?.date || existing?.date || "",
            image: resolvedImage,
            summary: story?.summary || existing?.summary || "",
            body: story?.body || story?.content || existing?.body || "",
          };
        });

        if (alive) {
          const staticFiltered = worldNewsArticles.filter((item) => {
            if (mergedLead && String(item.id) === String(mergedLead.id)) return false;
            return !mappedStories.some((s) => String(s.id) === String(item.id));
          });

          setData([...(mergedLead ? [mergedLead] : []), ...mappedStories, ...staticFiltered]);
        }
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    if (API) loadWorldArticle();
    return () => {
      alive = false;
    };
  }, [API]);

  const mergedData = useMemo(() => data, [data]);

  return (
    <ArticlePage
      data={mergedData}
      backTo="/worldnews"
      backLabel="Back to World News"
      sectionName="World"
    />
  );
}
