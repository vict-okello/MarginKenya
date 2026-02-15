import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sportsArticles, sportsCategories } from "../../data/sportsArticles";

const STORAGE_KEY = "admin_sports_draft_v1";
const CATEGORY_STORAGE_KEY = "admin_sports_categories_draft_v1";
const CATEGORY_PAGE_SIZE = 4;

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSportsArticles(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    return Object.values(input);
  }
  return [];
}

function cloneStories(input = []) {
  const list = normalizeSportsArticles(input);
  return list.map((s, i) => ({
    id: s?.id || `sports-${i}-${makeId()}`,
    title: s?.title || "",
    summary: s?.summary || "",
    body: s?.body || "",
    date: s?.date || "",
    author: s?.author || "",
    authorName: s?.authorName || s?.author || "",
    authorRole: s?.authorRole || "",
    authorBio: s?.authorBio || "",
    category: s?.category || "Sports",
    image: s?.image || "",
  }));
}

function normalizeSportsCategories(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    return Object.values(input);
  }
  return [];
}

function cloneCategories(input = []) {
  const list = normalizeSportsCategories(input);
  return list.map((c, i) => ({
    id: c?.id || `sports-category-${i}-${makeId()}`,
    name: c?.name || "",
    title: c?.title || "",
    summary: c?.summary || "",
    body: c?.body || "",
    image: c?.image || "",
  }));
}

function loadInitialStories() {
  if (typeof window === "undefined") return cloneStories(sportsArticles);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneStories(sportsArticles);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneStories(sportsArticles);
    return cloneStories(parsed);
  } catch {
    return cloneStories(sportsArticles);
  }
}

function loadInitialCategories() {
  if (typeof window === "undefined") return cloneCategories(sportsCategories);

  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return cloneCategories(sportsCategories);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneCategories(sportsCategories);
    return cloneCategories(parsed);
  } catch {
    return cloneCategories(sportsCategories);
  }
}

export default function AdminSport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [stories, setStories] = useState(() => loadInitialStories());
  const [selectedId, setSelectedId] = useState(() => loadInitialStories()[0]?.id || "");
  const [editorOpen, setEditorOpen] = useState(true);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [categories, setCategories] = useState(() => loadInitialCategories());
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => loadInitialCategories()[0]?.id || "");
  const [categoryStart, setCategoryStart] = useState(0);
  const fileRef = useRef(null);
  const categoryFileRef = useRef(null);

  const selected = useMemo(
    () => stories.find((s) => String(s.id) === String(selectedId)) || stories[0] || null,
    [stories, selectedId]
  );

  const featured = stories[0] || null;
  const spotlight = stories.slice(1, 3);
  const feed = stories.slice(3);
  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(selectedCategoryId)) || categories[0] || null,
    [categories, selectedCategoryId]
  );
  const maxCategoryStart = Math.max(0, categories.length - CATEGORY_PAGE_SIZE);
  const safeCategoryStart = Math.min(categoryStart, maxCategoryStart);
  const visibleCategories = categories.slice(safeCategoryStart, safeCategoryStart + CATEGORY_PAGE_SIZE);

  useEffect(() => {
    if (!stories.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !stories.some((s) => String(s.id) === String(selectedId))) {
      setSelectedId(stories[0].id);
    }
  }, [stories, selectedId]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId("");
      return;
    }
    if (!selectedCategoryId || !categories.some((c) => String(c.id) === String(selectedCategoryId))) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    let mounted = true;

    async function loadPublished() {
      if (!API) return;
      setLoadingPublished(true);
      try {
        const res = await fetch(`${API}/api/sports`);
        const json = await res.json().catch(() => []);
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) {
          const next = cloneStories(json);
          setStories(next);
          setSelectedId(next[0]?.id || "");
          setNotice("Loaded published sports stories.");
        }
      } catch {
        // Keep local draft fallback.
      } finally {
        if (mounted) setLoadingPublished(false);
      }
    }

    loadPublished();
    return () => {
      mounted = false;
    };
  }, [API]);

  useEffect(() => {
    let mounted = true;

    async function loadPublishedCategories() {
      if (!API) return;
      try {
        const res = await fetch(`${API}/api/sports-categories`);
        const json = await res.json().catch(() => []);
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) {
          const next = cloneCategories(json);
          setCategories(next);
          setSelectedCategoryId(next[0]?.id || "");
        }
      } catch {
        // Keep local draft fallback.
      }
    }

    loadPublishedCategories();
    return () => {
      mounted = false;
    };
  }, [API]);

  function patchSelected(patch) {
    if (!selected) return;
    setStories((prev) => prev.map((s) => (String(s.id) === String(selected.id) ? { ...s, ...patch } : s)));
  }

  function addStory() {
    const next = {
      id: makeId(),
      title: "",
      summary: "",
      body: "",
      date: new Date().toISOString().slice(0, 10),
      author: "",
      authorName: "",
      authorRole: "",
      authorBio: "",
      category: "Sports",
      image: "",
    };
    setStories((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setEditorOpen(true);
    setNotice("New sports story added.");
  }

  function deleteSelected() {
    if (!selected) return;
    setStories((prev) => {
      const next = prev.filter((s) => String(s.id) !== String(selected.id));
      setSelectedId(next[0]?.id || "");
      return next;
    });
    setNotice("Story removed.");
  }

  function moveSelected(direction) {
    if (!selected) return;
    setStories((prev) => {
      const next = [...prev];
      const index = next.findIndex((s) => String(s.id) === String(selected.id));
      if (index < 0) return prev;

      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= next.length) return prev;

      const tmp = next[index];
      next[index] = next[swap];
      next[swap] = tmp;
      return next;
    });
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
      setNotice("Sports stories and categories draft saved locally.");
    } catch {
      setNotice("Could not save draft in this browser.");
    }
  }

  function resetFromDefault() {
    const nextStories = cloneStories(sportsArticles);
    const nextCategories = cloneCategories(sportsCategories);
    setStories(nextStories);
    setSelectedId(nextStories[0]?.id || "");
    setCategories(nextCategories);
    setSelectedCategoryId(nextCategories[0]?.id || "");
    setNotice("Reset to default sports content.");
  }

  async function publishStories() {
    if (!API) {
      setNotice("VITE_API_URL is missing.");
      return;
    }
    if (!token) {
      setNotice("Missing admin token. Please login again.");
      return;
    }

    setPublishing(true);
    try {
      const storiesRes = await fetch(`${API}/api/sports`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stories),
      });

      const categoriesRes = await fetch(`${API}/api/sports-categories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categories),
      });

      const storiesJson = await storiesRes.json().catch(() => ({}));
      const categoriesJson = await categoriesRes.json().catch(() => ({}));

      if (!storiesRes.ok) throw new Error(storiesJson?.message || "Stories publish failed");
      if (!categoriesRes.ok) throw new Error(categoriesJson?.message || "Categories publish failed");

      const nextStories = Array.isArray(storiesJson?.data) ? cloneStories(storiesJson.data) : stories;
      const nextCategories = Array.isArray(categoriesJson?.data) ? cloneCategories(categoriesJson.data) : categories;
      setStories(nextStories);
      setSelectedId(nextStories[0]?.id || "");
      setCategories(nextCategories);
      setSelectedCategoryId(nextCategories[0]?.id || "");
      setNotice("Published. Sports stories and categories are now updated.");
    } catch (err) {
      setNotice(err?.message || "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  function patchSelectedCategory(patch) {
    if (!selectedCategory) return;
    setCategories((prev) =>
      prev.map((c) => (String(c.id) === String(selectedCategory.id) ? { ...c, ...patch } : c))
    );
  }

  function addCategory() {
    const next = {
      id: makeId(),
      name: "",
      title: "",
      summary: "",
      body: "",
      image: "",
    };
    setCategories((prev) => [next, ...prev]);
    setSelectedCategoryId(next.id);
    setCategoryEditorOpen(true);
    setNotice("New sports category added.");
  }

  function deleteSelectedCategory() {
    if (!selectedCategory) return;
    setCategories((prev) => {
      const next = prev.filter((c) => String(c.id) !== String(selectedCategory.id));
      setSelectedCategoryId(next[0]?.id || "");
      return next;
    });
    setNotice("Category removed.");
  }

  function moveSelectedCategory(direction) {
    if (!selectedCategory) return;
    setCategories((prev) => {
      const next = [...prev];
      const index = next.findIndex((c) => String(c.id) === String(selectedCategory.id));
      if (index < 0) return prev;

      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= next.length) return prev;

      const tmp = next[index];
      next[index] = next[swap];
      next[swap] = tmp;
      return next;
    });
  }

  async function uploadSelectedCategoryImage(file) {
    if (!selectedCategory) return;
    if (!API) {
      setNotice("VITE_API_URL is missing.");
      return;
    }
    if (!token) {
      setNotice("Missing admin token. Please login again.");
      return;
    }

    setUploadingCategory(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/uploads/sports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Image upload failed");
      if (!json?.url) throw new Error("Upload succeeded but URL is missing.");

      patchSelectedCategory({ image: json.url });
      setNotice("Category image uploaded.");
    } catch (err) {
      setNotice(err?.message || "Image upload failed.");
    } finally {
      setUploadingCategory(false);
      if (categoryFileRef.current) categoryFileRef.current.value = "";
    }
  }

  async function uploadSelectedImage(file) {
    if (!selected) return;
    if (!API) {
      setNotice("VITE_API_URL is missing.");
      return;
    }
    if (!token) {
      setNotice("Missing admin token. Please login again.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/uploads/sports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Image upload failed");
      if (!json?.url) throw new Error("Upload succeeded but URL is missing.");

      patchSelected({ image: json.url });
      setNotice("Image uploaded.");
    } catch (err) {
      setNotice(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function resolveImageUrl(image) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    if (/^\/?uploads\//i.test(image)) {
      const base = (API || "").replace(/\/+$/, "").replace(/\/api$/i, "");
      const normalized = image.startsWith("/") ? image : `/${image}`;
      return base ? `${base}${normalized}` : normalized;
    }
    return image;
  }

  function goPrevCategoryPage() {
    setCategoryStart((prev) => Math.max(0, prev - CATEGORY_PAGE_SIZE));
  }

  function goNextCategoryPage() {
    setCategoryStart((prev) => Math.min(maxCategoryStart, prev + CATEGORY_PAGE_SIZE));
  }

  return (
    <section className="space-y-4 text-zinc-900">
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Sports Edits</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Match the live Sports page order and edit story cards before publishing from code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addStory}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              New Story
            </button>
            <button
              type="button"
              onClick={addCategory}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              New Category
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={publishStories}
              disabled={publishing || loadingPublished}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
            <button
              type="button"
              onClick={resetFromDefault}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm text-zinc-700">{notice}</div>
      ) : null}

      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Preview</h2>

        {featured ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <article className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
              <div className="overflow-hidden rounded-xl bg-zinc-200">
                {featured.image ? (
                  <img src={resolveImageUrl(featured.image)} alt={featured.title || "Featured sports story"} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-sm text-zinc-500">No image</div>
                )}
              </div>
              <p className="pt-3 text-xs uppercase tracking-[0.12em] text-zinc-600">
                {featured.category || "Sports"} - {featured.date || "Date"}
              </p>
              <h3 className="pt-2 text-3xl font-semibold leading-tight text-zinc-900">{featured.title || "Untitled featured story"}</h3>
              <p className="pt-2 text-sm text-zinc-700">{featured.summary || "Add summary"}</p>
            </article>

            <div className="grid gap-4">
              {spotlight.map((story) => (
                <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    <div className="overflow-hidden rounded-xl bg-zinc-200">
                      {story.image ? (
                        <img src={resolveImageUrl(story.image)} alt={story.title || "Sports story"} className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs text-zinc-500">No image</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                        {story.author || "Author"} - {story.date || "Date"}
                      </p>
                      <h3 className="pt-1 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                      <p className="pt-2 text-sm text-zinc-700">{story.summary || "Add summary"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {feed.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feed.map((story) => (
              <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                <div className="overflow-hidden rounded-xl bg-zinc-200">
                  {story.image ? (
                    <img src={resolveImageUrl(story.image)} alt={story.title || "Sports story"} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <p className="pt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">
                  {story.category || "Sports"} - {story.date || "Date"}
                </p>
                <h3 className="pt-2 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                <p className="pt-2 text-xs text-zinc-600">{story.author || "Author"}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Categories Preview</h2>
          {categories.length > CATEGORY_PAGE_SIZE ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goPrevCategoryPage}
                disabled={safeCategoryStart === 0}
                className={`rounded border px-3 py-1 text-sm ${
                  safeCategoryStart === 0
                    ? "cursor-not-allowed border-zinc-300 text-zinc-400"
                    : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={goNextCategoryPage}
                disabled={safeCategoryStart >= maxCategoryStart}
                className={`rounded border px-3 py-1 text-sm ${
                  safeCategoryStart >= maxCategoryStart
                    ? "cursor-not-allowed border-zinc-300 text-zinc-400"
                    : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                &rarr;
              </button>
            </div>
          ) : null}
        </div>

        {visibleCategories.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCategories.map((category) => (
              <article key={category.id} className="overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100">
                <div className="overflow-hidden bg-zinc-200">
                  {category.image ? (
                    <img
                      src={resolveImageUrl(category.image)}
                      alt={category.name || "Sports category"}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Category</p>
                  <h3 className="pt-2 text-2xl leading-tight text-zinc-900">{category.name || "Untitled category"}</h3>
                  <p className="pt-2 text-sm text-zinc-700">{category.summary || "Add summary"}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-600">
            No sports categories yet. Click <span className="font-semibold">New Category</span> to add one.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white/70">
        <button
          type="button"
          onClick={() => setEditorOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3"
        >
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Story Editor</p>
            <p className="mt-1 text-xs text-zinc-600">Select and edit story details in the exact display order.</p>
          </div>
          <span className="rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800">
            {editorOpen ? "Collapse" : "Expand"}
          </span>
        </button>

        {editorOpen ? (
          <div className="border-t border-zinc-200 p-4">
            <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Stories</p>
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {stories.map((story, idx) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => setSelectedId(story.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        String(selected?.id) === String(story.id)
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-wide opacity-80">Position {idx + 1}</p>
                      <p className="truncate font-semibold">{story.title || "Untitled"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-zinc-600">Select a story to edit.</p>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Title" value={selected.title} onChange={(v) => patchSelected({ title: v })} />
                      <Field
                        label="Author Name"
                        value={selected.authorName || selected.author}
                        onChange={(v) => patchSelected({ author: v, authorName: v })}
                      />
                      <Field label="Author Role" value={selected.authorRole} onChange={(v) => patchSelected({ authorRole: v })} />
                      <Field label="Category" value={selected.category} onChange={(v) => patchSelected({ category: v })} />
                      <Field label="Date" value={selected.date} onChange={(v) => patchSelected({ date: v })} />
                      <Field label="Image URL" value={selected.image} onChange={(v) => patchSelected({ image: v })} />
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Image Upload</p>
                      <p className="mt-1 text-xs text-zinc-600">Upload image from your laptop (JPG, PNG, WEBP, GIF).</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                        >
                          {uploading ? "Uploading..." : "Upload From Laptop"}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSelectedImage(file);
                          }}
                        />
                        <span className="text-xs text-zinc-600">{selected.image ? "Image is set." : "No image selected."}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Author Credibility Line</label>
                      <textarea
                        value={selected.authorBio}
                        onChange={(e) => patchSelected({ authorBio: e.target.value })}
                        rows={2}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Summary</label>
                      <textarea
                        value={selected.summary}
                        onChange={(e) => patchSelected({ summary: e.target.value })}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Body</label>
                      <textarea
                        value={selected.body}
                        onChange={(e) => patchSelected({ body: e.target.value })}
                        rows={8}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveSelected("up")}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSelected("down")}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Move Down
                      </button>
                      <button
                        type="button"
                        onClick={deleteSelected}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Delete Story
                      </button>
                      <Link
                        to={`/sports/article/${selected.id}`}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Open Article
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white/70">
        <button
          type="button"
          onClick={() => setCategoryEditorOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3"
        >
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Category Editor</p>
            <p className="mt-1 text-xs text-zinc-600">Edit sports category cards and order shown on Sports page.</p>
          </div>
          <span className="rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800">
            {categoryEditorOpen ? "Collapse" : "Expand"}
          </span>
        </button>

        {categoryEditorOpen ? (
          <div className="border-t border-zinc-200 p-4">
            <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Categories</p>
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {categories.map((category, idx) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        String(selectedCategory?.id) === String(category.id)
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-wide opacity-80">Position {idx + 1}</p>
                      <p className="truncate font-semibold">{category.name || "Untitled category"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {!selectedCategory ? (
                  <p className="text-sm text-zinc-600">Select a category to edit.</p>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Name" value={selectedCategory.name} onChange={(v) => patchSelectedCategory({ name: v })} />
                      <Field label="Title" value={selectedCategory.title} onChange={(v) => patchSelectedCategory({ title: v })} />
                      <Field label="Image URL" value={selectedCategory.image} onChange={(v) => patchSelectedCategory({ image: v })} />
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Image Upload</p>
                      <p className="mt-1 text-xs text-zinc-600">Upload category image from your laptop (JPG, PNG, WEBP, GIF).</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => categoryFileRef.current?.click()}
                          disabled={uploadingCategory}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                        >
                          {uploadingCategory ? "Uploading..." : "Upload Category Image"}
                        </button>
                        <input
                          ref={categoryFileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSelectedCategoryImage(file);
                          }}
                        />
                        <span className="text-xs text-zinc-600">{selectedCategory.image ? "Image is set." : "No image selected."}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Summary</label>
                      <textarea
                        value={selectedCategory.summary}
                        onChange={(e) => patchSelectedCategory({ summary: e.target.value })}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Body</label>
                      <textarea
                        value={selectedCategory.body}
                        onChange={(e) => patchSelectedCategory({ body: e.target.value })}
                        rows={6}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveSelectedCategory("up")}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSelectedCategory("down")}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Move Down
                      </button>
                      <button
                        type="button"
                        onClick={deleteSelectedCategory}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Delete Category
                      </button>
                      <Link
                        to={`/sports/category/${selectedCategory.id}`}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                      >
                        Open Category
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
      />
    </div>
  );
}
