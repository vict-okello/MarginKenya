import { useParams } from "react-router-dom";
import { sportsArticles } from "../data/sportsArticles";

function SportsArticle() {
  const { articleId } = useParams();
  const article = Object.values(sportsArticles).find((item) => item.id === articleId);

  if (!article) {
    return (
      <section className="bg-[#d8d8dc] px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-4xl font-semibold text-black">Article not found</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#d8d8dc] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <img
          src={article.image}
          alt={article.title}
          className="w-full rounded object-contain"
        />
        <h1 className="pt-6 text-4xl font-semibold text-black">{article.title}</h1>
        <p className="pt-3 text-black/75">{article.summary}</p>
        <p className="pt-4 text-black/80">{article.body}</p>
      </div>
    </section>
  );
}

export default SportsArticle;
