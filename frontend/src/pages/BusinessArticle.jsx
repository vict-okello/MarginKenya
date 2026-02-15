import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { businessArticles } from "../data/businessArticles";
import NotFoundMessage from "../components/NotFoundMessage";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import useReadTracker from "../hooks/useReadTracker";
import NewsletterBanner from "./NewsletterBanner";
import useSeo from "../hooks/useSeo";
import slugify from "../utils/slugify";
import ArticleAuthorBox from "../components/ArticleAuthorBox";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function BusinessArticle() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const { articleId } = useParams();
  const [stories, setStories] = useState(businessArticles);

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      try {
        const res = await fetch(`${API}/api/business`);
        const json = await res.json();
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted && next.length > 0) setStories(next);
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    if (API) loadBusiness();
    return () => {
      mounted = false;
    };
  }, [API]);

  const article = useMemo(() => stories.find((item) => item.id === articleId), [stories, articleId]);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

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
    category: article?.tag || "Business",
    section: article?.scope || "Business",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.tag || "Business",
    section: article?.scope || "Business",
  });

  const resolvedImage = article ? resolveImageUrl(article.image) : "";
  const canonicalPath = article
    ? `/business/article/${article.id}/${slugify(article.title || article.id)}`
    : "/business";

  useSeo({
    title: article?.title || "Business Article",
    description: article?.summary || article?.body || "Business news article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (!article) {
    return <NotFoundMessage backTo="/business" backLabel="Back to Business" />;
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
          className="mx-auto max-w-4xl overflow-hidden rounded"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>

        <MotionText
          className="pt-4 text-sm text-black/65"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        >
          {article.scope} - {article.tag} - {article.date}
        </MotionText>

        <MotionTitle
          className="pt-2 text-4xl font-semibold leading-tight text-black md:text-5xl [font-family:Georgia,Times,serif]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {article.title}
        </MotionTitle>

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
        <ArticleAuthorBox article={article} fallbackName="Business Desk" />
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default BusinessArticle;
