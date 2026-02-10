import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import worldImage from "../assets/world.jpg";
import technologyImage from "../assets/technology.jpg";
import healthImage from "../assets/health.jpg";
import sportImage from "../assets/sport.jpg";

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

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const API = import.meta.env.VITE_API_URL;

  const [heroData, setHeroData] = useState(() => deepClone(DEFAULT_HERO));
  const [heroArticle, setHeroArticle] = useState(null);

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

  const fallbackStoryImageByTitle = useMemo(() => {
    return {
      "WORLD NEWS": worldImage,
      TECHNOLOGY: technologyImage,
      HEALTH: healthImage,
      SPORTS: sportImage,
    };
  }, []);

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
        // keep defaults
      }
    };

    loadHero();

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

  const topStories =
    Array.isArray(heroData.topStories) && heroData.topStories.length
      ? heroData.topStories
      : DEFAULT_HERO.topStories;

  const featured = heroData.featured || DEFAULT_HERO.featured;

  const featuredImageSrc = featured.imageUrl ? resolveUrl(featured.imageUrl) : "";

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className="bg-[#d8d8dc] px-4 pb-8 pt-5"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {topStories.slice(0, 4).map((story) => {
            const fallbackImg =
              fallbackStoryImageByTitle[story.title] || worldImage;
            const imageSrc = story.imageUrl
              ? resolveUrl(story.imageUrl)
              : fallbackImg;

            return (
              <Link
                key={`${story.title}-${story.to}`}
                to={story.to}
                className="group block"
              >
                <MotionArticle
                  variants={itemVariants}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  className="flex items-start gap-3"
                >
                  <MotionImg
                    src={imageSrc}
                    alt={story.title}
                    className="h-14 w-14 shrink-0 rounded object-cover"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  />
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
              {featured.imageUrl ? (
                <MotionImg
                  src={featuredImageSrc}
                  alt="Featured story"
                  className="h-[100px] w-full object-cover object-center sm:h-[300px] md:h-[420px]"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                />
              ) : null}
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
          className="flex flex-wrap items-center justify-between gap-3 pt-4"
        >
          <div className="flex items-center gap-2">
            <span className="rounded border border-black/40 px-3 py-1 text-xs font-medium uppercase text-black/80">
              {featured.category || "Category"}
            </span>
            <span className="rounded border border-black/40 px-3 py-1 text-xs font-medium uppercase text-black/80">
              {featured.author || "Author"}
            </span>
          </div>
          <p className="text-xs text-black/70">
            {(featured.date || "Date")} • {(featured.readTime || "Read time")}
          </p>
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.38,
            delay: prefersReducedMotion ? 0 : 0.28,
            ease: "easeOut",
          }}
          className="flex flex-col justify-between gap-4 pt-3 md:flex-row md:items-start"
        >
          <div className="w-full md:flex-1">
            <Link to={`/hero/article/${featuredArticleId}`} className="block">
              <h1 className="text-3xl leading-tight text-black/85 transition hover:text-black md:text-[42px]">
                {featured.headline ||
                  "A deep dive into the influence of cultural movements on contemporary society"}
              </h1>
            </Link>

            {heroArticle?.summary?.trim() ? (
              <p className="mt-4 w-full text-[17px] leading-relaxed text-black/75 line-clamp-3">
                {heroArticle.summary}
              </p>
            ) : null}
          </div>

          <Link
            to={`/hero/article/${featuredArticleId}`}
            className="pt-1 text-sm text-black/75 transition hover:text-black md:shrink-0"
          >
            {featured.ctaText || "Read Article ->"}
          </Link>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default Hero;