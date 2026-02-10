import ArticlePage from "./ArticlePage";
import { worldNewsArticles } from "../data/worldNewsArticles";

export default function WorldnewsArticle() {
  return (
    <ArticlePage
      data={worldNewsArticles}
      backTo="/worldnews"
      backLabel="Back to World News"
      sectionName="World"
    />
  );
}