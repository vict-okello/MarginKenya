import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionButton = motion.button;

const containerVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
};

function normalizeStories(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return Object.values(input);
  return [];
}

function normalizeCategories(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return Object.values(input);
  return [];
}

export default function Sports() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const CATEGORY_PAGE_SIZE = 4;

  const [visibleCount, setVisibleCount] = useState(4);
  const [categoryStart, setCategoryStart] = useState(0);
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSports() {
      try {
        setLoadError("");
        const res = await fetch(`${API}/api/sports`);
        const json = await res.json().catch(() => []);
        if (!res.ok) {
          if (mounted) setLoadError("Failed to load sports feed.");
          return;
        }

        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted) setStories(normalizeStories(next));
      } catch {
        if (mounted) setLoadError("Live sports feed is unavailable.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (API) {
      loadSports();
    } else {
      setLoadError("VITE_API_URL is missing.");
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [API]);

  useEffect(() => {
    let mounted = true;

    async function loadSportsCategories() {
      try {
        const res = await fetch(`${API}/api/sports-categories`);
        const json = await res.json().catch(() => []);
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted) setCategories(normalizeCategories(next));
      } catch {
        if (mounted) setLoadError("Live sports categories are unavailable.");
      }
    }

    if (API) loadSportsCategories();
    return () => {
      mounted = false;
    };
  }, [API]);

  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return base ? `${base}${normalized}` : normalized;
    }
    return url;
  }

  const featured = stories[0] || null;
  const sideStories = stories.slice(1, 3);
  const feedStories = stories.slice(3);
  const visibleFeed = feedStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < feedStories.length;
  const hasCategoryPaging = categories.length > CATEGORY_PAGE_SIZE;
  const maxCategoryStart = Math.max(0, categories.length - CATEGORY_PAGE_SIZE);
  const safeCategoryStart = Math.min(categoryStart, maxCategoryStart);
  const visibleCategories = categories.slice(safeCategoryStart, safeCategoryStart + CATEGORY_PAGE_SIZE);

  function goPrevCategoryPage() {
    setCategoryStart((prev) => Math.max(0, Math.min(prev, maxCategoryStart) - CATEGORY_PAGE_SIZE));
  }

  function goNextCategoryPage() {
    setCategoryStart((prev) => Math.min(maxCategoryStart, Math.min(prev, maxCategoryStart) + CATEGORY_PAGE_SIZE));
  }

  const deskSignals = useMemo(() => {
    const categoriesCount = new Set(stories.map((item) => item.category).filter(Boolean)).size;
    return [
      { label: "Coverage", value: `${stories.length} stories` },
      { label: "Topic Lanes", value: `${Math.max(categories.length, categoriesCount)} active lanes` },
      { label: "Focus", value: "Football, Track, Motorsport" },
    ];
  }, [stories, categories.length]);

  if (loading) {
    return null;
  }

  if (!featured) {
    return (
      <section className="bg-[#d8d8dc] px-4 py-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-black/15 bg-white/45 p-8 text-black/75">
          No sports stories available.
        </div>
        <NewsletterBanner variant="sports" />
      </section>
    );
  }

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-[#d8d8dc] px-4 py-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#f0503a]/14 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#3a6df0]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border border-black/15 bg-gradient-to-r from-[#efebe4] via-[#e6dfd2] to-[#ddd6c8] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Sports Desk</p>
          <h1
            className="pt-1.5 text-4xl font-black uppercase tracking-[0.05em] text-black/90 md:text-5xl"
            style={{ textShadow: "0 8px 22px rgba(240,80,58,0.22)" }}
          >
            Sports
          </h1>
          <p className="max-w-3xl pt-2 text-sm text-black/70 md:text-[15px]">
            Match analysis, athlete stories, and momentum shifts across football, track, and motorsport.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {deskSignals.map((signal) => (
              <div key={signal.label} className="rounded-xl border border-black/15 bg-white/65 px-4 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.13em] text-black/55">{signal.label}</p>
                <p className="pt-0.5 text-sm font-semibold text-black/85">{signal.value}</p>
              </div>
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {loadError}
          </div>
        ) : null}

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.95fr]"
        >
          <Link to={`/sports/article/${featured.id}`} className="group block">
            <MotionArticle
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-black/20 bg-black"
            >
              <img
                src={resolveImageUrl(featured.image)}
                alt={featured.title}
                className="h-[320px] w-full bg-[#0f1114] p-2 object-contain transition duration-300 group-hover:scale-[1.02] md:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.13em] text-white backdrop-blur">
                {featured.category || "Sports"}
              </div>

              <div className="absolute bottom-0 p-6 text-white md:p-7">
                <p className="text-xs uppercase tracking-[0.13em] text-white/80">{featured.date || "Latest"}</p>
                <h2 className="pt-3 text-4xl leading-tight md:text-[46px]">
                  {featured.title}
                </h2>
                <p className="pt-3 max-w-2xl text-sm text-white/80 md:text-base">{featured.summary}</p>
              </div>
            </MotionArticle>
          </Link>

          <MotionDiv variants={itemVariants} className="grid gap-4 content-start">
            {sideStories.map((story) => (
              <Link key={story.id} to={`/sports/article/${story.id}`} className="group block">
                <MotionArticle
                  whileHover={{ y: -4 }}
                  className="grid gap-3 rounded-2xl border border-black/15 bg-white/55 p-3 sm:grid-cols-[170px_1fr]"
                >
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={resolveImageUrl(story.image)}
                      alt={story.title}
                      className="h-32 w-full bg-[#d7dbe1] p-1 object-contain transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">
                      {story.author || "Desk Editor"} <span className="px-2">-</span> {story.date || "Latest"}
                    </p>
                    <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                      {story.title}
                    </h3>
                    <p className="pt-2 text-sm text-black/70">{story.summary}</p>
                  </div>
                </MotionArticle>
              </Link>
            ))}

          </MotionDiv>
        </MotionDiv>

        {categories.length > 0 ? (
          <>
            {hasCategoryPaging ? (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={goPrevCategoryPage}
                  disabled={safeCategoryStart === 0}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    safeCategoryStart === 0
                      ? "cursor-not-allowed border-black/15 text-black/30"
                      : "border-black/25 bg-white/70 text-black/70 hover:bg-white"
                  }`}
                  aria-label="Previous categories"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={goNextCategoryPage}
                  disabled={safeCategoryStart >= maxCategoryStart}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    safeCategoryStart >= maxCategoryStart
                      ? "cursor-not-allowed border-black/15 text-black/30"
                      : "border-black/25 bg-white/70 text-black/70 hover:bg-white"
                  }`}
                  aria-label="Next categories"
                >
                  &rarr;
                </button>
              </div>
            ) : null}

            <MotionDiv
              key={safeCategoryStart}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            >
              {visibleCategories.map((category) => (
                <Link key={category.id} to={`/sports/category/${category.id}`} className="group block">
                  <MotionArticle
                    variants={itemVariants}
                    whileHover={{ y: -6 }}
                    className="overflow-hidden rounded-2xl border border-black/15 bg-white/60"
                  >
                    <img
                      src={resolveImageUrl(category.image)}
                      alt={category.name}
                      className="h-40 w-full bg-[#dde2e8] p-2 object-contain transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">Category</p>
                      <h3 className="pt-2 text-2xl leading-tight text-black/85">
                        {category.name}
                      </h3>
                      <p className="pt-2 text-sm text-black/70">{category.summary}</p>
                    </div>
                  </MotionArticle>
                </Link>
              ))}
            </MotionDiv>
          </>
        ) : null}

        {visibleFeed.length > 0 ? (
          <MotionDiv
            key={visibleCount}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {visibleFeed.map((story) => (
              <Link key={story.id} to={`/sports/article/${story.id}`} className="group block">
                <MotionArticle
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="relative h-full overflow-hidden rounded-2xl border border-black/15 bg-white/60"
                >
                  <img
                    src={resolveImageUrl(story.image)}
                    alt={story.title}
                    className="h-48 w-full bg-[#dde2e8] p-2 object-contain transition duration-300 group-hover:scale-[1.02]"
                  />

                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">
                      {story.category || "Sports"} <span className="px-2">-</span> {story.date || "Latest"}
                    </p>
                    <h3 className="pt-2 text-[31px] leading-tight text-black/85 transition group-hover:text-black">
                      {story.title}
                    </h3>
                    <p className="pt-3 text-sm text-black/68">{story.summary}</p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                      Read Story <span className="pl-2 text-base">+</span>
                    </span>
                  </div>
                </MotionArticle>
              </Link>
            ))}
          </MotionDiv>
        ) : null}

        {canLoadMore ? (
          <div className="mt-8 flex justify-center">
            <MotionButton
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, feedStories.length))}
              className="rounded-xl border border-black/20 bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
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
