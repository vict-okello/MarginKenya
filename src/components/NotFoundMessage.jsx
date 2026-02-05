import { Link } from "react-router-dom";

function NotFoundMessage({
  title = "Article not found",
  description,
  showBackHome = true,
  backTo,
  backLabel,
}) {
  const linkTarget = backTo || "/";
  const linkLabel = backLabel || "Back to Home";

  return (
    <section className="bg-[#d8d8dc] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {showBackHome ? (
          <Link
            to={linkTarget}
            className="inline-block rounded border border-black/35 px-4 py-2 text-sm font-medium text-black/75 transition hover:bg-black/5 hover:text-black"
          >
            &larr; {linkLabel}
          </Link>
        ) : null}
        <h1 className="pt-5 text-4xl font-semibold text-black">{title}</h1>
        {description ? <p className="pt-3 text-black/70">{description}</p> : null}
      </div>
    </section>
  );
}

export default NotFoundMessage;
