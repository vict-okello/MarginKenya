import ArticlesResources from "./ArticlesResources";
import NewsletterBanner from "./NewsletterBanner";

function ResourcesPage() {
  return (
    <>
      <section className="bg-[#d8d8dc] px-4 py-12">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-black/15 bg-gradient-to-r from-[#edf2ec] via-[#dde7da] to-[#d5e0d2] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Resources Desk</p>
          <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]">
            Articles & Resources
          </h1>
          <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
            Guides, research, and deep dives to keep you informed.
          </p>
          <div className="mt-5 rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
            Resource Pulse: expert guides, practical toolkits, and research-backed insights.
          </div>
        </div>
        <div className="mx-auto mt-5 w-full max-w-5xl">
          <ArticlesResources withSection={false} showHeader={false} />
        </div>
      </section>
      <NewsletterBanner variant="sports" />
    </>
  );
}

export default ResourcesPage;

