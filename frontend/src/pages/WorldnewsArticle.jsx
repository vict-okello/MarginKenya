import { useEffect, useMemo, useState } from "react";
import ArticlePage from "./ArticlePage";

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

        const lead = json?.lead && typeof json.lead === "object" ? json.lead : null;
        const stories = Array.isArray(json?.stories) ? json.stories : [];

        const mergedLead = lead
          ? {
              id: lead.articleId || lead.id || "lead-worldnews",
              title: lead.title || "",
              category: lead.label || "World News",
              date: lead.date || "",
              image: lead.image
                ? /^https?:\/\//i.test(lead.image)
                  ? lead.image
                  : `${API}${lead.image}`
                : "",
              summary: lead.summary || "",
              body: lead.body || lead.content || "",
            }
          : null;

        const mappedStories = stories.map((story, idx) => {
          const id = story?.id || `world-story-${idx}`;
          const resolvedImage = story?.image
            ? /^https?:\/\//i.test(story.image)
              ? story.image
              : `${API}${story.image}`
            : "";

          return {
            id,
            title: story?.title || "",
            category: story?.label || "World News",
            date: story?.date || "",
            image: resolvedImage,
            summary: story?.summary || "",
            body: story?.body || story?.content || "",
          };
        });

        if (alive) {
          setData([...(mergedLead ? [mergedLead] : []), ...mappedStories]);
        }
      } catch {
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

  if (loading) return null;

  return (
    <ArticlePage
      data={mergedData}
      backTo="/worldnews"
      backLabel="Back to World News"
      sectionName="World"
    />
  );
}
