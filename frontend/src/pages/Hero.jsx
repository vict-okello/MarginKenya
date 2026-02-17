import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { API_BASE_URL } from "../config/api";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionImg = motion.img;

const DEFAULT_HERO = {
  featuredArticleId: "cultural-movements-deep-dive",
  topStories: [
    {
      title: "WORLD NEWS",
      blurb: "Economic policies are shaping international markets",
      to: "/worldnews",
      imageUrl: "",
    },
    {
      title: "TECHNOLOGY",
      blurb: "The latest trends in AI and innovation",
      to: "/technology",
      imageUrl: "",
    },
    {
      title: "HEALTH",
      blurb: "Analyzing the effects of global health policies",
      to: "/health",
      imageUrl: "",
    },
    {
      title: "SPORTS",
      blurb: "Affect the integrity and future of professional sports",
      to: "/sports",
      imageUrl: "",
    },
  ],
  featured: {
    imageUrl: "",
    category: "Culture",
    author: "Guy Hawkins",
    date: "Sep 9, 2024",
    readTime: "6 min read",
    headline:
      "A deep dive into the influence of cultural movements on contemporary society",
    ctaText: "Read Article ->",
  },
};

function isHttp(url) {
  return /^https?:\/\//i.test(url);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeRoute(route, fallbackRoute = "/") {
  const value = `${route || ""}`.trim();
  if (!value) return fallbackRoute;
  return value.startsWith("/") ? value : `/${value}`;
}

function Hero({ withSection = true }) {
  const prefersReducedMotion = useReducedMotion();
  const API = API_BASE_URL;

  const [heroData, setHeroData] = useState(() => deepClone(DEFAULT_HERO));
  const [heroArticle, setHeroArticle] = useState(null);
  const [loadingHero, setLoadingHero] = useState(true);

  const resolveUrl = useMemo(() => {
    return (url) => {
      if (!url) return "";
      if (isHttp(url)) return url;
      if (!API) return url;
      return `${API}${url}`;
    };
  }, [API]);

  const containerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.4, staggerChildren: 0.08 },
        },
      };

  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      };

  // Load hero layout/settings
  useEffect(() => {
    let alive = true;

    const loadHero = async () => {
      try {
        if (!API) return;

        const res = await fetch(`${API}/api/hero`);
        if (!res.ok) return;

        const data = await res.json();
        if (!alive) return;

        const merged = deepClone(DEFAULT_HERO);

        if (data?.featuredArticleId) merged.featuredArticleId = data.featuredArticleId;

        if (Array.isArray(data?.topStories)) {
          merged.topStories = data.topStories.slice(0, 4).map((s, idx) => ({
            title: s?.title ?? DEFAULT_HERO.topStories[idx]?.title ?? "",
            blurb: s?.blurb ?? "",
            to: s?.to ?? DEFAULT_HERO.topStories[idx]?.to ?? "",
            imageUrl: s?.imageUrl ?? "",
          }));
          while (merged.topStories.length < 4) {
            merged.topStories.push(
              deepClone(DEFAULT_HERO.topStories[merged.topStories.length])
            );
          }
        }

        if (data?.featured && typeof data.featured === "object") {
          merged.featured = {
            imageUrl: data.featured.imageUrl ?? "",
            category: data.featured.category ?? DEFAULT_HERO.featured.category,
            author: data.featured.author ?? DEFAULT_HERO.featured.author,
            date: data.featured.date ?? DEFAULT_HERO.featured.date,
            readTime: data.featured.readTime ?? DEFAULT_HERO.featured.readTime,
            headline: data.featured.headline ?? DEFAULT_HERO.featured.headline,
            ctaText: data.featured.ctaText ?? DEFAULT_HERO.featured.ctaText,
          };
        }

        setHeroData(merged);
      } catch {
      } finally {
        if (alive) setLoadingHero(false);
      }
    };

    if (API) {
      loadHero();
    } else {
      setLoadingHero(false);
    }

    return () => {
      alive = false;
    };
  }, [API]);

  // Load the actual featured hero article (for summary)
  useEffect(() => {
    let alive = true;

    const loadHeroArticle = async () => {
      try {
        if (!API) return;

        const id = (heroData?.featuredArticleId || "").trim();
        if (!id) {
          setHeroArticle(null);
          return;
        }

        const res = await fetch(`${API}/api/hero-articles/${id}`);
        if (!res.ok) {
          setHeroArticle(null);
          return;
        }

        const data = await res.json();
        if (!alive) return;

        setHeroArticle(data);
      } catch {
        setHeroArticle(null);
      }
    };

    loadHeroArticle();

    return () => {
      alive = false;
    };
  }, [API, heroData?.featuredArticleId]);

  const featuredArticleId =
    heroData.featuredArticleId || DEFAULT_HERO.featuredArticleId;

  const topStories = Array.isArray(heroData.topStories) ? heroData.topStories : [];

  const featured = heroData.featured || DEFAULT_HERO.featured;
  const ctaLabel = (featured.ctaText || "Read Article")
    .replace(/\s*[-=]*>\s*$/, "")
    .trim();

  const featuredImageSrc = resolveUrl(featured.imageUrl || "");

  if (loadingHero) {
    return null;
  }

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className={withSection ? "bg-[#d8d8dc] px-4 pb-8 pt-5" : ""}
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {topStories.slice(0, 4).map((story, idx) => {
            const imageSrc = resolveUrl(story.imageUrl || "");
            const to = normalizeRoute(story.to, DEFAULT_HERO.topStories[idx]?.to || "/");

            return (
              <Link
                key={`${story.title}-${story.to}`}
                to={to}
                className="group block"
              >
                <MotionArticle
                  variants={itemVariants}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  className="flex items-start gap-3"
                >
                  {imageSrc ? (
                    <MotionImg
                      src={imageSrc}
                      alt={story.title}
                      className="h-14 w-14 shrink-0 rounded object-cover"
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded bg-black/10" />
                  )}
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-black transition group-hover:text-black/90">
                      {story.title}
                    </h3>
                    <p className="pt-1 text-xs leading-snug text-black/75 transition group-hover:text-black/90">
                      {story.blurb}
                    </p>
                  </div>
                </MotionArticle>
              </Link>
            );
          })}
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.45,
            delay: prefersReducedMotion ? 0 : 0.15,
            ease: "easeOut",
          }}
        >
          <Link to={`/hero/article/${featuredArticleId}`} className="block">
            <div className="relative overflow-hidden rounded-[2px] bg-white/70">
              {featuredImageSrc ? (
                <MotionImg
                  src={featuredImageSrc}
                  alt={featured.headline || "Featured story"}
                  className="h-[100px] w-full object-cover object-center sm:h-[300px] md:h-[420px]"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                />
              ) : (
                <div className="h-[100px] w-full bg-black/10 sm:h-[300px] md:h-[420px]" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </Link>
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.35,
            delay: prefersReducedMotion ? 0 : 0.22,
            ease: "easeOut",
          }}
          className="mt-4 rounded-2xl border border-black/10 bg-white/65 px-4 py-3 shadow-[0_8px_24px_rgba(20,20,20,0.06)] backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-black/35 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/80">
                {featured.category || "Category"}
              </span>
              <span className="rounded-full border border-black/35 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/80">
                {featured.author || "Author"}
              </span>
            </div>
            <p className="text-xs font-medium text-black/70">
              {(featured.date || "Date")} | {(featured.readTime || "Read time")}
            </p>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.38,
            delay: prefersReducedMotion ? 0 : 0.28,
            ease: "easeOut",
          }}
          className="mt-4 flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-white/85 to-white/65 px-4 py-5 shadow-[0_12px_32px_rgba(20,20,20,0.08)] md:flex-row md:items-start md:px-6"
        >
          <div className="w-full md:flex-1">
            <Link to={`/hero/article/${featuredArticleId}`} className="block">
              <h1 className="text-3xl font-semibold leading-[1.12] tracking-[-0.01em] text-black/90 transition hover:text-black md:text-[46px]">
                {featured.headline ||
                  "A deep dive into the influence of cultural movements on contemporary society"}
              </h1>
            </Link>

            {heroArticle?.summary?.trim() ? (
              <p className="mt-4 w-full max-w-4xl text-[18px] leading-relaxed text-black/75 line-clamp-4">
                {heroArticle.summary}
              </p>
            ) : null}
          </div>

          <Link
            to={`/hero/article/${featuredArticleId}`}
            className="group mt-1 inline-flex items-center gap-3 self-start rounded-full border border-[#e25b4a]/45 bg-white/90 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c94f40] transition hover:-translate-y-0.5 hover:border-[#c94f40] hover:bg-[#fff3f1] hover:text-[#a94033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25b4a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#d8d8dc] md:shrink-0"
          >
            <span>{ctaLabel || "Read Article"}</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e25b4a] text-[10px] font-bold text-white transition group-hover:translate-x-0.5 group-hover:bg-[#c94f40]">
              -&gt;
            </span>
          </Link>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default Hero;
