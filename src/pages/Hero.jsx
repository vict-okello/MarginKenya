import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import worldImage from "../assets/world.jpg";
import technologyImage from "../assets/technology.jpg";
import healthImage from "../assets/health.jpg";
import sportImage from "../assets/sport.jpg";
import heroImage from "../assets/hero1.png";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionImg = motion.img;

function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        show: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.4, staggerChildren: 0.08 },
        },
      };

  const itemVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        show: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      };

  const featuredArticleId = "cultural-movements-deep-dive";
  const topStories = [
    {
      title: "WORLD NEWS",
      blurb: "Economic policies are shaping international markets",
      image: worldImage,
      to: "/worldnews",
    },
    {
      title: "TECHNOLOGY",
      blurb: "The latest trends in AI and innovation",
      image: technologyImage,
      to: "/technology",
    },
    {
      title: "HEALTH",
      blurb: "Analyzing the effects of global health policies",
      image: healthImage,
      to: "/health",
    },
    {
      title: "SPORTS",
      blurb: "Affect the integrity and future of professional sports",
      image: sportImage,
      to: "/sports",
    },
  ];

  return (
    <MotionSection
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className="bg-[#d8d8dc] px-4 pb-8 pt-5"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {topStories.map((story) => (
            <Link key={story.title} to={story.to} className="group block">
              <MotionArticle
                variants={itemVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className="flex items-start gap-3"
              >
                <MotionImg
                  src={story.image}
                  alt={story.title}
                  className="h-14 w-14 shrink-0 rounded object-cover"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                />
                <div>
                  <h3 className="text-xs font-semibold tracking-wide text-black transition group-hover:text-black/90">
                    {story.title}
                  </h3>
                  <p className="pt-1 text-xs leading-snug text-black/75 transition group-hover:text-black/90">
                    {story.blurb}
                  </p>
                </div>
              </MotionArticle>
            </Link>
          ))}
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
        >
          <Link to={`/worldnews/article/${featuredArticleId}`} className="block">
            <div className="relative overflow-hidden rounded-[2px] bg-white/70">
              <MotionImg
                src={heroImage}
                alt="Featured cultural story"
                className="h-[100px] w-full object-cover object-center sm:h-[300px] md:h-[420px]"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              />
            </div>
          </Link>
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-3 pt-4"
        >
          <div className="flex items-center gap-2">
            <span className="rounded border border-black/40 px-3 py-1 text-xs font-medium uppercase text-black/80">
              Culture
            </span>
            <span className="rounded border border-black/40 px-3 py-1 text-xs font-medium uppercase text-black/80">
              Guy Hawkins
            </span>
          </div>
          <p className="text-xs text-black/70">Sep 9, 2024 · 6 min read</p>
        </MotionDiv>

        <MotionDiv
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.38, delay: prefersReducedMotion ? 0 : 0.28, ease: "easeOut" }}
          className="flex flex-col justify-between gap-4 pt-3 md:flex-row md:items-start"
        >
          <Link to={`/worldnews/article/${featuredArticleId}`} className="max-w-3xl">
            <h1 className="text-3xl leading-tight text-black/85 transition hover:text-black md:text-[42px]">
              A deep dive into the influence of cultural movements on contemporary society
            </h1>
          </Link>
          <Link
            to={`/worldnews/article/${featuredArticleId}`}
            className="pt-1 text-sm text-black/75 transition hover:text-black"
          >
            Read Article -&gt;
          </Link>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default Hero;
