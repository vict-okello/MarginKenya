import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cultureArticles } from "../data/cultureArticles";
import NotFoundMessage from "../components/NotFoundMessage";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import useReadTracker from "../hooks/useReadTracker";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function CultureArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState(cultureArticles);

  useEffect(() => {
    let mounted = true;

    async function loadCulture() {
      try {
        const res = await fetch(`${API}/api/culture`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) setArticles(json);
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    if (API) loadCulture();
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
          className="overflow-hidden rounded pt-5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="h-[240px] w-full object-cover object-center md:h-[360px] lg:h-[420px]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        </MotionWrap>

        <MotionTitle
          className="pt-6 text-4xl font-semibold text-black"
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
          className="pt-4 text-black/75"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.22, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>

        <MotionText
          className="pt-4 text-black/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.28, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default CultureArticle;
