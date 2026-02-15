export default function ArticleAuthorBox({ article, fallbackName = "Margin Kenya Desk" }) {
  const name = article?.authorName || article?.author || article?.source || fallbackName;
  const role = article?.authorRole || "Staff Writer";
  const credibility =
    article?.authorBio || article?.authorCredibility || article?.credibilityLine || "";

  if (!name && !role && !credibility) return null;

  return (
    <section className="mt-8 rounded-2xl border border-black/15 bg-white/45 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/60">About The Author</p>
      <h3 className="pt-2 text-2xl font-semibold text-black/90">{name}</h3>
      {role ? <p className="pt-1 text-sm text-black/65">{role}</p> : null}
      {credibility ? <p className="pt-3 text-sm leading-relaxed text-black/75">{credibility}</p> : null}
    </section>
  );
}
