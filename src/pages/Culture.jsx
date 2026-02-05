import { useState } from "react";
import { Link } from "react-router-dom";
import { cultureArticles } from "../data/cultureArticles";

function Culture() {
  const [visibleCount, setVisibleCount] = useState(3);
  const topStories = cultureArticles.slice(0, 2);
  const bottomStories = cultureArticles.slice(2);
  const visibleBottomStories = bottomStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < bottomStories.length;

  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="pb-5">
          <h1 className="text-5xl font-semibold uppercase tracking-wide text-black/85 md:text-6xl">
            Culture
          </h1>
          <p className="pt-2 text-sm text-black/65">
            Art, identity, and the creative forces shaping our time.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {topStories.map((story) => (
            <article key={story.id} className="rounded border border-black/10 bg-[#d8d8dc] p-3">
              <Link to={`/culture/article/${story.id}`} className="block overflow-hidden rounded-[2px]">
                <img
                  src={story.image}
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
                  src={story.image}
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
    </section>
  );
}

export default Culture;
