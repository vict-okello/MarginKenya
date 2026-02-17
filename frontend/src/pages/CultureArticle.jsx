import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function CultureArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let mounted = true;

    async function loadCulture() {
      try {
        const res = await fetch(`${API}/api/culture`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted) setArticles(Array.isArray(json) ? json : []);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (API) {
      loadCulture();
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [API]);

  const article = articles.find((item) => String(item.id) === String(articleId));
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");

  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return base ? `${base}${url}` : url;
  }

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: "Culture",
    section: "Culture",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: "Culture",
    section: "Culture",
  });

  const resolvedImage = article ? resolveImageUrl(article.image) : "";
  const canonicalPath = article
    ? `/culture/article/${article.id}/${slugify(article.title || article.id)}`
    : "/culture";

  useSeo({
    title: article?.title || "Culture Article",
    description: article?.summary || article?.body || "Culture news article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (loading) {
    return null;
  }

  if (!article) {
    return <NotFoundMessage backTo="/culture" backLabel="Back to Culture" />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/"
          className="inline-block rounded border border-black/35 px-4 py-2 text-sm font-medium text-black/75 transition hover:bg-black/5 hover:text-black"
        >
          &larr; Back to Home
        </Link>

        <MotionWrap
          className="mx-auto max-w-4xl overflow-hidden rounded pt-5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        </MotionWrap>

        <MotionTitle
          className="article-title pt-6 font-semibold text-black"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.1, ease: "easeOut" }}
        >
          {article.title}
        </MotionTitle>

        <MotionText
          className="pt-3 text-sm text-black/65"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.16, ease: "easeOut" }}
        >
          {article.author} - {article.date}
        </MotionText>

        <MotionText
          className="article-content pt-4 text-black/75"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.22, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>

        <MotionText
          className="article-content pt-4 text-black/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.28, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
        <ArticleAuthorBox article={article} fallbackName="Culture Desk" />
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default CultureArticle;
