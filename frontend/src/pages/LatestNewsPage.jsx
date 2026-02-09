import LatestNews from "./LatestNews";

function LatestNewsPage() {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
          Latest News
        </h1>
        <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
        <p className="pt-3 text-sm text-black/65">
          Breaking headlines and the stories shaping today’s conversation.
        </p>
        <div className="mt-4 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
          Latest Pulse: breaking updates, verified developments, and cross-desk signals in real time.
        </div>
      </div>
      <LatestNews withSection={false} showHeader={false} />
    </section>
  );
}

export default LatestNewsPage;
