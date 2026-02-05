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

const sideStories = [
  {
    id: "business",
    label: "Business",
    date: "Feb 10, 2025",
    title: "Adapting business strategies to meet changing demands",
    to: "/business",
    color: "bg-[#d8b73a]",
  },
  {
    id: "technology",
    label: "Technology",
    date: "Feb 10, 2025",
    title: "Smart homes revolution how IoT is transforming living spaces",
    to: "/technology",
    color: "bg-[#ee5b45]",
  },
  {
    id: "culture",
    label: "Culture",
    date: "Jan 27, 2025",
    title: "The power of art in connecting and expressing cultural identity",
    to: "/culture",
    color: "bg-[#3da5d9]",
  },
  {
    id: "health",
    label: "Health News",
    date: "Jan 27, 2025",
    title: "How artificial intelligence and machine learning are changing the field",
    to: "/health",
    color: "bg-[#2ec86b]",
  },
  {
    id: "sports",
    label: "Sports",
    date: "Jan 27, 2025",
    title: "The influence of youth sports programs on developing future champions",
    to: "/sports",
    color: "bg-[#f0503a]",
  },
];

function Worldnews({ showViewAll = true, variant = "home" }) {
  const isPage = variant === "page";

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
              <h1 className="text-5xl font-semibold uppercase text-black/85 md:text-6xl">World News</h1>
            ) : (
              <h2 className="text-4xl font-semibold uppercase text-black/85">World News</h2>
            )}
            {isPage ? (
              <p className="pt-2 text-sm text-black/65">
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

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]"
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
            {sideStories.map((story, index) => (
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
          </MotionAside>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default Worldnews;



