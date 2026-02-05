function CategoryPage({ title }) {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-5xl font-semibold uppercase tracking-wide text-black/85 md:text-6xl">
          {title}
        </h1>
        <p className="pt-2 text-sm text-black/65">
          Curated coverage and analysis from the {title} desk.
        </p>
        <p className="pt-4 text-black/70">Content for {title} will be added here.</p>
      </div>
    </section>
  );
}

export default CategoryPage;
