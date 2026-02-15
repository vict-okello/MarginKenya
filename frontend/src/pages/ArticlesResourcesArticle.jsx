import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { articlesResourcesArticles } from "../data/articlesResourcesArticles";
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

function normalizeResources(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.resources)
      ? payload.resources
      : [];

  return list.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    category: item?.category || "Guide",
    date: (item?.publishedAt || "").slice(0, 10) || "",
    image: item?.image || "",
    author: item?.author || item?.authorName || "",
    authorName: item?.authorName || item?.author || "",
    authorRole: item?.authorRole || "",
    authorBio: item?.authorBio || "",
    summary: item?.summary || "",
    body: item?.content || item?.body || "",
    status: item?.status || "draft",
  }));
}

function ArticlesResourcesArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [articles, setArticles] = useState(articlesResourcesArticles);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let alive = true;

    async function loadResources() {
      try {
        const res = await fetch(`${API}/api/resources`);
        const data = await res.json();
        if (!res.ok) return;
        const next = normalizeResources(data);
        if (alive && next.length > 0) setArticles(next);
      } catch {
        // Keep static fallback if API is unavailable.
      }
    }

    if (API) loadResources();
    return () => {
      alive = false;
    };
  }, [API]);

  const article = useMemo(
    () => articles.find((item) => String(item.id) === String(articleId)),
    [articles, articleId]
  );

  const resolvedImage = (() => {
    if (!article?.image) return "";
    if (/^https?:\/\//i.test(article.image)) return article.image;
    return API ? `${API}${article.image}` : article.image;
  })();

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || "Resources",
    section: "Resources",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || "Resources",
    section: "Resources",
  });

  const canonicalPath = article
    ? `/resources/article/${article.id}/${slugify(article.title || article.id)}`
    : "/resources";

  useSeo({
    title: article?.title || "Resources Article",
    description: article?.summary || article?.body || "Resources article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (!article) {
    return <NotFoundMessage backTo="/" backLabel="Back to Home" />;
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
            src={resolvedImage}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        </MotionWrap>

        <MotionTitle
          className="pt-6 text-4xl font-semibold leading-tight text-black md:text-5xl [font-family:Georgia,Times,serif]"
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
          {article.category} - {article.date}
        </MotionText>

        <MotionText
          className="whitespace-pre-line pt-5 text-lg leading-relaxed text-black/75 md:text-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.22, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>

        <MotionText
          className="whitespace-pre-line pt-6 text-[17px] leading-8 text-black/85 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.28, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
        <ArticleAuthorBox article={article} fallbackName="Resources Desk" />
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default ArticlesResourcesArticle;
