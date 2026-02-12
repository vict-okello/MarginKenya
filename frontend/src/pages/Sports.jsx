import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { sportsArticles, sportsCategories } from "../data/sportsArticles";
import sportPhoto from "../assets/sport.jpg";
import americanFootballImage from "../assets/american-football.png";

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionAside = motion.aside;
const MotionImg = motion.img;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;
const MotionButton = motion.button;
const MotionP = motion.p;

function Sports() {
  const API = import.meta.env.VITE_API_URL;
  const topStory = sportsArticles.topScorer;
  const sideStoryOne = sportsArticles.runners;
  const sideStoryTwo = sportsArticles.indycar;
  const articleCards = [
    { ...sportsArticles.topScorer, tag: "Basketball", author: "Jake Will.", date: "04 June 2023", image: sportPhoto },
    { ...sportsArticles.runners, tag: "Hockey", author: "Foxi.zacon", date: "03 June 2023", image: sportPhoto },
    { ...sportsArticles.indycar, tag: "Badminton", author: "Bong Lozada", date: "01 June 2023", image: sportPhoto },
  ];
  const [articleStart, setArticleStart] = useState(0);
  const visibleArticleCards = Array.from({ length: Math.min(3, articleCards.length) }, (_, index) => {
    return articleCards[(articleStart + index) % articleCards.length];
  });
  const categoryList = Object.values(sportsCategories);
  const categoriesPerPage = 4;
  const [categoryPage, setCategoryPage] = useState(0);
  const totalCategoryPages = Math.ceil(categoryList.length / categoriesPerPage);
  const visibleCategories = categoryList.slice(
    categoryPage * categoriesPerPage,
    (categoryPage + 1) * categoriesPerPage
  );
  const [email, setEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribers, setSubscribers] = useState(0);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setSubscribeMessage("Please enter a valid email.");
      return;
    }

    try {
      if (!API) throw new Error("API is unavailable.");
      const res = await fetch(`${API}/api/subscribers/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, source: "sports_page" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Subscription failed.");
      setSubscribeMessage(json?.message || "Subscribed successfully.");
      setSubscribers((n) => n + 1);
      setEmail("");
    } catch (err) {
      setSubscribeMessage(err?.message || "Subscription failed.");
    }
  };

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-black/15 bg-gradient-to-r from-[#eceef2] via-[#dee2ea] to-[#d6dce7] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Sports Desk</p>
        <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]">
          Sports
        </h1>
        <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
          Match highlights, athlete stories, and the moments that move fans.
        </p>
        <div className="mt-5 rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
          Sports Pulse: fixtures, form, and momentum shifts ahead of the next gameweek.
        </div>
      </div>

      <MotionDiv
        className="mx-auto mt-5 grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_220px]"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <MotionArticle
          variants={itemVariants}
          className="relative overflow-hidden rounded bg-[#dfe0e2] p-6 md:p-8"
        >
          <div className="absolute -left-12 top-10 h-56 w-56 rounded-full border-[18px] border-black/5" />

          <div className="relative z-10">
            <MotionP
              className="text-5xl font-black uppercase leading-[0.95] text-black/70 md:text-7xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Top Scorer to the Final Match
            </MotionP>
          </div>

          <MotionImg
            src={topStory.image}
            alt="Top scorer"
            className="mt-5 mx-auto h-auto w-auto max-h-[520px] max-w-full object-contain"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
          />

          <MotionP
            className="relative z-10 mt-4 max-w-md text-sm text-black/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            {topStory.summary}
          </MotionP>

          <MotionDiv whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Link
              to={`/sports/article/${topStory.id}`}
              className="relative z-10 mt-8 inline-block rounded bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Continue Reading
            </Link>
          </MotionDiv>
        </MotionArticle>

        <MotionAside variants={itemVariants} className="space-y-4">
          <MotionArticle
            className="rounded bg-[#e4e5e7] p-2"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="inline-block rounded bg-[#d6dbe3] px-2 py-1 text-[10px] text-black/70">
              Today
            </span>
            <Link to={`/sports/article/${sideStoryOne.id}`}>
              <div className="mt-2 overflow-hidden rounded bg-gradient-to-b from-[#f0f1f4] to-[#d5d8de]">
                <img
                  src={sideStoryOne.image}
                  alt="Sports update"
                  className="h-40 w-full object-contain object-center p-2 drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
                />
              </div>
            </Link>
            <p className="pt-2 text-xs text-black/80">{sideStoryOne.title}</p>
          </MotionArticle>

          <MotionArticle
            className="rounded bg-[#e4e5e7] p-2"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link to={`/sports/article/${sideStoryTwo.id}`}>
              <div className="overflow-hidden rounded bg-gradient-to-b from-[#f0f1f4] to-[#d5d8de]">
                <img
                  src={sideStoryTwo.image}
                  alt="Sports headline"
                  className="h-40 w-full object-contain object-center p-2 drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
                />
              </div>
            </Link>
            <p className="pt-2 text-xs text-black/80">{sideStoryTwo.title}</p>
          </MotionArticle>
        </MotionAside>
      </MotionDiv>

      <MotionDiv
        className="mx-auto mt-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between pb-4">
          <MotionH2 className="text-3xl font-semibold text-black/80" whileInView={{ opacity: [0, 1], y: [12, 0] }}>
            Category
          </MotionH2>
          <div className="flex gap-2">
            <MotionButton
              type="button"
              onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 0))}
              disabled={categoryPage === 0}
              className={`rounded border border-black/30 px-3 py-1 text-sm ${
                categoryPage === 0 ? "cursor-not-allowed text-black/30" : "text-black hover:bg-white/70"
              }`}
              whileHover={categoryPage === 0 ? {} : { y: -2 }}
              whileTap={categoryPage === 0 ? {} : { scale: 0.96 }}
            >
              Back
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages - 1))}
              disabled={categoryPage >= totalCategoryPages - 1}
              className={`rounded border border-black/30 px-3 py-1 text-sm ${
                categoryPage >= totalCategoryPages - 1
                  ? "cursor-not-allowed text-black/30"
                  : "text-black hover:bg-white/70"
              }`}
              whileHover={categoryPage >= totalCategoryPages - 1 ? {} : { y: -2 }}
              whileTap={categoryPage >= totalCategoryPages - 1 ? {} : { scale: 0.96 }}
            >
              Next
            </MotionButton>
          </div>
        </div>
        <MotionDiv
          key={categoryPage}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {visibleCategories.map((category) => (
            <MotionDiv key={category.id} variants={itemVariants} whileHover={{ y: -6 }}>
              <Link
              key={category.id}
              to={`/sports/category/${category.id}`}
              className="overflow-hidden rounded bg-[#d0d3d8]"
            >
              <MotionImg
                src={category.image}
                alt={category.name}
                className="h-40 w-full bg-[#cfd2d7] p-1 object-contain"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
              />
              <p className="px-3 py-3 text-center text-2xl font-extrabold uppercase text-black/55">
                {category.name}
              </p>
            </Link>
            </MotionDiv>
          ))}
        </MotionDiv>
      </MotionDiv>

      <MotionDiv
        className="mx-auto mt-12 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5 }}
      >
        <MotionH2 className="pb-4 text-4xl font-semibold text-black/80">Sports Article</MotionH2>
        <MotionDiv
          key={articleStart}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {visibleArticleCards.map((article) => (
            <MotionArticle key={article.id} variants={itemVariants} whileHover={{ y: -8 }}>
              <Link
                to={`/sports/article/${article.id}`}
                className="relative block overflow-hidden rounded"
              >
                <MotionImg
                  src={article.image}
                  alt={article.title}
                  className="h-64 w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute right-3 top-3 rounded border border-white/70 px-2 py-1 text-[10px] text-white">
                  {article.tag}
                </span>
              </Link>

              <div className="pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b9bec5] text-xs font-semibold text-black/70">
                    {article.author.slice(0, 2)}
                  </span>
                  <p className="text-sm text-black/80">{article.author}</p>
                </div>
                <p className="pt-3 text-sm text-black/60">{article.date}</p>
                <Link
                  to={`/sports/article/${article.id}`}
                  className="block pt-3 text-[34px] font-semibold leading-tight text-black/85"
                >
                  {article.title}
                </Link>
                <p className="pt-3 text-lg text-black/65">{article.summary}</p>
              </div>
            </MotionArticle>
          ))}
        </MotionDiv>

        <div className="mt-6 flex gap-3">
          <MotionButton
            type="button"
            onClick={() =>
              setArticleStart((prev) => (prev - 1 + articleCards.length) % articleCards.length)
            }
            className="rounded bg-[#c0c4ca] px-5 py-3 text-xl text-white"
            aria-label="Back"
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            &larr;
          </MotionButton>
          <MotionButton
            type="button"
            onClick={() => setArticleStart((prev) => (prev + 1) % articleCards.length)}
            className="rounded bg-[#2f3135] px-5 py-3 text-xl text-white"
            aria-label="Next"
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            &rarr;
          </MotionButton>
        </div>
      </MotionDiv>

      <MotionDiv
        className="mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded bg-[#d1d4d9]"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative grid gap-4 px-6 py-8 md:grid-cols-[1fr_320px] md:px-10">
          <div className="relative z-10 max-w-xl">
            <MotionH3
              className="text-5xl font-extrabold uppercase leading-[0.9] text-black/70"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              Newsletter
              <br />
              Subscription
            </MotionH3>

            <form
              onSubmit={handleSubscribe}
              className="mt-6 flex max-w-md overflow-hidden rounded border border-black/35"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@gmail.com"
                required
                className="w-full bg-[#d8dbe0] px-4 py-3 text-base text-black/70 placeholder:text-black/35 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#2f3135] px-6 text-2xl text-white transition hover:bg-black"
                aria-label="Subscribe"
              >
                {"\u2197"}
              </button>
            </form>
            <p className="pt-3 text-sm text-black/70">
              {subscribeMessage || `Subscribers recorded: ${subscribers}`}
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -left-8 top-2 h-48 w-48 rounded-full border-[6px] border-black/5" />
            <div className="absolute -left-2 top-8 h-40 w-40 rounded-full border-[6px] border-black/5" />
            <img
              src={americanFootballImage}
              alt="Sports newsletter"
              className="relative z-10 ml-auto h-56 w-auto object-contain"
            />
          </div>
        </div>
      </MotionDiv>
    </MotionSection>
  );
}

export default Sports;
