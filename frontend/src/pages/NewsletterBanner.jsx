import { useState } from "react";

function NewsletterBanner({ variant = "home" }) {
  const API = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });
  const isSports = variant === "sports";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFeedback({ type: "error", message: "Please enter an email address." });
      return;
    }

    try {
      if (!API) throw new Error("API is unavailable.");

      const res = await fetch(`${API}/api/subscribers/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, source: isSports ? "sports_style_banner" : "home_banner" }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Subscription failed.");

      setFeedback({
        type: "success",
        message: json?.message || `Thanks, ${trimmedEmail} is now subscribed to updates.`,
      });
      setEmail("");
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Could not subscribe. Please try again.",
      });
    }
  };

  return (
    <section className="bg-[#d8d8dc] px-2 pb-6 pt-2 sm:px-4 sm:pb-8">
      <div
        className={`mx-auto w-full max-w-5xl overflow-hidden rounded px-3 py-5 sm:px-6 sm:py-7 md:px-8 ${
          isSports ? "bg-[#d1d4d9]" : "bg-[#b84a3d]"
        }`}
      >
        <div className="grid gap-5 sm:gap-6 md:grid-cols-[1fr_280px] md:items-center">
          <div className="min-w-0">
            {isSports ? (
              <>
                <h2 className="max-w-lg break-words text-[clamp(1.55rem,9.5vw,3rem)] font-extrabold uppercase leading-[0.95] text-black/70 md:text-6xl">
                  Newsletter
                  <br />
                  Subscription
                </h2>
                <p className="max-w-lg pt-2 text-sm text-black/70 md:pt-3 md:text-base">
                  Get curated updates and weekly highlights directly in your inbox.
                </p>
              </>
            ) : (
              <>
                <h2 className="max-w-lg text-[clamp(1.5rem,7vw,2rem)] font-semibold leading-tight text-white md:text-[34px]">
                  Stay informed with our latest news and updates.
                </h2>
                <p className="max-w-lg pt-2 text-xs text-white/90 md:pt-3 md:text-sm">
                  Get breaking news and curated stories delivered to your inbox every day.
                  Be the first to know what is happening around the world.
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3 md:max-w-[280px] md:justify-self-end" noValidate>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (feedback.message) {
                  setFeedback({ type: "idle", message: "" });
                }
              }}
              placeholder="Enter your email"
              className={`w-full rounded border border-black/25 px-3 py-2.5 text-sm text-black/80 placeholder:text-black/35 focus:outline-none ${
                isSports ? "bg-[#d8dbe0]" : "bg-white"
              }`}
              required
            />
            <button
              type="submit"
              className={`w-full rounded px-4 py-2.5 text-sm font-semibold text-white transition ${
                isSports ? "bg-[#2f3135] hover:bg-black" : "bg-black hover:bg-black/85"
              }`}
            >
              Sign Up
            </button>

            {feedback.message ? (
              <p
                role="status"
                aria-live="polite"
                className={`break-words text-xs ${
                  feedback.type === "success"
                    ? isSports
                      ? "text-black/75"
                      : "text-white"
                    : isSports
                      ? "text-red-700"
                      : "text-yellow-100"
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
          </form>
        </div>

        {!isSports ? (
          <p className="mt-4 text-3xl font-black uppercase leading-none text-black/12 sm:mt-6 sm:text-4xl md:text-6xl">
            Margin
            <span className="ml-1 align-super text-sm font-semibold tracking-wide md:text-base">ke</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default NewsletterBanner;
