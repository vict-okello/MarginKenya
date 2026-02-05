import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { healthArticles } from "../data/healthArticles";

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const MotionSection = motion.section;
const MotionTitle = motion.h1;
const MotionGrid = motion.div;
const MotionCard = motion.article;
const MotionImage = motion.img;
const MotionWrap = motion.div;
const MotionButton = motion.button;

function Health() {
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleNews = healthArticles.slice(0, visibleCount);
  const canLoadMore = visibleCount < healthArticles.length;

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionTitle
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-4xl font-semibold uppercase tracking-wide text-black/85 md:text-[40px]"
        >
          Health News
        </MotionTitle>
        <div className="mt-4 h-px w-full bg-black/30" />

        <MotionGrid
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {visibleNews.map((item) => (
            <MotionCard
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.22 } }}
              className="will-change-transform"
            >
              <Link
                to={`/health/article/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <MotionImage
                  src={item.image}
                  alt={item.title}
                  className="h-52 w-full rounded object-cover object-center"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                <p className="pt-3 text-[32px] leading-tight text-black/85 md:text-[31px]">{item.title}</p>

                <div className="pt-2 text-sm text-black/65">
                  <span>{item.author}</span>
                  <span className="px-3">-</span>
                  <span>{item.date}</span>
                </div>
              </Link>
            </MotionCard>
          ))}
        </MotionGrid>

        {canLoadMore ? (
          <MotionWrap
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mt-8 flex justify-center"
          >
            <MotionButton
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, healthArticles.length))}
              className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              Load more
            </MotionButton>
          </MotionWrap>
        ) : null}
      </div>
    </MotionSection>
  );
}

export default Health;
