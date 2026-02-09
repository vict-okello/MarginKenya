import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/Home.jsx";
import Worldnews from "../pages/Worldnews.jsx";
import WorldnewsArticle from "../pages/WorldnewsArticle.jsx";
import ArticlesResourcesArticle from "../pages/ArticlesResourcesArticle.jsx";
import Sports from "../pages/Sports.jsx";
import SportsArticle from "../pages/SportsArticle.jsx";
import SportsCategory from "../pages/SportsCategory.jsx";
import Health from "../pages/Health.jsx";
import HealthArticle from "../pages/HealthArticle.jsx";
import LatestNewsArticle from "../pages/LatestNewsArticle.jsx";
import LatestNewsPage from "../pages/LatestNewsPage.jsx";
import Politics from "../pages/Politics.jsx";
import PoliticsArticle from "../pages/PoliticsArticle.jsx";
import Business from "../pages/Business.jsx";
import BusinessArticle from "../pages/BusinessArticle.jsx";
import Technology from "../pages/Technology.jsx";
import TechnologyArticle from "../pages/TechnologyArticle.jsx";
import Culture from "../pages/Culture.jsx";
import CultureArticle from "../pages/CultureArticle.jsx";
import Podcast from "../pages/Podcast.jsx";
import ResourcesPage from "../pages/ResourcesPage.jsx";
import NotFound from "../pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "worldnews",
        element: <Worldnews showViewAll={false} variant="page" />,
      },
      {
        path: "worldnews/article/:articleId",
        element: <WorldnewsArticle />,
      },
      {
        path: "resources/article/:articleId",
        element: <ArticlesResourcesArticle />,
      },
      {
        path: "resources",
        element: <ResourcesPage />,
      },
      {
        path: "latest-news",
        element: <LatestNewsPage />,
      },
      {
        path: "latest-news/:articleId",
        element: <LatestNewsArticle />,
      },
      {
        path: "politics",
        element: <Politics />,
      },
      {
        path: "politics/article/:articleId",
        element: <PoliticsArticle />,
      },
      {
        path: "business",
        element: <Business />,
      },
      {
        path: "business/article/:articleId",
        element: <BusinessArticle />,
      },
      {
        path: "technology",
        element: <Technology />,
      },
      {
        path: "technology/article/:articleId",
        element: <TechnologyArticle />,
      },
      {
        path: "health",
        element: <Health />,
      },
      {
        path: "health/article/:articleId",
        element: <HealthArticle />,
      },
      {
        path: "sports",
        element: <Sports />,
      },
      {
        path: "sports/article/:articleId",
        element: <SportsArticle />,
      },
      {
        path: "sports/category/:categoryId",
        element: <SportsCategory />,
      },
      {
        path: "culture",
        element: <Culture />,
      },
      {
        path: "culture/article/:articleId",
        element: <CultureArticle />,
      },
      {
        path: "podcast",
        element: <Podcast />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
