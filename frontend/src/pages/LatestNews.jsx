import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";

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
  const API = API_BASE_URL;
  const [visibleCount, setVisibleCount] = useState(3);
  const [articles, setArticles] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadLatestNews() {
      try {
        setLoadError("");
        const res = await fetch(`${API}/api/latest-news`);
        const data = await res.json();
        if (!res.ok) return;
        const list = normalizeLatestNews(data);
        if (mounted) setArticles(list);
      } catch {
        if (mounted) setLoadError("Live latest news feed is unavailable.");
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
        {loadError ? (
          <div className="rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {loadError}
          </div>
        ) : null}

        {showHeader ? (
          <>
            <div className="flex items-center">
              <motion.h2
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                className="text-4xl font-black uppercase tracking-[0.05em] text-black/90"
              >
                Latest News
              </motion.h2>
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
                <MotionArticle className="grid grid-cols-1 gap-3 overflow-hidden rounded sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-4" whileHover={{ y: -6 }}>
                  <div className="min-w-0 my-auto">
                    <p className="break-words text-[28px] leading-tight text-black/85 transition group-hover:text-black sm:text-[32px]">
                      {sideOne.title}
                    </p>
                    <p className="pt-2 text-sm text-black/60">
                      {sideOne.category} - {sideOne.date}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded">
                    <img
                      src={sideOne.image}
                      alt={sideOne.title}
                      className="h-44 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02] sm:h-52"
                    />
                  </div>
                </MotionArticle>
              </Link>
            ) : null}

            {sideTwo ? (
              <Link
                to={`/latest-news/${sideTwo.id}`}
                className="group"
              >
                <MotionArticle className="grid grid-cols-1 gap-3 overflow-hidden rounded sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-4" whileHover={{ y: -6 }}>
                  <div className="min-w-0 my-auto">
                    <p className="break-words text-[28px] leading-tight text-black/85 transition group-hover:text-black sm:text-[32px]">
                      {sideTwo.title}
                    </p>
                    <p className="pt-2 text-sm text-black/60">
                      {sideTwo.category} - {sideTwo.date}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded">
                    <img
                      src={sideTwo.image}
                      alt={sideTwo.title}
                      className="h-44 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02] sm:h-52"
                    />
                  </div>
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
                <div className="overflow-hidden rounded">
                  <MotionImage
                    src={article.image}
                    alt={article.title}
                    className="h-56 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                    whileHover={{ scale: 1.03 }}
                  />
                </div>
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

        {remainingArticles.length > 0 ? (
          <div className="mt-6 flex justify-start">
            <MotionButton
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, remainingArticles.length))}
              disabled={!canLoadMore}
              className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                canLoadMore
                  ? "border-[#e25b4a]/45 bg-white/70 text-[#c94f40] hover:-translate-y-0.5 hover:border-[#c94f40] hover:bg-[#fff3f1] hover:text-[#a94033]"
                  : "cursor-not-allowed border-black/15 bg-white/35 text-black/35"
              }`}
              whileHover={canLoadMore ? { y: -2 } : {}}
              whileTap={canLoadMore ? { scale: 0.98 } : {}}
            >
              {canLoadMore ? "Load More" : "All Loaded"}
            </MotionButton>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}

export default LatestNews;

