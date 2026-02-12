import LatestNews from "./LatestNews";
import NewsletterBanner from "./NewsletterBanner";

function LatestNewsPage() {
  return (
    <>
      <section className="bg-[#d8d8dc] px-4 py-12">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-black/15 bg-gradient-to-r from-[#eceff5] via-[#dfe5f0] to-[#d8dfea] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Latest Desk</p>
          <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]">
            Latest News
          </h1>
          <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
            Breaking headlines and the stories shaping today's conversation.
          </p>
          <div className="mt-5 rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
            Latest Pulse: breaking updates, verified developments, and cross-desk signals.
          </div>
        </div>
        <div className="mx-auto mt-5 w-full max-w-5xl">
          <LatestNews withSection={false} showHeader={false} />
        </div>
      </section>
      <NewsletterBanner variant="sports" />
    </>
  );
}

export default LatestNewsPage;

