import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NotFoundMessage from "../../components/NotFoundMessage";
import useArticleViewTracker from "../../hooks/useArticleViewTracker";
import useReadTracker from "../../hooks/useReadTracker";
import NewsletterBanner from "../NewsletterBanner";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function isHttp(url) {
  return /^https?:\/\//i.test(url);
}

export default function HeroArticlePage() {
  const API = import.meta.env.VITE_API_URL;
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useArticleViewTracker({
    articleId: article?._id || article?.id || id,
    title: article?.title,
    category: article?.category || "World News",
    section: "World",
  });
  useReadTracker({
    articleId: article?._id || article?.id || id,
    title: article?.title,
    category: article?.category || "World News",
    section: "World",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/hero-articles/${id}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) setArticle(data);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [API, id]);

  if (notFound) {
    return <NotFoundMessage backTo="/" backLabel="Back to Home" />;
  }

  if (!article) return null;

  const img = article.imageUrl
    ? isHttp(article.imageUrl)
      ? article.imageUrl
      : `${API}${article.imageUrl}`
    : "";

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/"
          className="inline-block rounded border border-black/35 px-4 py-2 text-sm font-medium text-black/75 transition hover:bg-black/5 hover:text-black"
        >
          &larr; Back to Home
        </Link>

        {img ? (
          <MotionWrap
            className="overflow-hidden rounded pt-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <MotionImage
              src={img}
              alt={article.title}
              className="h-[240px] w-full object-cover object-center md:h-[360px] lg:h-[420px]"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.35 }}
            />
          </MotionWrap>
        ) : null}

        <MotionTitle className="pt-6 text-4xl font-semibold text-black">
          {article.title}
        </MotionTitle>

        <MotionText className="pt-3 text-sm text-black/65">
          {article.category}
          {article.author ? ` • ${article.author}` : ""}
          {article.date ? ` • ${article.date}` : ""}
          {article.readTime ? ` • ${article.readTime}` : ""}
        </MotionText>

        {article.summary ? (
          <MotionText className="pt-4 text-black/75">{article.summary}</MotionText>
        ) : null}

        {article.body ? (
          <MotionText className="pt-4 text-black/80 whitespace-pre-line">
            {article.body}
          </MotionText>
        ) : null}
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}
