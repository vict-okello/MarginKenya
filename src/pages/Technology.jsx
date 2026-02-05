import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { technologyArticles } from "../data/technologyArticles";

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
    transition: { duration: 0.55, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function Technology() {
  const [visibleCount, setVisibleCount] = useState(5);
  const featuredArticle = technologyArticles[0];
  const remainingArticles = technologyArticles.slice(1);
  const primaryCards = remainingArticles.slice(0, 2);
  const extraCards = remainingArticles.slice(2, visibleCount);
  const canLoadMore = visibleCount < remainingArticles.length;

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="pb-5">
          <h1 className="text-5xl font-semibold uppercase tracking-wide text-black/85 md:text-6xl">
            Technology
          </h1>
          <p className="pt-2 text-sm text-black/65">
            Product launches, AI shifts, and the ideas shaping what comes next.
          </p>
        </div>

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_1fr]"
        >
          <MotionDiv variants={itemVariants} className="grid gap-5 sm:grid-cols-2">
            {primaryCards.map((article) => (
              <Link
                key={article.id}
                to={`/technology/article/${article.id}`}
                className="group"
              >
                <MotionArticle whileHover={{ y: -6 }} className="h-full">
                  <MotionImage
                    src={article.image}
                    alt={article.title}
                    className="h-44 w-full rounded object-cover"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="pt-3 text-[10px] uppercase tracking-wide text-black/60">
                    {article.category} <span className="px-2">-</span> {article.date}
                  </div>
                  <h2 className="pt-2 text-[31px] leading-tight text-black/85 transition group-hover:text-black md:text-[33px]">
                    {article.title}
                  </h2>
                </MotionArticle>
              </Link>
            ))}
          </MotionDiv>

          <Link
            to={`/technology/article/${featuredArticle.id}`}
            className="group"
          >
            <MotionArticle variants={itemVariants} whileHover={{ y: -6 }} className="relative overflow-hidden rounded">
              <MotionImage
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="h-full min-h-[360px] w-full object-cover"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full bg-[#f39a55] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-black/80">
                {featuredArticle.author}
              </div>
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-wide text-white/80">{featuredArticle.date}</p>
                <h2 className="pt-3 text-4xl leading-tight transition group-hover:text-white md:text-[42px]">
                  {featuredArticle.title}
                </h2>
              </div>
            </MotionArticle>
          </Link>
        </MotionDiv>

        {extraCards.length > 0 ? (
          <MotionDiv
            key={visibleCount}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {extraCards.map((article) => (
              <Link
                key={article.id}
                to={`/technology/article/${article.id}`}
                className="group"
              >
                <MotionArticle variants={itemVariants} whileHover={{ y: -6 }}>
                  <MotionImage
                    src={article.image}
                    alt={article.title}
                    className="h-52 w-full rounded object-cover"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="pt-3 text-[10px] uppercase tracking-wide text-black/60">
                    {article.category} <span className="px-2">-</span> {article.date}
                  </div>
                  <h2 className="pt-2 text-[31px] leading-tight text-black/85 transition group-hover:text-black md:text-[33px]">
                    {article.title}
                  </h2>
                </MotionArticle>
              </Link>
            ))}
          </MotionDiv>
        ) : null}

        {canLoadMore ? (
          <div className="mt-8 flex justify-center">
            <MotionButton
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, remainingArticles.length))}
              className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Load More
            </MotionButton>
          </div>
        ) : null}
      </div>
    </MotionSection>
  );
}

export default Technology;



