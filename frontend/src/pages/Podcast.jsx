import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionButton = motion.button;

const fallbackEpisodes = [
  {
    id: "pod-market-after-hours",
    title: "After Hours: Markets, Elections, and What Changes Next",
    host: "Host: Amina Otieno",
    duration: "42 min",
    mood: "Analysis",
    channel: "Politics & Business",
    description:
      "A tactical breakdown of policy moves and capital flows shaping the week ahead for East Africa.",
    color: "from-[#1f2937] to-[#0f172a]",
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "pod-tech-policy",
    title: "Code & Cabinet: The New Rules for AI Adoption",
    host: "Host: Daniel Kimani",
    duration: "35 min",
    mood: "Strategy",
    channel: "Technology",
    description:
      "How regulators, startups, and enterprise teams are negotiating speed, safety, and trust.",
    color: "from-[#0f766e] to-[#134e4a]",
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "pod-health-access",
    title: "Care Lines: Expanding Access Beyond Major Cities",
    host: "Host: Leah Njeri",
    duration: "28 min",
    mood: "Explainer",
    channel: "Health",
    description:
      "A field-report format covering telehealth, mobile clinics, and digital triage in underserved regions.",
    color: "from-[#7f1d1d] to-[#450a0a]",
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "pod-culture-signal",
    title: "Culture Signal: Why Local Stories Travel Globally",
    host: "Host: Brian Mugo",
    duration: "31 min",
    mood: "Interview",
    channel: "Culture",
    description:
      "Creators and editors discuss narrative, identity, and the economics of modern cultural publishing.",
    color: "from-[#312e81] to-[#1e1b4b]",
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "pod-sports-sunday",
    title: "Sunday Tape: Tactics, Transfers, and Team Building",
    host: "Host: Jake W.",
    duration: "39 min",
    mood: "Recap",
    channel: "Sports",
    description:
      "A concise review of weekend performances and what to watch before the next fixtures.",
    color: "from-[#9a3412] to-[#7c2d12]",
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

const moods = ["All", "Analysis", "Strategy", "Explainer", "Interview", "Recap"];
function Podcast() {
  const API = import.meta.env.VITE_API_URL;
  const [activeMood, setActiveMood] = useState("All");
  const [episodes, setEpisodes] = useState(fallbackEpisodes);
  const [activeEpisodeId, setActiveEpisodeId] = useState(fallbackEpisodes[0].id);
  const [visibleLibraryCount, setVisibleLibraryCount] = useState(2);

  useEffect(() => {
    let mounted = true;

    async function loadPodcast() {
      try {
        const res = await fetch(`${API}/api/podcast`);
        const json = await res.json();
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (mounted && next.length > 0) {
          setEpisodes(next);
          setActiveEpisodeId(next[0]?.id || fallbackEpisodes[0].id);
        }
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    if (API) loadPodcast();
    return () => {
      mounted = false;
    };
  }, [API]);

  const filteredEpisodes = useMemo(
    () => (activeMood === "All" ? episodes : episodes.filter((episode) => episode.mood === activeMood)),
    [activeMood, episodes]
  );

  const activeEpisode =
    filteredEpisodes.find((episode) => episode.id === activeEpisodeId) || filteredEpisodes[0] || episodes[0] || fallbackEpisodes[0];
  const queueEpisodes = filteredEpisodes.filter((episode) => episode.id !== activeEpisode.id).slice(0, 3);
  const visibleLibraryEpisodes = filteredEpisodes.slice(0, visibleLibraryCount);
  const canLoadMoreLibrary = visibleLibraryCount < filteredEpisodes.length;

  const selectEpisode = (episodeId) => {
    setActiveEpisodeId(episodeId);
  };

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">Podcast</h1>
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            <p className="max-w-2xl pt-3 text-sm text-black/65">
              Newsroom audio, built for commuters: short, sharp, and opinionated.
            </p>
          </div>
          <div className="rounded border border-black/25 px-3 py-2 text-xs uppercase tracking-[0.14em] text-black/60">
            {episodes.length} Fresh Episodes
          </div>
        </div>
        <div className="mt-4 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
          Podcast Pulse: daily briefings, deep-dive interviews, and strategic takes in audio form.
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {moods.map((mood) => (
            <MotionButton
              key={mood}
              type="button"
              onClick={() => {
                setActiveMood(mood);
                setVisibleLibraryCount(2);
                const nextEpisodes = mood === "All" ? episodes : episodes.filter((episode) => episode.mood === mood);
                selectEpisode(nextEpisodes[0]?.id || episodes[0]?.id || fallbackEpisodes[0].id);
              }}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                activeMood === mood
                  ? "border-black bg-black text-white"
                  : "border-black/25 text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {mood}
            </MotionButton>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <MotionDiv
            key={activeEpisode.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`rounded-2xl border border-black/20 bg-gradient-to-br ${activeEpisode.color} p-5 text-white`}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-white/80">Featured Episode</p>
            <h2 className="pt-2 text-3xl leading-tight md:text-4xl">{activeEpisode.title}</h2>
            <p className="pt-2 text-sm text-white/75">
              {activeEpisode.host} <span className="px-2">-</span> {activeEpisode.channel}
              <span className="px-2">-</span>
              {activeEpisode.duration}
            </p>
            <p className="max-w-3xl pt-4 text-white/85">{activeEpisode.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={activeEpisode.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black"
              >
                Watch Episode
              </a>
              <a
                href={activeEpisode.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-white/35 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
              >
                Open Link
              </a>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-2xl border border-black/20 bg-[#cfd4db] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/65">Up Next</p>
            <div className="mt-3 space-y-3">
              {queueEpisodes.map((episode, index) => (
                <button
                  key={episode.id}
                  type="button"
                  onClick={() => selectEpisode(episode.id)}
                  className="w-full rounded border border-black/15 bg-white/45 p-3 text-left transition hover:border-black/30 hover:bg-white/70"
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-black/55">
                    Queue {index + 1} <span className="px-1">-</span> {episode.duration}
                  </p>
                  <p className="pt-1 text-sm leading-tight text-black/80">{episode.title}</p>
                </button>
              ))}
            </div>
          </MotionDiv>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visibleLibraryEpisodes.map((episode) => (
            <MotionButton
              key={episode.id}
              type="button"
              onClick={() => selectEpisode(episode.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded border p-4 text-left transition ${
                episode.id === activeEpisode.id
                  ? "border-black/50 bg-white/60"
                  : "border-black/15 bg-white/30 hover:border-black/30"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                {episode.mood} <span className="px-2">-</span> {episode.duration}
              </p>
              <h3 className="pt-2 text-2xl leading-tight text-black/85">{episode.title}</h3>
              <p className="pt-2 text-sm text-black/70">{episode.host}</p>
              <div className="pt-3">
                <a
                  href={episode.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex rounded border border-black/30 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/80 hover:bg-white"
                >
                  Watch Episode
                </a>
              </div>
            </MotionButton>
          ))}
        </div>
        {canLoadMoreLibrary ? (
          <div className="mt-6 text-center">
            <MotionButton
              type="button"
              onClick={() => setVisibleLibraryCount((prev) => Math.min(prev + 2, filteredEpisodes.length))}
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

export default Podcast;

