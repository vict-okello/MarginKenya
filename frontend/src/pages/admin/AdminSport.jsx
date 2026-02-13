import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import americanFootballImage from "../../assets/american-football.png";
import { sportsArticles, sportsCategories } from "../../data/sportsArticles";

const STORAGE_KEY = "admin_sports_draft_v1";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneStories(input = []) {
  return input.map((s, i) => ({
    id: s?.id || `sports-${i}-${makeId()}`,
    title: s?.title || "",
    author: s?.author || "",
    category: s?.category || "Sports",
    date: s?.date || "",
    summary: s?.summary || "",
    body: s?.body || "",
    image: s?.image || "",
  }));
}

function defaultStories() {
  return cloneStories(Object.values(sportsArticles || {}));
}

function loadInitialStories() {
  if (typeof window === "undefined") return defaultStories();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStories();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultStories();
    return cloneStories(parsed);
  } catch {
    return defaultStories();
  }
}

export default function AdminSport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [stories, setStories] = useState(() => loadInitialStories());
  const [selectedId, setSelectedId] = useState(() => loadInitialStories()[0]?.id || "");
  const [editorOpen, setEditorOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [articleStart, setArticleStart] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribers, setSubscribers] = useState(0);
  const fileRef = useRef(null);

  const selected = useMemo(
    () => stories.find((s) => String(s.id) === String(selectedId)) || stories[0] || null,
    [stories, selectedId]
  );

  const featured = stories[0] || null;
  const spotlight = stories.slice(1, 3);

  const articleCards = useMemo(
    () =>
      stories.map((story, idx) => ({
        ...story,
        tag: story.category || "Sports",
        author: story.author || "Editor",
        date: story.date || "Date",
        image: story.image || "",
        _idx: idx,
      })),
    [stories]
  );

  const visibleArticleCards = useMemo(() => {
    if (!articleCards.length) return [];
    return Array.from({ length: Math.min(3, articleCards.length) }, (_, index) => {
      return articleCards[(articleStart + index) % articleCards.length];
    });
  }, [articleCards, articleStart]);

  const categoryList = useMemo(() => Object.values(sportsCategories || {}), []);
  const categoriesPerPage = 4;
  const totalCategoryPages = Math.max(1, Math.ceil(categoryList.length / categoriesPerPage));
  const visibleCategories = categoryList.slice(categoryPage * categoriesPerPage, (categoryPage + 1) * categoriesPerPage);

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
    if (categoryPage > totalCategoryPages - 1) setCategoryPage(Math.max(0, totalCategoryPages - 1));
  }, [categoryPage, totalCategoryPages]);

  useEffect(() => {
    if (!articleCards.length) {
      setArticleStart(0);
      return;
    }
    if (articleStart > articleCards.length - 1) setArticleStart(0);
  }, [articleCards.length, articleStart]);

  useEffect(() => {
    let mounted = true;

    async function loadPublished() {
      if (!API) return;
      setLoadingPublished(true);
      try {
        const res = await fetch(`${API}/api/sports`);
        const json = await res.json();
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

  function patchSelected(patch) {
    if (!selected) return;
    setStories((prev) => prev.map((s) => (String(s.id) === String(selected.id) ? { ...s, ...patch } : s)));
  }

  function addStory() {
    const next = {
      id: makeId(),
      title: "",
      author: "",
      category: "Sports",
      date: new Date().toISOString().slice(0, 10),
      summary: "",
      body: "",
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
      setNotice("Sports draft saved locally.");
    } catch {
      setNotice("Could not save draft in this browser.");
    }
  }

  function resetFromDefault() {
    const next = defaultStories();
    setStories(next);
    setSelectedId(next[0]?.id || "");
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
      const res = await fetch(`${API}/api/sports`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stories),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Publish failed");

      const next = Array.isArray(json?.data) ? cloneStories(json.data) : stories;
      setStories(next);
      setSelectedId(next[0]?.id || "");
      setNotice("Published. Sports page data is now updated.");
    } catch (err) {
      setNotice(err?.message || "Publish failed.");
    } finally {
      setPublishing(false);
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

  function handleSubscribe(event) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setSubscribeMessage("Please enter a valid email.");
      return;
    }

    setSubscribers((n) => n + 1);
    setSubscribeMessage("Preview mode only. Subscription API runs on public page.");
    setEmail("");
  }

  const topStory = featured;
  const sideStoryOne = spotlight[0];
  const sideStoryTwo = spotlight[1];

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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Preview (Sports.jsx Layout)</h2>

        <div className="bg-[#d8d8dc] px-4 py-8 mt-4 rounded-xl">
          <div className="mx-auto w-full max-w-5xl rounded-2xl border border-black/15 bg-gradient-to-r from-[#eceef2] via-[#dee2ea] to-[#d6dce7] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Sports Desk</p>
            <h1 className="pt-2 text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl [font-family:Georgia,Times,serif]">
              Sports
            </h1>
            <p className="max-w-3xl pt-3 text-sm text-black/70 md:text-base">
              Match highlights, athlete stories, and the moments that move fans.
            </p>
            <div className="mt-5 rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
              Sports Pulse: fixtures, form, and momentum shifts ahead of the next gameweek.
            </div>
          </div>

          <div className="mx-auto mt-5 grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_220px]">
            <article className="relative overflow-hidden rounded bg-[#dfe0e2] p-6 md:p-8">
              <div className="absolute -left-12 top-10 h-56 w-56 rounded-full border-[18px] border-black/5" />

              <div className="relative z-10">
                <p className="text-5xl font-black uppercase leading-[0.95] text-black/70 md:text-7xl">
                  {topStory?.title || "Top Story"}
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded bg-gradient-to-b from-[#f0f1f4] to-[#d5d8de]">
                {topStory?.image ? (
                  <img
                    src={resolveImageUrl(topStory.image)}
                    alt={topStory.title || "Top scorer"}
                    className="mx-auto h-auto w-auto max-h-[520px] max-w-full object-contain"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-black/45">No image</div>
                )}
              </div>

              <p className="relative z-10 mt-4 max-w-md text-sm text-black/80">{topStory?.summary || "Add summary"}</p>

              {topStory ? (
                <Link
                  to={`/sports/article/${topStory.id}`}
                  className="relative z-10 mt-8 inline-block rounded bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Continue Reading
                </Link>
              ) : null}
            </article>

            <aside className="space-y-4">
              <article className="rounded bg-[#e4e5e7] p-2">
                <span className="inline-block rounded bg-[#d6dbe3] px-2 py-1 text-[10px] text-black/70">Today</span>
                {sideStoryOne ? (
                  <Link to={`/sports/article/${sideStoryOne.id}`}>
                    <div className="mt-2 overflow-hidden rounded bg-gradient-to-b from-[#f0f1f4] to-[#d5d8de]">
                      {sideStoryOne.image ? (
                        <img
                          src={resolveImageUrl(sideStoryOne.image)}
                          alt={sideStoryOne.title || "Sports update"}
                          className="h-40 w-full object-contain object-center p-2 drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-black/45">No image</div>
                      )}
                    </div>
                  </Link>
                ) : null}
                <p className="pt-2 text-xs text-black/80">{sideStoryOne?.title || "Side story"}</p>
              </article>

              <article className="rounded bg-[#e4e5e7] p-2">
                {sideStoryTwo ? (
                  <Link to={`/sports/article/${sideStoryTwo.id}`}>
                    <div className="overflow-hidden rounded bg-gradient-to-b from-[#f0f1f4] to-[#d5d8de]">
                      {sideStoryTwo.image ? (
                        <img
                          src={resolveImageUrl(sideStoryTwo.image)}
                          alt={sideStoryTwo.title || "Sports headline"}
                          className="h-40 w-full object-contain object-center p-2 drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-black/45">No image</div>
                      )}
                    </div>
                  </Link>
                ) : null}
                <p className="pt-2 text-xs text-black/80">{sideStoryTwo?.title || "Side story"}</p>
              </article>
            </aside>
          </div>

          <div className="mx-auto mt-10 w-full max-w-5xl">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-3xl font-semibold text-black/80">Category</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 0))}
                  disabled={categoryPage === 0}
                  className={`rounded border border-black/30 px-3 py-1 text-sm ${
                    categoryPage === 0 ? "cursor-not-allowed text-black/30" : "text-black hover:bg-white/70"
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages - 1))}
                  disabled={categoryPage >= totalCategoryPages - 1}
                  className={`rounded border border-black/30 px-3 py-1 text-sm ${
                    categoryPage >= totalCategoryPages - 1
                      ? "cursor-not-allowed text-black/30"
                      : "text-black hover:bg-white/70"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategories.map((category) => (
                <Link key={category.id} to={`/sports/category/${category.id}`} className="overflow-hidden rounded bg-[#d0d3d8]">
                  <img
                    src={resolveImageUrl(category.image)}
                    alt={category.name}
                    className="h-40 w-full bg-[#cfd2d7] p-1 object-contain"
                  />
                  <p className="px-3 py-3 text-center text-2xl font-extrabold uppercase text-black/55">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 w-full max-w-5xl">
            <h2 className="pb-4 text-4xl font-semibold text-black/80">Sports Article</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visibleArticleCards.map((article) => (
                <article key={`${article.id}-${article._idx}`}>
                  <Link to={`/sports/article/${article.id}`} className="relative block overflow-hidden rounded">
                    {article.image ? (
                      <img src={resolveImageUrl(article.image)} alt={article.title} className="h-64 w-full object-cover" />
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-zinc-300 text-sm text-black/45">No image</div>
                    )}
                    <span className="absolute right-3 top-3 rounded border border-white/70 px-2 py-1 text-[10px] text-white">
                      {article.tag}
                    </span>
                  </Link>

                  <div className="pt-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b9bec5] text-xs font-semibold text-black/70">
                        {(article.author || "ED").slice(0, 2).toUpperCase()}
                      </span>
                      <p className="text-sm text-black/80">{article.author}</p>
                    </div>
                    <p className="pt-3 text-sm text-black/60">{article.date}</p>
                    <Link to={`/sports/article/${article.id}`} className="block pt-3 text-[34px] font-semibold leading-tight text-black/85">
                      {article.title || "Untitled"}
                    </Link>
                    <p className="pt-3 text-lg text-black/65">{article.summary || "Add summary"}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setArticleStart((prev) => (prev - 1 + articleCards.length) % Math.max(articleCards.length, 1))}
                className="rounded bg-[#c0c4ca] px-5 py-3 text-xl text-white"
                aria-label="Back"
                disabled={!articleCards.length}
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => setArticleStart((prev) => (prev + 1) % Math.max(articleCards.length, 1))}
                className="rounded bg-[#2f3135] px-5 py-3 text-xl text-white"
                aria-label="Next"
                disabled={!articleCards.length}
              >
                &rarr;
              </button>
            </div>
          </div>

          <div className="mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded bg-[#d1d4d9]">
            <div className="relative grid gap-4 px-6 py-8 md:grid-cols-[1fr_320px] md:px-10">
              <div className="relative z-10 max-w-xl">
                <h3 className="text-5xl font-extrabold uppercase leading-[0.9] text-black/70">
                  Newsletter
                  <br />
                  Subscription
                </h3>

                <form onSubmit={handleSubscribe} className="mt-6 flex max-w-md overflow-hidden rounded border border-black/35">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full bg-[#d8dbe0] px-4 py-3 text-base text-black/70 placeholder:text-black/35 focus:outline-none"
                  />
                  <button type="submit" className="bg-[#2f3135] px-6 text-2xl text-white transition hover:bg-black" aria-label="Subscribe">
                    {"\u2197"}
                  </button>
                </form>
                <p className="pt-3 text-sm text-black/70">{subscribeMessage || `Subscribers recorded: ${subscribers}`}</p>
              </div>

              <div className="relative hidden md:block">
                <div className="absolute -left-8 top-2 h-48 w-48 rounded-full border-[6px] border-black/5" />
                <div className="absolute -left-2 top-8 h-40 w-40 rounded-full border-[6px] border-black/5" />
                <img src={americanFootballImage} alt="Sports newsletter" className="relative z-10 ml-auto h-56 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
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
                      <Field label="Author" value={selected.author} onChange={(v) => patchSelected({ author: v })} />
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
