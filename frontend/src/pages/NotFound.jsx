import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="bg-[#d8d8dc] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-black/60">404</p>
        <h1 className="pt-2 text-4xl font-semibold text-black">Page not found</h1>
        <p className="pt-3 text-black/70">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded border border-black/35 px-4 py-2 text-sm font-medium text-black/75 transition hover:bg-black/5 hover:text-black"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
