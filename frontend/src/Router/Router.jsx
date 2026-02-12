import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";

import Home from "../pages/Home.jsx";
import Worldnews from "../pages/Worldnews.jsx";
import WorldnewsArticle from "../pages/WorldnewsArticle.jsx";
import HeroArticlePage from "../pages/worldnews/HeroArticlePage.jsx";
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
import AdminLayout from "../layout/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminHero from "../pages/admin/AdminHero.jsx";
import AdminSports from "../pages/admin/AdminSports.jsx";
import AdminLogin from "../pages/admin/AdminLogin.jsx";
import AdminWorld from "../pages/admin/AdminWorld.jsx";
import AdminTechnology from "../pages/admin/AdminTechnology.jsx";
import AdminHealth from "../pages/admin/AdminHealth.jsx";
import AdminBusiness from "../pages/admin/AdminBusiness.jsx";
import AdminPolitics from "../pages/admin/AdminPolitics.jsx";
import AdminCulture from "../pages/admin/AdminCulture.jsx";
import AdminSettings from "../pages/admin/AdminSettings.jsx";
import AdminPodcast from "../pages/admin/AdminPodcast.jsx";
import AdminLatestNews from "../pages/admin/AdminLatestNews.jsx";
import AdminResources from "../pages/admin/AdminResources.jsx";
import AdminNewsletter from "../pages/admin/AdminNewsletter.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      { index: true, element: <Home /> },

      { path: "worldnews", element: <Worldnews showViewAll={false} variant="page" /> },
      { path: "worldnews/article/:articleId", element: <WorldnewsArticle /> },
      { path: "hero/article/:id", element: <HeroArticlePage /> },

      { path: "resources", element: <ResourcesPage /> },
      { path: "resources/article/:articleId", element: <ArticlesResourcesArticle /> },

      { path: "latest-news", element: <LatestNewsPage /> },
      { path: "latest-news/:articleId", element: <LatestNewsArticle /> },

      { path: "politics", element: <Politics /> },
      { path: "politics/article/:articleId", element: <PoliticsArticle /> },

      { path: "business", element: <Business /> },
      { path: "business/article/:articleId", element: <BusinessArticle /> },

      { path: "technology", element: <Technology /> },
      { path: "technology/article/:articleId", element: <TechnologyArticle /> },

      { path: "health", element: <Health /> },
      { path: "health/article/:articleId", element: <HealthArticle /> },

      { path: "sports", element: <Sports /> },
      { path: "sports/article/:articleId", element: <SportsArticle /> },
      { path: "sports/category/:categoryId", element: <SportsCategory /> },

      { path: "culture", element: <Culture /> },
      { path: "culture/article/:articleId", element: <CultureArticle /> },

      { path: "podcast", element: <Podcast /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  { path: "/admin-login", element: <AdminLogin /> },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "hero", element: <AdminHero /> },
      { path: "world", element: <AdminWorld /> },
      { path: "latest-news", element: <AdminLatestNews /> },
      { path: "resources", element: <AdminResources /> },
      { path: "technology", element: <AdminTechnology /> },
      { path: "health", element: <AdminHealth /> },
      { path: "business", element: <AdminBusiness /> },
      { path: "politics", element: <AdminPolitics /> },
      { path: "culture", element: <AdminCulture /> },
      { path: "sports", element: <AdminSports /> },
      { path: "podcast", element: <AdminPodcast /> },
      { path: "newsletter", element: <AdminNewsletter /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);

export default router;
