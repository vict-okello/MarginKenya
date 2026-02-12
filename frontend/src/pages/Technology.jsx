import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { technologyArticles } from "../data/technologyArticles";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionImage = motion.img;
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
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

export default function Technology() {
  const [visibleCount, setVisibleCount] = useState(3);

  const featuredArticle = technologyArticles[0];
  const spotlightStories = technologyArticles.slice(1, 3);
  const feedStories = technologyArticles.slice(3);
  const visibleFeed = feedStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < feedStories.length;

  const deskSignals = useMemo(() => {
    const contributors = new Set(technologyArticles.map((item) => item.author).filter(Boolean)).size;
    return [
      { label: "Coverage", value: `${technologyArticles.length} stories` },
      { label: "Active Topics", value: "AI, Security, Cloud" },
      { label: "Contributors", value: `${contributors} writer${contributors === 1 ? "" : "s"}` },
    ];
  }, []);

  const topicLanes = ["AI Systems", "Cybersecurity", "Data Platforms", "Consumer Tech"];

  if (!featuredArticle) {
    return (
      <section className="bg-[#d4dae0] px-4 py-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-black/15 bg-white/45 p-8 text-black/75">
          No technology stories available.
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
      className="relative overflow-hidden bg-[#d4dae0] px-4 py-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#75d2f7]/20 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#ff8f5a]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border border-black/15 bg-gradient-to-r from-[#e4edf3] via-[#d6e3ec] to-[#ccdce8] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Technology Desk</p>
          <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:ui-monospace,SFMono-Regular,Menlo,monospace]">
            Technology
          </h1>
          <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
            Product launches, AI shifts, and the infrastructure bets defining what comes next.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {deskSignals.map((signal) => (
              <div key={signal.label} className="rounded-xl border border-black/15 bg-white/65 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.13em] text-black/55">{signal.label}</p>
                <p className="pt-1 text-sm font-semibold text-black/85">{signal.value}</p>
              </div>
            ))}
          </div>
        </div>

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.95fr]"
        >
          <Link to={`/technology/article/${featuredArticle.id}`} className="group block">
            <MotionArticle
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-black/20 bg-black"
            >
              <MotionImage
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="h-[320px] w-full object-cover md:h-[460px]"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.32 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.13em] text-white backdrop-blur">
                {featuredArticle.category}
              </div>

              <div className="absolute bottom-0 p-6 text-white md:p-7">
                <p className="text-xs uppercase tracking-[0.13em] text-white/80">{featuredArticle.date}</p>
                <h2 className="pt-3 text-4xl leading-tight md:text-[46px] [font-family:Georgia,Times,serif]">
                  {featuredArticle.title}
                </h2>
                <p className="pt-3 max-w-2xl text-sm text-white/80 md:text-base">{featuredArticle.summary}</p>
              </div>
            </MotionArticle>
          </Link>

          <MotionDiv variants={itemVariants} className="grid gap-4">
            {spotlightStories.map((article) => (
              <Link key={article.id} to={`/technology/article/${article.id}`} className="group block">
                <MotionArticle
                  whileHover={{ y: -4 }}
                  className="grid gap-3 rounded-2xl border border-black/15 bg-white/55 p-3 sm:grid-cols-[170px_1fr]"
                >
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">
                      {article.author} <span className="px-2">-</span> {article.date}
                    </p>
                    <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black [font-family:Georgia,Times,serif]">
                      {article.title}
                    </h3>
                    <p className="pt-2 text-sm text-black/70">{article.summary}</p>
                  </div>
                </MotionArticle>
              </Link>
            ))}

            <div className="rounded-2xl border border-black/15 bg-[#dbe3ea] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/60">Topic Lanes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topicLanes.map((lane) => (
                  <span
                    key={lane}
                    className="rounded-full border border-black/20 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/70"
                  >
                    {lane}
                  </span>
                ))}
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>

        {visibleFeed.length > 0 ? (
          <MotionDiv
            key={visibleCount}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {visibleFeed.map((article) => (
              <Link key={article.id} to={`/technology/article/${article.id}`} className="group block">
                <MotionArticle
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="relative h-full overflow-hidden rounded-2xl border border-black/15 bg-white/60"
                >
                  <div className="absolute right-0 top-0 h-14 w-14 bg-gradient-to-bl from-[#ff8f5a]/30 to-transparent" />
                  <MotionImage
                    src={article.image}
                    alt={article.title}
                    className="h-48 w-full object-cover"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.28 }}
                  />

                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">
                      {article.category} <span className="px-2">-</span> {article.date}
                    </p>
                    <h3 className="pt-2 text-[31px] leading-tight text-black/85 transition group-hover:text-black [font-family:Georgia,Times,serif]">
                      {article.title}
                    </h3>
                    <p className="pt-3 text-sm text-black/68">{article.summary}</p>
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
