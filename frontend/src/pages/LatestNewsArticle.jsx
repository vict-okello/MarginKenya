import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { latestNewsArticles } from "../data/latestNewsArticles";
import NotFoundMessage from "../components/NotFoundMessage";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import useReadTracker from "../hooks/useReadTracker";
import NewsletterBanner from "./NewsletterBanner";

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
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
  }));
}

function LatestNewsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState(latestNewsArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLatestNews() {
      try {
        const res = await fetch(`${API}/api/latest-news`);
        const data = await res.json();
        if (!res.ok) return;
        const list = normalizeLatestNews(data);
        if (mounted && list.length > 0) setArticles(list);
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
  const isSportsImage = article?.category === "Sports";

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
          className="overflow-hidden rounded bg-gradient-to-b from-[#e4e7ec] to-[#cfd4db]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MotionImage
            src={resolvedImage}
            alt={article.title}
            className={`h-[260px] w-full md:h-[430px] ${
              isSportsImage ? "object-contain p-3 md:p-6" : "object-cover"
            }`}
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
          className="pt-2 text-4xl font-semibold leading-tight text-black md:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {article.title}
        </MotionTitle>
        <MotionText
          className="pt-5 text-lg leading-relaxed text-black/75 md:text-xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          {article.summary}
        </MotionText>
        <MotionText
          className="whitespace-pre-line pt-6 text-[17px] leading-8 text-black/85 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36 }}
        >
          {article.body}
        </MotionText>
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default LatestNewsArticle;
