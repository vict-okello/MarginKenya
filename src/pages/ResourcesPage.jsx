import ArticlesResources from "./ArticlesResources";

function ResourcesPage() {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-semibold uppercase tracking-wide text-black/85 md:text-6xl">
          Articles & Resources
        </h1>
        <p className="pt-2 text-sm text-black/65">
          Guides, research, and deep dives to keep you informed.
        </p>
      </div>
      <ArticlesResources withSection={false} showHeader={false} />
    </section>
  );
}

export default ResourcesPage;
