import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { businessArticles } from "../data/businessArticles";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionArticle = motion.article;

const marketSnapshot = {
  Local: [
    { label: "KES / USD", value: "129.4", delta: "-0.6%", trend: "down" },
    { label: "NSE 20", value: "1,842", delta: "+0.9%", trend: "up" },
    { label: "Fuel Index", value: "104.1", delta: "-0.2%", trend: "down" },
    { label: "Tea Auction", value: "$2.43/kg", delta: "+1.4%", trend: "up" },
  ],
  International: [
    { label: "Brent", value: "$82.6", delta: "+0.8%", trend: "up" },
    { label: "DXY", value: "104.2", delta: "-0.4%", trend: "down" },
    { label: "Baltic Dry", value: "1,762", delta: "+1.1%", trend: "up" },
    { label: "Copper", value: "$3.94/lb", delta: "-0.3%", trend: "down" },
  ],
};

function Business() {
  const [scope, setScope] = useState("Local");
  const [tag, setTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(3);

  const tags = useMemo(() => {
    const scoped = businessArticles.filter((item) => item.scope === scope);
    return ["All", ...new Set(scoped.map((item) => item.tag))];
  }, [scope]);

  const filteredArticles = useMemo(() => {
    const scoped = businessArticles.filter((item) => item.scope === scope);
    return tag === "All" ? scoped : scoped.filter((item) => item.tag === tag);
  }, [scope, tag]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const featured = visibleArticles[0];
  const gridItems = visibleArticles.slice(1);
  const topSideItems = gridItems.slice(0, 2);
  const extraItems = gridItems.slice(2);
  const sidebarFillItems = extraItems.length
    ? extraItems.slice(0, 1)
    : filteredArticles[visibleCount]
      ? [filteredArticles[visibleCount]]
      : [];
  const extraGridItems = extraItems.slice(sidebarFillItems.length);
  const canLoadMore = visibleCount < filteredArticles.length;

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    setTag("All");
    setVisibleCount(3);
  };

  const pulseLabel =
    scope === "Local"
      ? "Business Pulse: financing, policy, and growth strategies across Kenya."
      : "Business Pulse: trade, capital markets, and global industry signals.";

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
              Business
            </h1>
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            <p className="max-w-2xl pt-3 text-sm text-black/65">
              Follow money, markets, and enterprise strategy with local and international lenses.
            </p>
          </div>
          <div className="flex gap-2 rounded border border-black/25 p-1">
            <MotionButton
              type="button"
              onClick={() => handleScopeChange("Local")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                scope === "Local" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              Local
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => handleScopeChange("International")}
              className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                scope === "International" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              International
            </MotionButton>
          </div>
        </div>

        <MotionDiv
          key={`pulse-${scope}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70"
        >
          {pulseLabel}
        </MotionDiv>

        <MotionDiv
          key={`snapshot-${scope}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-4 rounded border border-black/20 bg-[#dde1e6] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/60">Market Snapshot</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-black/45">Updated: 08:45 EAT</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {marketSnapshot[scope].map((item) => (
              <div key={item.label} className="rounded border border-black/15 bg-white/55 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-black/55">{item.label}</p>
                <p className="pt-1 text-lg font-semibold text-black/85">{item.value}</p>
                <p className={`text-sm ${item.trend === "up" ? "text-emerald-700" : "text-red-700"}`}>
                  {item.delta}
                </p>
              </div>
            ))}
          </div>
        </MotionDiv>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((itemTag) => (
            <button
              key={itemTag}
              type="button"
              onClick={() => {
                setTag(itemTag);
                setVisibleCount(3);
              }}
              className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                tag === itemTag
                  ? "border-black bg-black text-white"
                  : "border-black/25 text-black/70 hover:bg-black/10"
              }`}
            >
              {itemTag}
            </button>
          ))}
        </div>

        {featured ? (
          <>
            <MotionDiv
              key={`${scope}-${tag}-layout`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="mt-5 grid gap-5 lg:items-start lg:grid-cols-[1.2fr_1fr]"
            >
              <MotionArticle whileHover={{ y: -4 }} className="overflow-hidden rounded border border-black/15 bg-white/35">
                <Link to={`/business/article/${featured.id}`} className="group block">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-96"
                  />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                      {featured.scope} <span className="px-2">-</span> {featured.tag}
                      <span className="px-2">-</span>
                      {featured.date}
                    </p>
                    <h2 className="pt-3 text-4xl leading-tight text-black/90 transition group-hover:text-black md:text-[42px]">
                      {featured.title}
                    </h2>
                    <p className="pt-4 text-black/75">{featured.summary}</p>
                  </div>
                </Link>
              </MotionArticle>

              <div className="grid content-start gap-5">
                {topSideItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <Link to={`/business/article/${article.id}`} className="group contents">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {article.tag} <span className="px-2">-</span> {article.date}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {article.title}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{article.summary}</p>
                      </div>
                    </Link>
                  </MotionArticle>
                ))}

                {sidebarFillItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="rounded border border-black/15 bg-white/30 p-4"
                  >
                    <Link to={`/business/article/${article.id}`} className="group block">
                      <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                        {article.tag} <span className="px-2">-</span> {article.date}
                      </p>
                      <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                        {article.title}
                      </h3>
                      <p className="pt-3 text-sm text-black/70">{article.summary}</p>
                    </Link>
                  </MotionArticle>
                ))}
              </div>
            </MotionDiv>

            {extraGridItems.length > 0 ? (
              <MotionDiv
                key={`${scope}-${tag}-more-${visibleCount}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-5 grid gap-5 md:grid-cols-2"
              >
                {extraGridItems.map((article) => (
                  <MotionArticle
                    key={article.id}
                    whileHover={{ y: -4 }}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <Link to={`/business/article/${article.id}`} className="group contents">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-36 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {article.tag} <span className="px-2">-</span> {article.date}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {article.title}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{article.summary}</p>
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
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 2, filteredArticles.length))}
                  className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Load More
                </MotionButton>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded border border-black/15 bg-white/30 p-6 text-black/70">
            No stories found for this filter.
          </div>
        )}
      </div>
    </MotionSection>
  );
}

export default Business;
