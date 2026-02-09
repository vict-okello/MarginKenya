import ArticlesResources from "./ArticlesResources";

function ResourcesPage() {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
          Articles & Resources
        </h1>
        <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
        <p className="pt-3 text-sm text-black/65">
          Guides, research, and deep dives to keep you informed.
        </p>
        <div className="mt-4 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
          Resource Pulse: expert guides, practical toolkits, and research-backed insights in one feed.
        </div>
      </div>
      <ArticlesResources withSection={false} showHeader={false} />
    </section>
  );
}

export default ResourcesPage;
