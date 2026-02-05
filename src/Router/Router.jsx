import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/Home.jsx";
import Worldnews from "../pages/Worldnews.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import Sports from "../pages/Sports.jsx";
import SportsArticle from "../pages/SportsArticle.jsx";
import SportsCategory from "../pages/SportsCategory.jsx";
import Health from "../pages/Health.jsx";
import HealthArticle from "../pages/HealthArticle.jsx";
import LatestNewsArticle from "../pages/LatestNewsArticle.jsx";

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
        element: <Worldnews />,
      },
      {
        path: "latest-news/:articleId",
        element: <LatestNewsArticle />,
      },
      {
        path: "politics",
        element: <CategoryPage title="Politics" />,
      },
      {
        path: "business",
        element: <CategoryPage title="Business" />,
      },
      {
        path: "technology",
        element: <CategoryPage title="Technology" />,
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
        element: <CategoryPage title="Culture" />,
      },
      {
        path: "podcast",
        element: <CategoryPage title="Podcast" />,
      },
    ],
  },
]);

export default router;
