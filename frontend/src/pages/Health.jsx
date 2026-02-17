import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { healthArticles } from "../data/healthArticles";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionImage = motion.img;
const MotionButton = motion.button;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function limitChars(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}

function Health() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const batchSize = 3;
  const [visibleCount, setVisibleCount] = useState(3);
  const [stories, setStories] = useState(healthArticles);
  const [publishedCount, setPublishedCount] = useState(null);
  const [loadError, setLoadError] = useState("");

  const resolveImageUrl = useCallback((url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return base ? `${base}${normalized}` : normalized;
    }
    return url;
  }, [base]);

  useEffect(() => {
    let mounted = true;

    async function loadHealth() {
      try {
        setLoadError("");
        const res = await fetch(`${API}/api/health-news`);
        const json = await res.json();
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        const liveCount = next.filter((item) => String(item?.title || "").trim().length > 0).length;
        if (mounted) {
          setPublishedCount(liveCount);
          setStories(next);
        }
      } catch {
        if (mounted) setLoadError("Live health feed is unavailable. Showing fallback content.");
      }
    }

    if (API) loadHealth();
    return () => {
      mounted = false;
    };
  }, [API]);

  const lead = stories[0];
  const secondary = stories.slice(1, 3);
  const rest = stories.slice(3);
  const visibleRest = rest.slice(0, visibleCount);
  const canLoadMore = visibleCount < rest.length;

  useEffect(() => {
    const upcoming = rest.slice(visibleCount, visibleCount + batchSize);
    upcoming.forEach((item) => {
      const img = new Image();
      img.src = resolveImageUrl(item.image);
    });
  }, [visibleCount, rest, resolveImageUrl]);

  const quickStats = useMemo(
    () => [
      { label: "Focus", value: "Public Health" },
      { label: "Coverage", value: `${publishedCount ?? stories.length} stories` },
      { label: "Update Cycle", value: "Daily" },
    ],
    [publishedCount, stories.length]
  );

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden bg-[#d7dddf] px-4 py-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#7ec8c4]/30 blur-2xl" />
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-black/15 bg-gradient-to-r from-[#eaf3f2] via-[#d9e8e6] to-[#d4e1df] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Health Desk</p>
          <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]">
            Health News
          </h1>
          <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
            Clinical breakthroughs, policy shifts, and practical wellness intelligence for communities and decision-makers.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-black/15 bg-white/60 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-black/55">{stat.label}</p>
                <p className="pt-1 text-sm font-semibold text-black/85">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {loadError}
          </div>
        ) : null}

        {lead ? (
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_1fr]"
          >
            <MotionArticle variants={itemVariants} className="overflow-hidden rounded-2xl border border-black/15 bg-white/55">
              <Link to={`/health/article/${lead.id}`} className="group block">
                <MotionImage
                  src={resolveImageUrl(lead.image)}
                  alt={lead.title}
                  className="h-[300px] w-full object-cover md:h-[430px]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.32 }}
                />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.13em] text-black/55">
                    Lead Story <span className="px-2">-</span> {lead.date}
                  </p>
                  <h2 className="pt-3 text-4xl leading-tight text-black/90 md:text-[44px] [font-family:Georgia,Times,serif]">
                    {lead.title}
                  </h2>
                  <p className="pt-4 text-black/75">{limitChars(lead.summary, 220)}</p>
                  <p className="pt-3 text-sm text-black/60">{lead.author}</p>
                </div>
              </Link>
            </MotionArticle>

            <div className="grid gap-5">
              {secondary.map((story) => (
                <MotionArticle
                  key={story.id}
                  variants={itemVariants}
                  className="grid gap-4 rounded-2xl border border-black/15 bg-white/45 p-4 sm:grid-cols-[150px_1fr]"
                >
                  <Link to={`/health/article/${story.id}`} className="group contents">
                    <img
                      src={resolveImageUrl(story.image)}
                      alt={story.title}
                      className="h-36 w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.13em] text-black/55">{story.date}</p>
                      <h3 className="pt-2 text-2xl leading-tight text-black/85">{story.title}</h3>
                      <p className="pt-2 text-sm text-black/70">{limitChars(story.summary, 140)}</p>
                    </div>
                  </Link>
                </MotionArticle>
              ))}
            </div>
          </MotionDiv>
        ) : null}

        {visibleRest.length > 0 ? (
          <MotionDiv
            key={visibleCount}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {visibleRest.map((story) => (
              <MotionArticle
                key={story.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-black/15 bg-white/45 p-3"
              >
                <Link to={`/health/article/${story.id}`} className="group block">
                  <img
                    src={resolveImageUrl(story.image)}
                    alt={story.title}
                    className="h-48 w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <p className="pt-3 text-xs uppercase tracking-[0.13em] text-black/55">{story.date}</p>
                  <h3 className="pt-2 text-[30px] leading-tight text-black/85">{story.title}</h3>
                  <p className="pt-2 text-sm text-black/65">{story.author}</p>
                </Link>
              </MotionArticle>
            ))}
          </MotionDiv>
        ) : null}

        {canLoadMore ? (
          <div className="mt-8 text-center">
            <MotionButton
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + batchSize, rest.length))}
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              Load More
            </MotionButton>
          </div>
        ) : null}
      </div>

      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}

export default Health;
