import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { latestNewsArticles } from "../data/latestNewsArticles";
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

function normalizeLatestNews(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return list.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    category: item?.category || "Latest News",
    date: item?.date || new Date().toISOString().slice(0, 10),
    image: item?.image || "",
    author: item?.author || item?.authorName || "",
    authorName: item?.authorName || item?.author || "",
    authorRole: item?.authorRole || "",
    authorBio: item?.authorBio || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
  }));
}

function LatestNewsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState(latestNewsArticles);
  const [loading, setLoading] = useState(true);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let mounted = true;

    async function loadLatestNews() {
      try {
        const res = await fetch(`${API}/api/latest-news`);
        const data = await res.json();
        if (!res.ok) return;
        const list = normalizeLatestNews(data);
        if (mounted) setArticles(list);
      } catch {
        // Keep static fallback data when API is unavailable.
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!API) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    loadLatestNews();
    return () => {
      mounted = false;
    };
  }, [API]);

  const article = useMemo(
    () => articles.find((item) => String(item.id) === String(articleId)),
    [articles, articleId]
  );
  const resolvedImage = useMemo(() => {
    if (!article?.image) return "";
    if (/^https?:\/\//i.test(article.image)) return article.image;
    if (!API) return article.image;
    return `${API}${article.image}`;
  }, [article?.image, API]);

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || "Latest News",
    section: "Latest News",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || "Latest News",
    section: "Latest News",
  });

  const canonicalPath = article
    ? `/latest-news/${article.id}/${slugify(article.title || article.id)}`
    : "/latest-news";

  useSeo({
    title: article?.title || "Latest News Article",
    description: article?.summary || article?.body || "Latest news article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (loading) {
    return null;
  }

  if (!article) {
    return <NotFoundMessage backTo="/" backLabel="Back to Home" />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
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
            src={resolvedImage}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>
        <MotionText
          className="pt-5 text-sm text-black/65"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          {article.category} - {article.date}
        </MotionText>
        <MotionTitle
          className="article-title pt-2 font-semibold text-black"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {article.title}
        </MotionTitle>
        <MotionText
          className="article-content pt-5 text-black/75"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          {article.summary}
        </MotionText>
        <MotionText
          className="article-content whitespace-pre-line pt-6 text-black/85"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36 }}
        >
          {article.body}
        </MotionText>
        <ArticleAuthorBox article={article} fallbackName="Latest News Desk" />
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default LatestNewsArticle;
