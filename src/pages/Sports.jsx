import { useState } from "react";
import { Link } from "react-router-dom";
import { sportsArticles, sportsCategories } from "../data/sportsArticles";
import sportPhoto from "../assets/sport.jpg";
import americanFootballImage from "../assets/american-football.png";

function Sports() {
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
  const [subscribers, setSubscribers] = useState(() => {
    try {
      const saved = localStorage.getItem("sports_newsletter_emails");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSubscribe = (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setSubscribeMessage("Please enter a valid email.");
      return;
    }

    if (subscribers.includes(cleanEmail)) {
      setSubscribeMessage("This email is already subscribed.");
      return;
    }

    const updatedSubscribers = [...subscribers, cleanEmail];
    setSubscribers(updatedSubscribers);
    localStorage.setItem("sports_newsletter_emails", JSON.stringify(updatedSubscribers));
    setEmail("");
    setSubscribeMessage("Subscribed successfully.");
  };

  return (
    <section className="bg-[#d8d8dc] px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_220px]">
        <article className="relative overflow-hidden rounded bg-[#dfe0e2] p-6 md:p-8">
          <div className="absolute -left-12 top-10 h-56 w-56 rounded-full border-[18px] border-black/5" />

          <div className="relative z-10">
            <p className="text-5xl font-black uppercase leading-[0.95] text-black/70 md:text-7xl">
              Top Scorer to the Final Match
            </p>
          </div>

          <img
            src={topStory.image}
            alt="Top scorer"
            className="mt-5 mx-auto h-auto w-auto max-h-[520px] max-w-full object-contain"
          />

          <p className="relative z-10 mt-4 max-w-md text-sm text-black/80">
            {topStory.summary}
          </p>

          <Link
            to={`/sports/article/${topStory.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-8 inline-block rounded bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Continue Reading
          </Link>
        </article>

        <aside className="space-y-4">
          <article className="rounded bg-[#e4e5e7] p-2">
            <span className="inline-block rounded bg-[#d6dbe3] px-2 py-1 text-[10px] text-black/70">
              Today
            </span>
            <Link to={`/sports/article/${sideStoryOne.id}`} target="_blank" rel="noopener noreferrer">
              <img
                src={sideStoryOne.image}
                alt="Sports update"
                className="mt-2 h-32 w-full rounded object-cover"
              />
            </Link>
            <p className="pt-2 text-xs text-black/80">{sideStoryOne.title}</p>
          </article>

          <article className="rounded bg-[#e4e5e7] p-2">
            <Link to={`/sports/article/${sideStoryTwo.id}`} target="_blank" rel="noopener noreferrer">
              <img
                src={sideStoryTwo.image}
                alt="Sports headline"
                className="h-32 w-full rounded object-cover brightness-90"
              />
            </Link>
            <p className="pt-2 text-xs text-black/80">{sideStoryTwo.title}</p>
          </article>
        </aside>
      </div>

      <div className="mx-auto mt-10 w-full max-w-5xl">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-3xl font-semibold text-black/80">Category</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 0))}
              disabled={categoryPage === 0}
              className={`rounded border border-black/30 px-3 py-1 text-sm ${
                categoryPage === 0 ? "cursor-not-allowed text-black/30" : "text-black hover:bg-white/70"
              }`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages - 1))}
              disabled={categoryPage >= totalCategoryPages - 1}
              className={`rounded border border-black/30 px-3 py-1 text-sm ${
                categoryPage >= totalCategoryPages - 1
                  ? "cursor-not-allowed text-black/30"
                  : "text-black hover:bg-white/70"
              }`}
            >
              Next
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              to={`/sports/category/${category.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded bg-[#d0d3d8]"
            >
              <img src={category.image} alt={category.name} className="h-40 w-full bg-[#cfd2d7] p-1 object-contain" />
              <p className="px-3 py-3 text-center text-2xl font-extrabold uppercase text-black/55">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-5xl">
        <h2 className="pb-4 text-4xl font-semibold text-black/80">Sports Article</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibleArticleCards.map((article) => (
            <article key={article.id}>
              <Link
                to={`/sports/article/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block overflow-hidden rounded"
              >
                <img src={article.image} alt={article.title} className="h-64 w-full object-cover" />
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pt-3 text-[34px] font-semibold leading-tight text-black/85"
                >
                  {article.title}
                </Link>
                <p className="pt-3 text-lg text-black/65">{article.summary}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() =>
              setArticleStart((prev) => (prev - 1 + articleCards.length) % articleCards.length)
            }
            className="rounded bg-[#c0c4ca] px-5 py-3 text-xl text-white"
            aria-label="Back"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => setArticleStart((prev) => (prev + 1) % articleCards.length)}
            className="rounded bg-[#2f3135] px-5 py-3 text-xl text-white"
            aria-label="Next"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded bg-[#d1d4d9]">
        <div className="relative grid gap-4 px-6 py-8 md:grid-cols-[1fr_320px] md:px-10">
          <div className="relative z-10 max-w-xl">
            <h3 className="text-5xl font-extrabold uppercase leading-[0.9] text-black/70">
              Newsletter
              <br />
              Subscription
            </h3>

            <form
              onSubmit={handleSubscribe}
              className="mt-6 flex max-w-md overflow-hidden rounded border border-black/35"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@gmail.com"
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
              {subscribeMessage || `Subscribers recorded: ${subscribers.length}`}
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
      </div>
    </section>
  );
}

export default Sports;
