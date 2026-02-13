import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { technologyArticles } from "../data/technologyArticles";
import NotFoundMessage from "../components/NotFoundMessage";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import useReadTracker from "../hooks/useReadTracker";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function TechnologyArticle() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const { articleId } = useParams();
  const [stories, setStories] = useState(technologyArticles);

  useEffect(() => {
    let mounted = true;

    async function loadTechnology() {
      try {
        const res = await fetch(`${API}/api/technology`);
        const json = await res.json();
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted && next.length > 0) setStories(next);
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    if (API) loadTechnology();
    return () => {
      mounted = false;
    };
  }, [API]);

  const article = useMemo(() => stories.find((item) => item.id === articleId), [stories, articleId]);

  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return base ? `${base}${normalized}` : normalized;
    }
    return url;
  }

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: "Technology",
    section: "Technology",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: "Technology",
    section: "Technology",
  });

  if (!article) {
    return <NotFoundMessage backTo="/technology" backLabel="Back to Technology" />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionWrap
          className="overflow-hidden rounded"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="h-[240px] w-full object-cover object-center md:h-[360px] lg:h-[420px]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>

        <MotionTitle
          className="pt-6 text-4xl font-semibold text-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          {article.title}
        </MotionTitle>

        <MotionText
          className="pt-3 text-sm text-black/65"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          {article.author} - {article.date}
        </MotionText>

        <MotionText
          className="pt-4 text-black/75"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>

        <MotionText
          className="pt-4 text-black/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default TechnologyArticle;
