import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import CookieConsent from "../components/CookieConsent";
import usePageViewTracker from "../hooks/usePageViewTracker";

function Main() {
  const location = useLocation();
  usePageViewTracker();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Marginkenya";
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#d8d8dc] flex flex-col">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}

export default Main;
