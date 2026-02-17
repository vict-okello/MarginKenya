import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function SportsCategory() {
  const API = import.meta.env.VITE_API_URL;
  const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  const { categoryId } = useParams();
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadCategories() {
      try {
        const res = await fetch(`${API}/api/sports-categories`);
        const json = await res.json().catch(() => []);
        if (!res.ok) return;
        const next = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        if (alive) setCategoryList(next);
      } catch {
        if (alive) setCategoryList([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (API) {
      loadCategories();
    } else {
      setLoading(false);
    }

    return () => {
      alive = false;
    };
  }, [API]);

  const resolveImageUrl = useMemo(() => {
    return (url) => {
      if (!url) return "";
      if (/^https?:\/\//i.test(url)) return url;
      if (/^\/?uploads\//i.test(url)) {
        const normalized = url.startsWith("/") ? url : `/${url}`;
        return base ? `${base}${normalized}` : normalized;
      }
      return url;
    };
  }, [base]);

  const currentIndex = categoryList.findIndex((item) => String(item.id) === String(categoryId));
  const category = categoryList[currentIndex];
  const prevCategory =
    currentIndex >= 0
      ? categoryList[(currentIndex - 1 + categoryList.length) % categoryList.length]
      : null;
  const nextCategory =
    currentIndex >= 0 ? categoryList[(currentIndex + 1) % categoryList.length] : null;

  if (loading) {
    return null;
  }

  if (!category) {
    return (
      <section className="bg-[#d8d8dc] px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-4xl font-semibold text-black">Category not found</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#d8d8dc] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex justify-end gap-2">
          <Link
            to={prevCategory ? `/sports/category/${prevCategory.id}` : "/sports"}
            className="rounded border border-black/30 px-3 py-1 text-sm text-black hover:bg-white/70"
          >
            &larr; Prev
          </Link>
          <Link
            to={nextCategory ? `/sports/category/${nextCategory.id}` : "/sports"}
            className="rounded border border-black/30 px-3 py-1 text-sm text-black hover:bg-white/70"
          >
            Next &rarr;
          </Link>
        </div>
        <img src={resolveImageUrl(category.image)} alt={category.name} className="w-full rounded object-contain" />
        <h1 className="pt-6 text-4xl font-semibold text-black">{category.title}</h1>
        <p className="pt-3 text-black/75">{category.summary}</p>
        <p className="pt-4 text-black/80">{category.body}</p>
      </div>
    </section>
  );
}

export default SportsCategory;
