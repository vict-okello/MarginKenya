import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const STORAGE_KEY = "margin_cookie_consent_v1";

export default function CookieConsent() {
  const API = import.meta.env.VITE_API_URL;
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const choice = window.localStorage.getItem(STORAGE_KEY);
    return !(choice === "accepted" || choice === "rejected");
  });

  function acceptCookies() {
    void sendChoice("accepted");
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Ignore storage errors and just hide the banner for this session.
    }
    setVisible(false);
  }

  function rejectCookies() {
    void sendChoice("rejected");
    try {
      window.localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {
      // Ignore storage errors and just hide the banner for this session.
    }
    setVisible(false);
  }

  async function sendChoice(choice) {
    if (!API) return;
    try {
      await fetch(`${API}/api/cookie-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice,
          source: "website_banner",
          path: window.location?.pathname || "/",
        }),
      });
    } catch {
      // Ignore API failures; local consent state still applies.
    }
  }

  return (
    <AnimatePresence>
      {visible ? (
        <MotionDiv
          className="fixed inset-x-0 bottom-4 z-[80] px-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <div className="mx-auto w-full max-w-5xl rounded-2xl border border-black/20 bg-[#ece8df] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-black/80">
                MarginKenya uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and deliver relevant content. You can manage your preferences at any time.
              </p>
              <div className="flex gap-2">
                <MotionButton
                  type="button"
                  onClick={rejectCookies}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md border border-black/25 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/75 transition hover:bg-black/5"
                >
                  Reject
                </MotionButton>
                <MotionButton
                  type="button"
                  onClick={acceptCookies}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-black/85"
                >
                  Accept Cookie
                </MotionButton>
              </div>
            </div>
          </div>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
