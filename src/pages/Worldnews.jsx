import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import worldImage from "../assets/world.jpg";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionAside = motion.aside;
const MotionImage = motion.img;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

const leadArticleId = "manufacturing-emerging-trends";
const regionOptions = ["all", "africa", "europe", "asia", "americas", "middle-east"];
const regionBriefing = {
  all: { title: "Global Blend", signal: "5 tracked stories", risk: "Mixed", tempo: "High" },
  africa: { title: "Africa Desk", signal: "Policy + growth shift", risk: "Moderate", tempo: "Rising" },
  europe: { title: "Europe Desk", signal: "Culture + markets", risk: "Low", tempo: "Stable" },
  asia: { title: "Asia Desk", signal: "Tech acceleration", risk: "Moderate", tempo: "High" },
  americas: { title: "Americas Desk", signal: "Health + AI policy", risk: "Moderate", tempo: "Rising" },
  "middle-east": { title: "Middle East Desk", signal: "Sports + civic momentum", risk: "Low", tempo: "Steady" },
};

const sideStories = [
  {
    id: "business",
    label: "Business",
    date: "Feb 10, 2025",
    title: "Adapting business strategies to meet changing demands",
    to: "/business",
    color: "bg-[#d8b73a]",
    region: "africa",
  },
  {
    id: "technology",
    label: "Technology",
    date: "Feb 10, 2025",
    title: "Smart homes revolution how IoT is transforming living spaces",
    to: "/technology",
    color: "bg-[#ee5b45]",
    region: "asia",
  },
  {
    id: "culture",
    label: "Culture",
    date: "Jan 27, 2025",
    title: "The power of art in connecting and expressing cultural identity",
    to: "/culture",
    color: "bg-[#3da5d9]",
    region: "europe",
  },
  {
    id: "health",
    label: "Health News",
    date: "Jan 27, 2025",
    title: "How artificial intelligence and machine learning are changing the field",
    to: "/health",
    color: "bg-[#2ec86b]",
    region: "americas",
  },
  {
    id: "sports",
    label: "Sports",
    date: "Jan 27, 2025",
    title: "The influence of youth sports programs on developing future champions",
    to: "/sports",
    color: "bg-[#f0503a]",
    region: "middle-east",
  },
];

function Worldnews({ showViewAll = true, variant = "home" }) {
  const isPage = variant === "page";
  const [activeRegion, setActiveRegion] = useState("all");
  const visibleSideStories = useMemo(
    () => (activeRegion === "all" ? sideStories : sideStories.filter((story) => story.region === activeRegion)),
    [activeRegion]
  );
  const activeBriefing = regionBriefing[activeRegion];

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.36 }}
      className={`bg-[#d8d8dc] px-4 ${isPage ? "py-12" : "py-10"}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
          <div>
            {isPage ? (
              <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">World News</h1>
            ) : (
              <h2 className="text-4xl font-black uppercase tracking-[0.05em] text-black/90">World News</h2>
            )}
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            {isPage ? (
              <p className="pt-3 text-sm text-black/65">
                Global headlines, analysis, and the stories shaping markets and policy.
              </p>
            ) : null}
          </div>
          {showViewAll ? (
            <Link to="/worldnews" className="text-sm text-black/70 transition hover:text-black">
              View All -&gt;
            </Link>
          ) : null}
        </div>
        <div className="rounded border border-black/20 bg-[#dfe3e8] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-black/55">Global Focus</p>
              <p className="pt-1 text-sm text-black/75">{activeBriefing.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`rounded border px-2 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                    activeRegion === region
                      ? "border-black bg-black text-white"
                      : "border-black/25 text-black/65 hover:bg-black/10"
                  }`}
                >
                  {region.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-black/70 sm:grid-cols-3">
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Signal: {activeBriefing.signal}</p>
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Risk: {activeBriefing.risk}</p>
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Tempo: {activeBriefing.tempo}</p>
          </div>
        </div>

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-5 grid gap-6 lg:grid-cols-[1.65fr_0.95fr]"
        >
          <MotionArticle variants={itemVariants}>
            <Link
              to={`/worldnews/article/${leadArticleId}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-[2px]">
                <MotionImage
                  src={worldImage}
                  alt="Manufacturing and industrial landscape"
                  className="h-[250px] w-full object-cover sm:h-[360px] lg:h-[460px]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.32 }}
                />
              </div>

              <motion.h2
                className="pt-5 text-4xl font-semibold leading-tight text-black/90 transition group-hover:text-black md:text-[48px]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.08, ease: "easeOut" }}
              >
                Revolutionizing manufacturing emerging trends shaping the industry
              </motion.h2>

              <motion.div
                className="pt-4 text-xs uppercase tracking-wide text-black/55"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.12, ease: "easeOut" }}
              >
                <span className="rounded bg-[#6358e8] px-2 py-1 font-semibold text-white">World News</span>
                <span className="px-3">-</span>
                <span>Jan 25, 2025</span>
              </motion.div>
            </Link>
          </MotionArticle>

          <MotionAside variants={itemVariants} className="rounded-[2px] bg-[#d8d8dc]">
            {visibleSideStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34, delay: 0.12 + index * 0.055, ease: "easeOut" }}
              >
                <Link
                  to={story.to}
                  className="block border-b border-black/15 py-5 first:pt-0"
                >
                  <div className="text-xs uppercase tracking-wide text-black/60">
                    <span className={`rounded px-2 py-1 font-semibold text-white ${story.color}`}>
                      {story.label}
                    </span>
                    <span className="px-3">-</span>
                    <span>{story.date}</span>
                  </div>
                  <h2 className="pt-3 text-[30px] leading-tight text-black/85 transition hover:text-black md:text-[32px]">
                    {story.title}
                  </h2>
                </Link>
              </motion.div>
            ))}
            {visibleSideStories.length === 0 ? (
              <div className="rounded border border-black/15 bg-white/30 p-4 text-sm text-black/65">
                No stories for this region yet.
              </div>
            ) : null}
          </MotionAside>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default Worldnews;



