import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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

function HealthArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHealth() {
      try {
        const res = await fetch(`${API}/api/health-news`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted) setArticles(Array.isArray(json) ? json : []);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (API) {
      loadHealth();
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [API]);

  const article = articles.find((item) => String(item.id) === String(articleId));
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
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
    category: "Health",
    section: "Health",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: "Health",
    section: "Health",
  });

  const resolvedImage = article ? resolveImageUrl(article.image) : "";
  const canonicalPath = article
    ? `/health/article/${article.id}/${slugify(article.title || article.id)}`
    : "/health";

  useSeo({
    title: article?.title || "Health Article",
    description: article?.summary || article?.body || "Health news article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (loading) {
    return null;
  }

  if (!article) {
    return <NotFoundMessage backTo="/health" backLabel="Back to Health" />;
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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>
        <MotionTitle
          className="article-title pt-6 font-semibold text-black"
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
          className="article-content pt-4 text-black/75"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>
        <MotionText
          className="article-content pt-4 text-black/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
        <ArticleAuthorBox article={article} fallbackName="Health Desk" />
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default HealthArticle;
