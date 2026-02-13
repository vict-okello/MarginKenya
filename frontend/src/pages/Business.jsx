import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { businessArticles } from "../data/businessArticles";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionArticle = motion.article;

function Business() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const [scope, setScope] = useState("Local");
  const [tag, setTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(3);
  const [stories, setStories] = useState(businessArticles);

  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return base ? `${base}${normalized}` : normalized;
    }
    return url;
  }

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

  const tags = useMemo(() => {
    const scoped = stories.filter((item) => item.scope === scope);
    return ["All", ...new Set(scoped.map((item) => item.tag))];
  }, [scope, stories]);

  const filteredArticles = useMemo(() => {
    const scoped = stories.filter((item) => item.scope === scope);
    return tag === "All" ? scoped : scoped.filter((item) => item.tag === tag);
  }, [scope, tag, stories]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const featured = visibleArticles[0];
  const gridItems = visibleArticles.slice(1);
  const topSideItems = gridItems.slice(0, 2);
  const extraItems = gridItems.slice(2);
  const sidebarFillItems = extraItems.length
    ? extraItems.slice(0, 1)
    : filteredArticles[visibleCount]
      ? [filteredArticles[visibleCount]]
      : [];
  const extraGridItems = extraItems.slice(sidebarFillItems.length);
  const canLoadMore = visibleCount < filteredArticles.length;

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    setTag("All");
    setVisibleCount(3);
  };

  const pulseLabel =
    scope === "Local"
      ? "Business Pulse: financing, policy, and growth strategies across Kenya."
      : "Business Pulse: trade, capital markets, and global industry signals.";

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-black/15 bg-gradient-to-r from-[#f0ece6] via-[#e7dfd2] to-[#ddd6c8] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Business Desk</p>
            <h1
              className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]"
              style={{ textShadow: "0 8px 22px rgba(148,106,64,0.22)" }}
            >
              Business
            </h1>
            <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
              Follow money, markets, and enterprise strategy with local and international lenses.
            </p>
          </div>
          <div className="flex gap-2 rounded border border-black/25 p-1">
            <MotionButton
              type="button"
              onClick={() => handleScopeChange("Local")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                scope === "Local" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              Local
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => handleScopeChange("International")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                scope === "International" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              International
            </MotionButton>
          </div>
        </div>

        <MotionDiv
          key={`pulse-${scope}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70"
        >
          {pulseLabel}
        </MotionDiv>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((itemTag) => (
            <button
              key={itemTag}
              type="button"
              onClick={() => {
                setTag(itemTag);
                setVisibleCount(3);
              }}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                tag === itemTag
                  ? "border-black bg-black text-white"
                  : "border-black/25 text-black/70 hover:bg-black/10"
              }`}
            >
              {itemTag}
            </button>
          ))}
        </div>

        {featured ? (
          <>
            <MotionDiv
              key={`${scope}-${tag}-layout`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="mt-5 grid gap-5 lg:items-start lg:grid-cols-[1.2fr_1fr]"
            >
              <MotionArticle whileHover={{ y: -4 }} className="overflow-hidden rounded border border-black/15 bg-white/35">
                <Link to={`/business/article/${featured.id}`} className="group block">
                  <img
                    src={resolveImageUrl(featured.image)}
                    alt={featured.title}
                    className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-96"
                  />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                      {featured.scope} <span className="px-2">-</span> {featured.tag}
                      <span className="px-2">-</span>
                      {featured.date}
                    </p>
                    <h2 className="pt-3 text-4xl leading-tight text-black/90 transition group-hover:text-black md:text-[42px]">
                      {featured.title}
                    </h2>
                    <p className="pt-4 text-black/75">{featured.summary}</p>
                  </div>
                </Link>
              </MotionArticle>

              <div className="grid content-start gap-5">
                {topSideItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <Link to={`/business/article/${article.id}`} className="group contents">
                      <img
                        src={resolveImageUrl(article.image)}
                        alt={article.title}
                        className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {article.tag} <span className="px-2">-</span> {article.date}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {article.title}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{article.summary}</p>
                      </div>
                    </Link>
                  </MotionArticle>
                ))}

                {sidebarFillItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="rounded border border-black/15 bg-white/30 p-4"
                  >
                    <Link to={`/business/article/${article.id}`} className="group block">
                      <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                        {article.tag} <span className="px-2">-</span> {article.date}
                      </p>
                      <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                        {article.title}
                      </h3>
                      <p className="pt-3 text-sm text-black/70">{article.summary}</p>
                    </Link>
                  </MotionArticle>
                ))}
              </div>
            </MotionDiv>

            {extraGridItems.length > 0 ? (
              <MotionDiv
                key={`${scope}-${tag}-more-${visibleCount}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-5 grid gap-5 md:grid-cols-2"
              >
                {extraGridItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <Link to={`/business/article/${article.id}`} className="group contents">
                      <img
                        src={resolveImageUrl(article.image)}
                        alt={article.title}
                        className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {article.tag} <span className="px-2">-</span> {article.date}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {article.title}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{article.summary}</p>
                      </div>
                    </Link>
                  </MotionArticle>
                ))}
              </MotionDiv>
            ) : null}

            {canLoadMore ? (
              <div className="mt-7 text-center">
                <MotionButton
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 2, filteredArticles.length))}
                  className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Load More
                </MotionButton>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded border border-black/15 bg-white/30 p-6 text-black/70">
            No stories found for this filter.
          </div>
        )}
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default Business;

