function CategoryPage({ title }) {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
          {title}
        </h1>
        <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
        <p className="pt-3 text-sm text-black/65">
          Curated coverage and analysis from the {title} desk.
        </p>
        <p className="pt-4 text-black/70">Content for {title} will be added here.</p>
      </div>
    </section>
  );
}

export default CategoryPage;
