import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { politicsDesk as staticPoliticsDesk } from "../data/politicsArticles";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionButton = motion.button;

function normalizeDesk(payload) {
  return {
    local: Array.isArray(payload?.local) ? payload.local : [],
    international: Array.isArray(payload?.international) ? payload.international : [],
  };
}

function Politics() {
  const API = import.meta.env.VITE_API_URL;
  const [desk, setDesk] = useState("local");
  const [politicsDesk, setPoliticsDesk] = useState(staticPoliticsDesk);
  const [visibleCounts, setVisibleCounts] = useState({
    local: 3,
    international: 3,
  });

  const resolveImageUrl = useMemo(() => {
    const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
    return (url) => {
      if (!url) return "";
      if (/^https?:\/\//i.test(url)) return url;
      return base ? `${base}${url}` : url;
    };
  }, [API]);

  useEffect(() => {
    let alive = true;

    async function loadPolitics() {
      try {
        const res = await fetch(`${API}/api/politics`, { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        if (!alive) return;
        const next = normalizeDesk(json);
        if (next.local.length || next.international.length) {
          setPoliticsDesk(next);
        }
      } catch {
        // Keep static fallback on failure.
      }
    }

    if (API) loadPolitics();
    return () => {
      alive = false;
    };
  }, [API]);

  const activeStories = politicsDesk[desk];
  const visibleCount = visibleCounts[desk];
  const visibleStories = activeStories.slice(0, visibleCount);
  const leadStory = visibleStories[0];
  const topSideStories = visibleStories.slice(1, 3);
  const extraStories = visibleStories.slice(3);
  const canLoadMore = visibleCount < activeStories.length;

  const pulseText = useMemo(
    () =>
      desk === "local"
        ? "Local Pulse: county assemblies, parliament, and grassroots civic movements."
        : "Global Pulse: diplomacy, multilateral policy shifts, and election watch.",
    [desk]
  );

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-black/15 bg-gradient-to-r from-[#f1e8e8] via-[#e8dbdb] to-[#dfd1d1] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Politics Desk</p>
            <h1
              className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]"
              style={{ textShadow: "0 8px 22px rgba(185,83,83,0.22)" }}
            >
              Politics
            </h1>
            <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
              A two-lens newsroom: track local power shifts and international strategy from one desk.
            </p>
          </div>
          <div className="flex gap-2 rounded border border-black/25 p-1">
            <MotionButton
              type="button"
              onClick={() => setDesk("local")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                desk === "local" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              Local News
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => setDesk("international")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                desk === "international" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              International
            </MotionButton>
          </div>
        </div>

        <MotionDiv
          key={desk}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70"
        >
          {pulseText}
        </MotionDiv>

        <MotionDiv
          key={`${desk}-grid`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]"
        >
          <MotionArticle
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded border border-black/15 bg-white/40"
          >
            <Link to={`/politics/article/${leadStory.id}`} className="group block">
              <img
                src={resolveImageUrl(leadStory.image)}
                alt={leadStory.title}
                className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-96"
              />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                  {leadStory.tag} <span className="px-2">-</span> {leadStory.date}
                </p>
                <h2 className="pt-3 text-4xl leading-tight text-black/90 transition group-hover:text-black md:text-[42px]">
                  {leadStory.title}
                </h2>
                <p className="pt-4 text-black/75">{leadStory.summary}</p>
              </div>
            </Link>
          </MotionArticle>

          <div className="grid gap-5">
            {topSideStories.map((story) => (
              <MotionArticle
                key={story.id}
                whileHover={{ y: -4 }}
                className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
              >
                <Link to={`/politics/article/${story.id}`} className="group contents">
                  <img
                    src={resolveImageUrl(story.image)}
                    alt={story.title}
                    className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                      {story.tag} <span className="px-2">-</span> {story.date}
                    </p>
                    <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                      {story.title}
                    </h3>
                    <p className="pt-3 text-sm text-black/70">{story.summary}</p>
                  </div>
                </Link>
              </MotionArticle>
            ))}
          </div>
        </MotionDiv>

        {extraStories.length > 0 ? (
          <MotionDiv
            key={`${desk}-extras-${visibleCount}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-5 grid gap-5 md:grid-cols-2"
          >
            {extraStories.map((story) => (
              <MotionArticle
                key={story.id}
                whileHover={{ y: -4 }}
                className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
              >
                <Link to={`/politics/article/${story.id}`} className="group contents">
                  <img
                    src={resolveImageUrl(story.image)}
                    alt={story.title}
                    className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                      {story.tag} <span className="px-2">-</span> {story.date}
                    </p>
                    <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                      {story.title}
                    </h3>
                    <p className="pt-3 text-sm text-black/70">{story.summary}</p>
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
              onClick={() =>
                setVisibleCounts((prev) => ({
                  ...prev,
                  [desk]: Math.min(prev[desk] + 2, politicsDesk[desk].length),
                }))
              }
              className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
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

export default Politics;

