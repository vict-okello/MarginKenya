import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewsletterBanner from "./NewsletterBanner";

function Culture() {
  const API = import.meta.env.VITE_API_URL;
  const [visibleCount, setVisibleCount] = useState(3);
  const [stories, setStories] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCulture() {
      try {
        setLoadError("");
        const res = await fetch(`${API}/api/culture`);
        const json = await res.json();
        if (!res.ok) {
          if (mounted) setLoadError("Failed to load culture feed.");
          return;
        }
        if (mounted) setStories(Array.isArray(json) ? json : []);
      } catch {
        if (mounted) setLoadError("Live culture feed is unavailable.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (API) {
      loadCulture();
    } else {
      setLoadError("VITE_API_URL is missing.");
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [API]);

  const topStories = stories.slice(0, 2);
  const bottomStories = stories.slice(2);
  const visibleBottomStories = bottomStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < bottomStories.length;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");

  function resolveImageUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return base ? `${base}${url}` : url;
  }

  if (loading) {
    return null;
  }

  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-black/15 bg-gradient-to-r from-[#ece9f1] via-[#e2dce9] to-[#d9d5e2] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Culture Desk</p>
          <h1
            className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]"
            style={{ textShadow: "0 8px 22px rgba(125,93,171,0.22)" }}
          >
            Culture
          </h1>
          <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
            Art, identity, and the creative forces shaping public conversation.
          </p>
          <div className="mt-5 rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
            Culture Pulse: creative voices, identity shifts, and emerging ideas.
          </div>
        </div>

        {loadError ? (
          <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {loadError}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {topStories.map((story) => (
            <article key={story.id} className="rounded border border-black/10 bg-[#d8d8dc] p-3">
              <Link to={`/culture/article/${story.id}`} className="block overflow-hidden rounded-[2px]">
                <img
                  src={resolveImageUrl(story.image)}
                  alt={story.title}
                  className="h-[270px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              </Link>

              <p className="pt-4 text-xs text-black/55">{story.date}</p>
              <Link to={`/culture/article/${story.id}`} className="block">
                <h2 className="pt-3 text-5xl font-semibold leading-tight text-black/90 transition hover:text-black md:text-[52px]">
                  {story.title}
                </h2>
              </Link>
              <p className="pt-3 text-sm text-black/70">{story.summary}</p>
              <p className="pt-5 text-sm text-black/65">{story.author}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleBottomStories.map((story) => (
            <article key={story.id} className="rounded border border-black/10 bg-[#d8d8dc] p-3">
              <Link to={`/culture/article/${story.id}`} className="block overflow-hidden rounded-[2px]">
                <img
                  src={resolveImageUrl(story.image)}
                  alt={story.title}
                  className="h-[170px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              </Link>

              <p className="pt-3 text-xs text-black/55">{story.date}</p>
              <Link to={`/culture/article/${story.id}`} className="block">
                <h2 className="pt-2 text-[36px] font-semibold leading-tight text-black/85 transition hover:text-black md:text-[38px]">
                  {story.title}
                </h2>
              </Link>
              <p className="pt-3 text-xs text-black/65">{story.author}</p>
            </article>
          ))}
        </div>

        {canLoadMore ? (
          <div className="pt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, bottomStories.length))}
              className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
      <NewsletterBanner variant="sports" />
    </section>
  );
}

export default Culture;

