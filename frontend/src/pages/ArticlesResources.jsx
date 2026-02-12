import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { articlesResourcesArticles } from "../data/articlesResourcesArticles";

function normalizeResources(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.resources)
      ? payload.resources
      : [];

  return list.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    category: item?.category || "Guide",
    date: (item?.publishedAt || "").slice(0, 10) || "",
    image: item?.image || "",
    summary: item?.summary || "",
    body: item?.content || item?.body || "",
    status: item?.status || "draft",
  }));
}

function ArticlesResources({ withSection = true, showHeader = true }) {
  const API = import.meta.env.VITE_API_URL;
  const [visibleCount, setVisibleCount] = useState(3);
  const [articles, setArticles] = useState(articlesResourcesArticles);

  useEffect(() => {
    let alive = true;

    async function loadResources() {
      try {
        const res = await fetch(`${API}/api/resources`);
        const data = await res.json();
        if (!res.ok) return;
        const next = normalizeResources(data).filter((item) => item.status === "published");
        if (alive && next.length > 0) setArticles(next);
      } catch {
        // Keep static fallback if API is unavailable.
      }
    }

    if (API) loadResources();
    return () => {
      alive = false;
    };
  }, [API]);

  const resolvedArticles = useMemo(
    () =>
      articles.map((item) => ({
        ...item,
        image:
          item?.image && /^https?:\/\//i.test(item.image)
            ? item.image
            : item?.image && API
              ? `${API}${item.image}`
              : item?.image || "",
      })),
    [articles, API]
  );

  const visibleArticles = resolvedArticles.slice(0, visibleCount);
  const canLoadMore = visibleCount < resolvedArticles.length;

  const Wrapper = withSection ? "section" : "div";
  const wrapperClassName = withSection ? "bg-[#d8d8dc] px-4 pb-12 pt-6" : "";

  return (
    <Wrapper className={wrapperClassName}>
      <div className="mx-auto w-full max-w-5xl">
        {showHeader ? (
          <div>
            <h2 className="text-4xl font-black uppercase tracking-[0.05em] text-black/90">Articles & Resources</h2>
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
          </div>
        ) : null}

        <div className={showHeader ? "pt-6" : ""}>
          {visibleArticles.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 border-b border-black/15 py-6 md:grid-cols-[1fr_330px] md:items-center lg:grid-cols-[1fr_380px]"
            >
              <div>
                <p className="text-xs text-black/55">
                  {item.category}
                  <span className="px-2">|</span>
                  {item.date}
                </p>

                <h3 className="pt-3 text-[34px] leading-tight text-black/85 md:max-w-[92%] md:text-[36px]">
                  {item.title}
                </h3>

                <Link
                  to={`/resources/article/${item.id}`}
                  className="inline-block pt-5 text-xs font-semibold text-[#e25b4a] transition hover:text-[#c94f40]"
                >
                  Read More -&gt;
                </Link>
              </div>

              <Link
                to={`/resources/article/${item.id}`}
                className="block overflow-hidden rounded-[2px]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[180px] w-full object-cover transition duration-300 hover:scale-[1.02] md:h-[190px]"
                />
              </Link>
            </article>
          ))}
        </div>

        {canLoadMore ? (
          <div className="pt-7 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, resolvedArticles.length))}
              className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}

export default ArticlesResources;

