function CategoryPage({ title }) {
  return (
    <section className="bg-[#d8d8dc] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl font-semibold text-black">{title}</h1>
        <p className="pt-3 text-black/70">Content for {title} will be added here.</p>
      </div>
    </section>
  );
}

export default CategoryPage;
