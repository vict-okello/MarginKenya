import LatestNews from "./LatestNews";

function LatestNewsPage() {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-semibold uppercase tracking-wide text-black/85 md:text-6xl">
          Latest News
        </h1>
        <p className="pt-2 text-sm text-black/65">
          Breaking headlines and the stories shaping today’s conversation.
        </p>
      </div>
      <LatestNews withSection={false} showHeader={false} />
    </section>
  );
}

export default LatestNewsPage;
