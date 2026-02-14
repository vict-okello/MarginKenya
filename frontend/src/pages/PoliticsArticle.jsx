import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundMessage from "../components/NotFoundMessage";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import useReadTracker from "../hooks/useReadTracker";
import NewsletterBanner from "./NewsletterBanner";
import useSeo from "../hooks/useSeo";
import slugify from "../utils/slugify";

const MotionSection = motion.section;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function normalizeDesk(payload) {
  return {
    local: Array.isArray(payload?.local) ? payload.local : [],
    international: Array.isArray(payload?.international)
      ? payload.international
      : [],
  };
}

function PoliticsArticle() {
  const API = import.meta.env.VITE_API_URL;
  const { articleId } = useParams();
  const [deskData, setDeskData] = useState({ local: [], international: [] });
  const [loading, setLoading] = useState(true);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const resolveImageUrl = useMemo(() => {
    const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
    return (url) => {
      if (!url) return "";
      if (/^https?:\/\//i.test(url)) return url;
      return base ? `${base}${url}` : url;
    };
  }, [API]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/politics`);
        if (!res.ok) throw new Error("Failed to load politics");
        const data = normalizeDesk(await res.json());
        if (alive) setDeskData(data);
      } catch {
        if (alive) setDeskData({ local: [], international: [] });
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [API]);

  const article = useMemo(() => {
    const flattened = [
      ...deskData.local.map((item) => ({
        ...item,
        scope: item.scope || "Local",
      })),
      ...deskData.international.map((item) => ({
        ...item,
        scope: item.scope || "International",
      })),
    ];
    return flattened.find(
      (item) => String(item.id) === String(articleId)
    );
  }, [articleId, deskData]);

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.tag || "Politics",
    section: article?.scope || "Politics",
  });
  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.tag || "Politics",
    section: article?.scope || "Politics",
  });

  const resolvedImage = article ? resolveImageUrl(article.image) : "";
  const canonicalPath = article
    ? `/politics/article/${article.id}/${slugify(article.title || article.id)}`
    : "/politics";

  useSeo({
    title: article?.title || "Politics Article",
    description: article?.summary || article?.content || article?.body || "Politics news article",
    url: `${origin}${canonicalPath}`,
    image: resolvedImage,
    type: "article",
  });

  if (loading) {
    return (
      <MotionSection className="bg-[#d8d8dc] px-4 py-10">
        <div className="mx-auto w-full max-w-5xl rounded border border-black/15 bg-white/35 p-5 text-sm text-black/70">
          Loading article...
        </div>
      </MotionSection>
    );
  }

  if (!article) {
    return (
      <NotFoundMessage
        backTo="/politics"
        backLabel="Back to Politics"
      />
    );
  }

  const bodyText = article.body || article.content || "";

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">

        <MotionText className="text-sm text-black/65">
          {article.scope} - {article.tag} - {article.date}
        </MotionText>

        <MotionTitle className="pt-2 text-4xl font-semibold leading-tight text-black md:text-5xl [font-family:Georgia,Times,serif]">
          {article.title}
        </MotionTitle>

        <div className="pt-6">
          <MotionImage
            src={resolveImageUrl(article.image)}
            alt={article.title}
            className="mx-auto w-full max-w-4xl rounded object-cover"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          />

          <MotionText className="pt-5 text-lg leading-relaxed text-black/75 md:text-xl">
            {article.summary}
          </MotionText>

          <MotionText className="whitespace-pre-line pt-6 text-[17px] leading-8 text-black/85 md:text-lg">
            {bodyText}
          </MotionText>
        </div>

      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default PoliticsArticle;
