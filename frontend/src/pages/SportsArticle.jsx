import ArticlePage from "./ArticlePage";
import { sportsArticles } from "../data/sportsArticles";

export default function SportsArticle() {
  // your sportsArticles is an object, so convert to array
  const data = Object.values(sportsArticles);

  return (
    <ArticlePage
      data={data}
      backTo="/sports"
      backLabel="Back to Sports"
      sectionName="Sports"
    />
  );
}