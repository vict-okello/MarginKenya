import { Link } from "react-router-dom";
import worldImage from "../assets/world.jpg";
import technologyImage from "../assets/technology.jpg";
import healthImage from "../assets/health.jpg";
import sportImage from "../assets/sport.jpg";
import heroImage from "../assets/hero1.png";

function Hero() {
  const topStories = [
    {
      title: "WORLD NEWS",
      blurb: "Economic policies are shaping international markets",
      image: worldImage,
    },
    {
      title: "TECHNOLOGY",
      blurb: "The latest trends in AI and innovation",
      image: technologyImage,
    },
    {
      title: "HEALTH",
      blurb: "Analyzing the effects of global health policies",
      image: healthImage,
    },
    {
      title: "SPORTS",
      blurb: "Affect the integrity and future of professional sports",
      image: sportImage,
    },
  ];

  return (
    <section className="bg-[#d8d8dc] px-4 pb-8 pt-5">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-4">
          {topStories.map((story) => (
            <article key={story.title} className="flex items-start gap-3">
              <img
                src={story.image}
                alt={story.title}
                className="h-14 w-14 shrink-0 rounded object-cover"
              />
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-black">{story.title}</h3>
                <p className="pt-1 text-xs leading-snug text-black/75">{story.blurb}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[2px] bg-white/70">
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded bg-white px-2 py-1 text-[11px] text-black/80">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Live Updates
          </span>
          <img
            src={heroImage}
            alt="Featured cultural story"
            className="h-[100px] w-full sm:h-[300px] md:h-[420px]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded border border-black/40 px-3 py-1 text-[10px] font-medium uppercase text-black/80">
              Culture
            </span>
            <span className="rounded border border-black/40 px-3 py-1 text-[10px] font-medium uppercase text-black/80">
              Guy Hawkins
            </span>
          </div>
          <p className="text-[10px] text-black/70">Sep 9, 2024 -- 06 Minute</p>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-3 md:flex-row md:items-start">
          <h1 className="max-w-3xl text-3xl leading-tight text-black/85 md:text-[42px]">
            A deep dive into the influence of cultural movements on contemporary society
          </h1>
          <Link to="/worldnews" className="pt-1 text-sm text-black/75 transition hover:text-black">
            Read Article -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
