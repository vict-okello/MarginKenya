import { useState } from "react";

function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFeedback({ type: "error", message: "Please enter an email address." });
      return;
    }

    setFeedback({
      type: "success",
      message: `Thanks, ${trimmedEmail} is now subscribed to updates.`,
    });
    setEmail("");
  };

  return (
    <section className="bg-[#d8d8dc] px-4 pb-8 pt-2">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded bg-[#b84a3d] px-6 py-7 md:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-center">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold leading-tight text-white md:text-[34px]">
              Stay informed with our latest news and updates.
            </h2>
            <p className="max-w-lg pt-3 text-xs text-white/90 md:text-sm">
              Get breaking news and curated stories delivered to your inbox every day.
              Be the first to know what is happening around the world.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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
              className="w-full rounded border border-black/25 bg-white px-3 py-2.5 text-sm text-black/80 placeholder:text-black/35 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full rounded bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Sign Up
            </button>

            {feedback.message ? (
              <p
                role="status"
                aria-live="polite"
                className={`text-xs ${
                  feedback.type === "success" ? "text-white" : "text-yellow-100"
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
          </form>
        </div>

        <p className="mt-6 text-4xl font-black uppercase leading-none text-black/12 md:text-6xl">
          Margin
          <span className="ml-1 align-super text-sm font-semibold tracking-wide md:text-base">ke</span>
        </p>
      </div>
    </section>
  );
}

export default NewsletterBanner;
