import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { latestNewsArticles } from "../data/latestNewsArticles";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionImage = motion.img;
const MotionButton = motion.button;

const gridVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function normalizeLatestNews(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return list.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    category: item?.category || "Latest News",
    date: item?.date || new Date().toISOString().slice(0, 10),
    image: item?.image || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
  }));
}

function LatestNews({ withSection = true, showHeader = true }) {
  const API = import.meta.env.VITE_API_URL;
  const [visibleCount, setVisibleCount] = useState(3);
  const [articles, setArticles] = useState(latestNewsArticles);

  useEffect(() => {
    let mounted = true;

    async function loadLatestNews() {
      try {
        const res = await fetch(`${API}/api/latest-news`);
        const data = await res.json();
        if (!res.ok) return;
        const list = normalizeLatestNews(data);
        if (mounted && list.length > 0) setArticles(list);
      } catch {
        // Keep static fallback data when API is unavailable.
      }
    }

    if (API) loadLatestNews();
    return () => {
      mounted = false;
    };
  }, [API]);

  const resolvedArticles = useMemo(() => {
    return articles.map((item) => ({
      ...item,
      image:
        item?.image && /^https?:\/\//i.test(item.image)
          ? item.image
          : item?.image && API
            ? `${API}${item.image}`
            : item?.image || "",
    }));
  }, [articles, API]);

  const [featured, sideOne, sideTwo] = resolvedArticles;
  const remainingArticles = resolvedArticles.slice(3);
  const bottomRow = remainingArticles.slice(0, visibleCount);
  const canLoadMore = visibleCount < remainingArticles.length;

  const Wrapper = withSection ? MotionSection : MotionDiv;

  if (!featured) {
    return (
      <section className="bg-[#d8d8dc] px-4 pb-10">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-4xl font-black uppercase tracking-[0.05em] text-black/90">Latest News</h2>
          <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
          <p className="pt-3 text-black/65">No articles available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <Wrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={withSection ? "bg-[#d8d8dc] px-4 pb-10" : ""}
    >
      <div className="mx-auto w-full max-w-5xl">
        {showHeader ? (
          <>
            <div className="flex items-center justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                className="text-4xl font-black uppercase tracking-[0.05em] text-black/90"
              >
                Latest News
              </motion.h2>
              {remainingArticles.length > 0 ? (
                <MotionButton
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 3, remainingArticles.length))}
                  disabled={!canLoadMore}
                  className={`text-sm transition ${
                    canLoadMore
                      ? "text-black/70 hover:text-black"
                      : "cursor-not-allowed text-black/35"
                  }`}
                  whileHover={canLoadMore ? { y: -2, scale: 1.04 } : {}}
                  whileTap={canLoadMore ? { scale: 0.96 } : {}}
                >
                  {canLoadMore ? "Load More \u25cb" : "All Loaded"}
                </MotionButton>
              ) : null}
            </div>
            <div className="mt-3 h-px w-full bg-black/30" />
          </>
        ) : null}

        <MotionDiv
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]"
        >
          <Link
            to={`/latest-news/${featured.id}`}
            className="group"
          >
            <MotionArticle variants={itemVariants} className="relative overflow-hidden rounded" whileHover={{ y: -6 }}>
              <MotionImage
                src={featured.image}
                alt={featured.title}
                className="h-[280px] w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-[430px]"
                whileHover={{ scale: 1.03 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="text-4xl leading-tight">{featured.title}</p>
                <p className="pt-2 text-sm text-white/80">
                  {featured.category} - {featured.date}
                </p>
              </div>
            </MotionArticle>
          </Link>

          <MotionDiv variants={itemVariants} className="grid gap-5">
            {sideOne ? (
              <Link
                to={`/latest-news/${sideOne.id}`}
                className="group"
              >
                <MotionArticle className="grid grid-cols-[1fr_180px] gap-4 rounded" whileHover={{ y: -6 }}>
                  <div className="my-auto">
                    <p className="text-[32px] leading-tight text-black/85 transition group-hover:text-black">
                      {sideOne.title}
                    </p>
                    <p className="pt-2 text-sm text-black/60">
                      {sideOne.category} - {sideOne.date}
                    </p>
                  </div>
                  <img
                    src={sideOne.image}
                    alt={sideOne.title}
                    className="h-52 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </MotionArticle>
              </Link>
            ) : null}

            {sideTwo ? (
              <Link
                to={`/latest-news/${sideTwo.id}`}
                className="group"
              >
                <MotionArticle className="grid grid-cols-[1fr_180px] gap-4 rounded" whileHover={{ y: -6 }}>
                  <div className="my-auto">
                    <p className="text-[32px] leading-tight text-black/85 transition group-hover:text-black">
                      {sideTwo.title}
                    </p>
                    <p className="pt-2 text-sm text-black/60">
                      {sideTwo.category} - {sideTwo.date}
                    </p>
                  </div>
                  <img
                    src={sideTwo.image}
                    alt={sideTwo.title}
                    className="h-52 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </MotionArticle>
              </Link>
            ) : null}
          </MotionDiv>
        </MotionDiv>

        <MotionDiv
          key={visibleCount}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 md:grid-cols-3"
        >
          {bottomRow.map((article) => (
            <Link
              key={article.id}
              to={`/latest-news/${article.id}`}
              className="group"
            >
              <MotionArticle variants={itemVariants} whileHover={{ y: -8 }}>
                <MotionImage
                  src={article.image}
                  alt={article.title}
                  className="h-56 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                  whileHover={{ scale: 1.03 }}
                />
                <p className="pt-3 text-[32px] leading-tight text-black/85 transition group-hover:text-black">
                  {article.title}
                </p>
                <p className="pt-2 text-sm text-black/60">
                  {article.category} - {article.date}
                </p>
              </MotionArticle>
            </Link>
          ))}
        </MotionDiv>
      </div>
    </Wrapper>
  );
}

export default LatestNews;

