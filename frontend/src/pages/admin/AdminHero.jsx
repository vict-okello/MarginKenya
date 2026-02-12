import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_HERO = {
  featuredArticleId: "",
  topStories: [
    { title: "WORLD NEWS", blurb: "Economic policies are shaping international markets", to: "/worldnews", imageUrl: "" },
    { title: "TECHNOLOGY", blurb: "The latest trends in AI and innovation", to: "/technology", imageUrl: "" },
    { title: "BUSINESS", blurb: "Markets, startups, and policy that shape the economy", to: "/business", imageUrl: "" },
    { title: "SPORTS", blurb: "Major updates across the sports world", to: "/sports", imageUrl: "" },
  ],
  featured: {
    imageUrl: "",
    category: "World News",
    author: "",
    date: "",
    readTime: "",
    headline: "",
    ctaText: "Read Article ->",
  },
};

const DEFAULT_HERO_ARTICLE = {
  title: "",
  category: "World News",
  author: "",
  date: "",
  readTime: "",
  summary: "",
  body: "",
  imageUrl: "",
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isHttp(url) {
  return /^https?:\/\//i.test(url);
}

export default function AdminHero() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [form, setForm] = useState(() => deepClone(DEFAULT_HERO));
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [openHeroArticle, setOpenHeroArticle] = useState(true);
  const [openFeaturedEditor, setOpenFeaturedEditor] = useState(true);
  const [openTopStories, setOpenTopStories] = useState(true);

  const featuredFileRef = useRef(null);
  const storyFileRefs = useRef([]);
  const articleImageRef = useRef(null);

  const resolveUrl = useMemo(() => {
    return (url) => {
      if (!url) return "";
      if (isHttp(url)) return url;
      if (!API) return url;
      return `${API}${url}`;
    };
  }, [API]);

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const safeParseJson = async (res) => {
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    return { text, data };
  };

  const normalizeHero = (data) => {
    const merged = deepClone(DEFAULT_HERO);

    if (data?.featuredArticleId) merged.featuredArticleId = data.featuredArticleId;

    if (Array.isArray(data?.topStories)) {
      merged.topStories = data.topStories.slice(0, 4).map((s, idx) => ({
        title: s?.title ?? DEFAULT_HERO.topStories[idx]?.title ?? "",
        blurb: s?.blurb ?? "",
        to: s?.to ?? DEFAULT_HERO.topStories[idx]?.to ?? "",
        imageUrl: s?.imageUrl ?? "",
      }));
      while (merged.topStories.length < 4) {
        merged.topStories.push(deepClone(DEFAULT_HERO.topStories[merged.topStories.length]));
      }
    }

    if (data?.featured && typeof data.featured === "object") {
      merged.featured = {
        imageUrl: data.featured.imageUrl ?? "",
        category: data.featured.category ?? DEFAULT_HERO.featured.category,
        author: data.featured.author ?? DEFAULT_HERO.featured.author,
        date: data.featured.date ?? DEFAULT_HERO.featured.date,
        readTime: data.featured.readTime ?? DEFAULT_HERO.featured.readTime,
        headline: data.featured.headline ?? DEFAULT_HERO.featured.headline,
        ctaText: data.featured.ctaText ?? DEFAULT_HERO.featured.ctaText,
      };
    }

    return merged;
  };

  // HERO ARTICLE state (the actual article content shown only on article page)
  const [heroArticle, setHeroArticle] = useState(() => deepClone(DEFAULT_HERO_ARTICLE));

  const loadHeroArticleIfAny = async (articleId) => {
    if (!articleId?.trim()) {
      setHeroArticle(deepClone(DEFAULT_HERO_ARTICLE));
      return;
    }

    try {
      const res = await fetch(`${API}/api/hero-articles/${articleId}`);
      if (!res.ok) {
        setHeroArticle(deepClone(DEFAULT_HERO_ARTICLE));
        return;
      }
      const data = await res.json();
      setHeroArticle({
        title: data?.title ?? "",
        category: data?.category ?? "World News",
        author: data?.author ?? "",
        date: data?.date ?? "",
        readTime: data?.readTime ?? "",
        summary: data?.summary ?? "",
        body: data?.body ?? "",
        imageUrl: data?.imageUrl ?? "",
      });

      // Keep the hero "display" fields in sync (headline/category/author/date/readTime/image)
      setForm((prev) => {
        const next = deepClone(prev);
        next.featured = {
          ...next.featured,
          headline: data?.title ?? next.featured.headline,
          category: data?.category ?? next.featured.category,
          author: data?.author ?? next.featured.author,
          date: data?.date ?? next.featured.date,
          readTime: data?.readTime ?? next.featured.readTime,
          imageUrl: data?.imageUrl ?? next.featured.imageUrl,
        };
        return next;
      });
    } catch {
      setHeroArticle(deepClone(DEFAULT_HERO_ARTICLE));
    }
  };

  const loadHero = async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (!API) throw new Error("VITE_API_URL is not set in the frontend .env");

      const res = await fetch(`${API}/api/hero`, { headers: { ...authHeaders } });

      if (res.status === 404) {
        const defaults = deepClone(DEFAULT_HERO);
        setForm(defaults);
        setNotice("No hero found in backend yet. Using default values.");
        setLoading(false);
        return;
      }

      const { text, data } = await safeParseJson(res);

      if (!res.ok) {
        const hint = text?.includes("<!DOCTYPE") ? "Backend returned HTML. Check backend route and URL." : "";
        throw new Error((data?.message || `Failed to load hero (${res.status}). ${hint}`).trim());
      }

      const merged = normalizeHero(data);
      setForm(merged);
      setNotice("Hero loaded from backend.");

      // If we already have a featuredArticleId, load its content into editor
      await loadHeroArticleIfAny(merged.featuredArticleId);
    } catch (e) {
      setError(e?.message || "Failed to load hero");
      setForm(deepClone(DEFAULT_HERO));
      setHeroArticle(deepClone(DEFAULT_HERO_ARTICLE));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

  const updateTopStory = (index, patch) => {
    setForm((prev) => {
      const next = deepClone(prev);
      next.topStories[index] = { ...next.topStories[index], ...patch };
      return next;
    });
  };

  const updateFeatured = (patch) => {
    setForm((prev) => {
      const next = deepClone(prev);
      next.featured = { ...next.featured, ...patch };
      return next;
    });
  };

  const uploadImage = async (file, section = "hero") => {
    if (!file) return "";
    if (!API) throw new Error("VITE_API_URL is not set in the frontend .env");
    if (!token) throw new Error("Missing admin token. Please login again.");

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/uploads/${section}`, {
        method: "POST",
        headers: { ...authHeaders },
        body: fd,
      });

      const { text, data } = await safeParseJson(res);

      if (!res.ok) {
        const hint = text?.includes("<!DOCTYPE")
          ? "Backend returned HTML. Check that POST /api/uploads exists and is reachable."
          : "";
        throw new Error((data?.message || `Upload failed (${res.status}). ${hint}`).trim());
      }

      if (!data?.url) {
        throw new Error("Upload succeeded but response is missing 'url'. Backend should return { url: '/uploads/...' }.");
      }

      setNotice("Image uploaded successfully.");
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const pickFeatured = () => featuredFileRef.current?.click();
  const pickStory = (i) => storyFileRefs.current[i]?.click();
  const pickArticleImage = () => articleImageRef.current?.click();

  const onFeaturedFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const url = await uploadImage(file, "hero-featured");
      updateFeatured({ imageUrl: url });

      // keep article image in sync too
      setHeroArticle((p) => ({ ...p, imageUrl: url }));
    } catch (err) {
      setError(err?.message || "Featured image upload failed");
    }
  };

  const onStoryFile = (i) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const url = await uploadImage(file, "hero-stories");
      updateTopStory(i, { imageUrl: url });
    } catch (err) {
      setError(err?.message || "Story image upload failed");
    }
  };

  const onArticleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const url = await uploadImage(file, "hero-article");
      setHeroArticle((p) => ({ ...p, imageUrl: url }));

      // keep hero "display" image in sync too
      updateFeatured({ imageUrl: url });
    } catch (err) {
      setError(err?.message || "Article image upload failed");
    }
  };

  const removeFeaturedImage = () => {
    updateFeatured({ imageUrl: "" });
    setHeroArticle((p) => ({ ...p, imageUrl: "" }));
  };

  const removeStoryImage = (i) => updateTopStory(i, { imageUrl: "" });

  const saveHero = async () => {
    setSavingHero(true);
    setError("");
    setNotice("");

    try {
      if (!API) throw new Error("VITE_API_URL is not set in the frontend .env");
      if (!token) throw new Error("Missing admin token. Please login again.");

      if (!form.featuredArticleId?.trim()) throw new Error("Featured article id is required. Create/save the hero article first.");
      if (!form.featured?.headline?.trim()) throw new Error("Featured headline is required.");

      const payload = deepClone(form);

      const res = await fetch(`${API}/api/hero`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      const { text, data } = await safeParseJson(res);

      if (!res.ok) {
        const hint = text?.includes("<!DOCTYPE") ? "Backend returned HTML. Check that PUT /api/hero exists and is reachable." : "";
        throw new Error((data?.message || `Save failed (${res.status}). ${hint}`).trim());
      }

      setNotice("Hero saved to backend.");
    } catch (e) {
      setError(e?.message || "Failed to save hero");
    } finally {
      setSavingHero(false);
    }
  };

  // Create or update the actual hero article in the backend
  const saveHeroArticle = async () => {
    setSavingArticle(true);
    setError("");
    setNotice("");

    try {
      if (!API) throw new Error("VITE_API_URL is not set in the frontend .env");
      if (!token) throw new Error("Missing admin token. Please login again.");

      if (!heroArticle.title?.trim()) throw new Error("Article title is required.");
      if (!heroArticle.body?.trim()) throw new Error("Article body is required.");

      const isUpdate = Boolean(form.featuredArticleId?.trim());
      const url = isUpdate
        ? `${API}/api/hero-articles/${form.featuredArticleId.trim()}`
        : `${API}/api/hero-articles`;

      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        title: heroArticle.title,
        category: heroArticle.category,
        author: heroArticle.author,
        date: heroArticle.date,
        readTime: heroArticle.readTime,
        summary: heroArticle.summary,
        body: heroArticle.body,
        imageUrl: heroArticle.imageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      const { data } = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data?.message || `Failed to save article (${res.status})`);
      }

      const newId = data?._id || data?.id;
      if (!newId && !isUpdate) {
        throw new Error("Article saved, but backend did not return an id.");
      }

      // If created, store id into hero form
      if (!isUpdate) {
        setForm((prev) => ({ ...prev, featuredArticleId: newId }));
        setNotice("Hero article created. Now click Save to store hero settings.");
      } else {
        setNotice("Hero article updated. Click Save if you also changed hero layout fields.");
      }

      // Sync display fields from article (so hero doesn't show full body)
      setForm((prev) => {
        const next = deepClone(prev);
        next.featured = {
          ...next.featured,
          headline: heroArticle.title.slice(0, 140),
          category: heroArticle.category,
          author: heroArticle.author,
          date: heroArticle.date,
          readTime: heroArticle.readTime,
          imageUrl: heroArticle.imageUrl,
        };
        return next;
      });
    } catch (e) {
      setError(e?.message || "Failed to save hero article");
    } finally {
      setSavingArticle(false);
    }
  };

  const resetToDefaults = () => {
    setForm(deepClone(DEFAULT_HERO));
    setHeroArticle(deepClone(DEFAULT_HERO_ARTICLE));
    setNotice("Reset to defaults (not saved yet).");
    setError("");
  };

  const featuredArticlePath = useMemo(() => {
    const id = (form.featuredArticleId || "").trim();
    if (!id) return "";
    return `/hero/article/${id}`;
  }, [form.featuredArticleId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-6 text-zinc-900">
        <h1 className="text-3xl font-black uppercase tracking-[0.04em]">Hero Edits</h1>
        <p className="mt-2 text-sm text-zinc-600">Loading hero content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Hero Edits</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Edit the hero layout, upload images, and create the featured hero article.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadHero}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            Reload
          </button>

          <button
            onClick={resetToDefaults}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            Reset
          </button>

          <button
            onClick={saveHeroArticle}
            disabled={savingArticle || uploading || savingHero}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
          >
            {savingArticle ? "Saving Article..." : "Save Article"}
          </button>

          <button
            onClick={saveHero}
            disabled={savingHero || uploading || savingArticle}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {savingHero ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-zinc-300 bg-white/70 p-4 text-sm text-zinc-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* PREVIEW (TOP) */}
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">Preview</h2>
          {featuredArticlePath ? (
            <Link
              to={featuredArticlePath}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 hover:bg-zinc-100"
            >
              Open
            </Link>
          ) : null}
        </div>

        <Link to={featuredArticlePath || "#"} className={featuredArticlePath ? "block" : "block pointer-events-none"}>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100">
            <div className="h-40 w-full bg-zinc-200">
              {form.featured.imageUrl ? (
                <img src={resolveUrl(form.featured.imageUrl)} alt="Featured preview" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-xs text-zinc-500">No image set</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-zinc-300 px-2 py-1 text-[10px] uppercase text-zinc-700">
                  {form.featured.category || "Category"}
                </span>
                <span className="rounded border border-zinc-300 px-2 py-1 text-[10px] uppercase text-zinc-700">
                  {form.featured.author || "Author"}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                {(form.featured.date || "Date")} | {(form.featured.readTime || "Read time")}
              </p>
              <p className="mt-3 text-sm font-semibold text-zinc-900">{form.featured.headline || "Headline"}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* HERO ARTICLE EDITOR (content that should NOT show in Hero section) */}
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Hero Article</h2>
            <p className="mt-1 text-xs text-zinc-600">
              This content shows only on the article page, not inside the Hero section.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenHeroArticle((v) => !v)}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              {openHeroArticle ? "Collapse" : "Expand"}
            </button>
            {featuredArticlePath ? (
              <Link
                to={featuredArticlePath}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
              >
                View Article
              </Link>
            ) : (
              <span className="text-xs text-zinc-500">Save Article to generate an ID</span>
            )}
          </div>
        </div>
        {openHeroArticle ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Title"
            value={heroArticle.title}
            onChange={(v) => setHeroArticle((p) => ({ ...p, title: v }))}
            placeholder="Article title"
          />
          <Field
            label="Category"
            value={heroArticle.category}
            onChange={(v) => setHeroArticle((p) => ({ ...p, category: v }))}
            placeholder="World News"
          />
          <Field
            label="Author"
            value={heroArticle.author}
            onChange={(v) => setHeroArticle((p) => ({ ...p, author: v }))}
            placeholder="Author name"
          />
          <Field
            label="Date"
            value={heroArticle.date}
            onChange={(v) => setHeroArticle((p) => ({ ...p, date: v }))}
            placeholder="Feb 9, 2026"
          />
          <Field
            label="Read Time"
            value={heroArticle.readTime}
            onChange={(v) => setHeroArticle((p) => ({ ...p, readTime: v }))}
            placeholder="10 min read"
          />

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Article Image</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div
                onClick={pickArticleImage}
                role="button"
                tabIndex={0}
                className="group flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-400 bg-white text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <div className="text-center">
                  <div className="font-semibold">{uploading ? "Uploading..." : "Click to upload"}</div>
                  <div className="text-xs text-zinc-500">PNG / JPG / WEBP</div>
                </div>
              </div>

              {heroArticle.imageUrl ? (
                <button
                  onClick={() => setHeroArticle((p) => ({ ...p, imageUrl: "" }))}
                  disabled={uploading}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                >
                  Remove
                </button>
              ) : null}

              <input
                ref={articleImageRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onArticleImage}
              />
            </div>

            <div className="mt-2">
              <input
                value={heroArticle.imageUrl}
                onChange={(e) => setHeroArticle((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                placeholder="/uploads/your-image.png or https://..."
              />
            </div>
          </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Summary</label>
              <textarea
                value={heroArticle.summary}
                onChange={(e) => setHeroArticle((p) => ({ ...p, summary: e.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                placeholder="Short summary shown near the top of the article page"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Body</label>
              <textarea
                value={heroArticle.body}
                onChange={(e) => setHeroArticle((p) => ({ ...p, body: e.target.value }))}
                rows={10}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                placeholder="Full article body (this should only appear on the article page)"
              />
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">Hero Article editor collapsed.</p>
        )}
      </div>

      {/* FEATURED (hero display fields only) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Hero Featured Display</h2>
            <button
              type="button"
              onClick={() => setOpenFeaturedEditor((v) => !v)}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              {openFeaturedEditor ? "Collapse" : "Expand"}
            </button>
          </div>

          {openFeaturedEditor ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Featured Article ID"
              value={form.featuredArticleId}
              onChange={(v) => setForm((p) => ({ ...p, featuredArticleId: v }))}
              placeholder="Generated after saving article"
            />
            <Field
              label="CTA Text"
              value={form.featured.ctaText}
              onChange={(v) => updateFeatured({ ctaText: v })}
              placeholder="Read Article ->"
            />
            <Field
              label="Category"
              value={form.featured.category}
              onChange={(v) => updateFeatured({ category: v })}
              placeholder="World News"
            />
            <Field
              label="Author"
              value={form.featured.author}
              onChange={(v) => updateFeatured({ author: v })}
              placeholder="Author"
            />
            <Field
              label="Date (display)"
              value={form.featured.date}
              onChange={(v) => updateFeatured({ date: v })}
              placeholder="Date"
            />
            <Field
              label="Read time (display)"
              value={form.featured.readTime}
              onChange={(v) => updateFeatured({ readTime: v })}
              placeholder="10 min read"
            />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Headline (Hero only)</label>
                <textarea
                  value={form.featured.headline}
                  onChange={(e) => updateFeatured({ headline: e.target.value.slice(0, 140) })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                  placeholder="Short headline (max 140 chars)"
                />
                <p className="mt-1 text-xs text-zinc-500">{(form.featured.headline || "").length}/140</p>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Featured Image (Hero)</label>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div
                    onClick={pickFeatured}
                    role="button"
                    tabIndex={0}
                    className="group flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-400 bg-white text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{uploading ? "Uploading..." : "Click to upload"}</div>
                      <div className="text-xs text-zinc-500">PNG / JPG / WEBP</div>
                    </div>
                  </div>

                  {form.featured.imageUrl ? (
                    <button
                      onClick={removeFeaturedImage}
                      disabled={uploading}
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}

                  <input
                    ref={featuredFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={onFeaturedFile}
                  />
                </div>

                <div className="mt-2">
                  <input
                    value={form.featured.imageUrl}
                    onChange={(e) => updateFeatured({ imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                    placeholder="/uploads/your-image.png or https://..."
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">Hero Featured editor collapsed.</p>
          )}
        </div>

        <div className="hidden rounded-2xl border border-zinc-300 bg-white/70 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Preview</h2>
            {featuredArticlePath ? (
              <Link
                to={featuredArticlePath}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 hover:bg-zinc-100"
              >
                Open
              </Link>
            ) : null}
          </div>

          <Link to={featuredArticlePath || "#"} className={featuredArticlePath ? "block" : "block pointer-events-none"}>
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100">
              <div className="h-40 w-full bg-zinc-200">
                {form.featured.imageUrl ? (
                  <img src={resolveUrl(form.featured.imageUrl)} alt="Featured preview" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-xs text-zinc-500">No image set</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded border border-zinc-300 px-2 py-1 text-[10px] uppercase text-zinc-700">
                    {form.featured.category || "Category"}
                  </span>
                  <span className="rounded border border-zinc-300 px-2 py-1 text-[10px] uppercase text-zinc-700">
                    {form.featured.author || "Author"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600">
                  {(form.featured.date || "Date")} | {(form.featured.readTime || "Read time")}
                </p>
                <p className="mt-3 text-sm font-semibold text-zinc-900">{form.featured.headline || "Headline"}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* TOP STORIES */}
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">Top Stories</h2>
          <button
            type="button"
            onClick={() => setOpenTopStories((v) => !v)}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            {openTopStories ? "Collapse" : "Expand"}
          </button>
        </div>
        {openTopStories ? (
          <>
            <p className="mt-1 text-xs text-zinc-600">Exactly 4 items, matching your Hero.jsx layout.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {form.topStories.map((story, i) => (
            <div key={i} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-800">Story {i + 1}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-zinc-600">Route:</span>
                    {story.to ? (
                      <Link to={story.to} className="text-[11px] font-semibold text-zinc-900 underline underline-offset-4">
                        Open route
                      </Link>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Add a route</span>
                    )}
                  </div>
                </div>

                {story.imageUrl ? (
                  <button
                    onClick={() => removeStoryImage(i)}
                    disabled={uploading}
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-3">
                <div
                  onClick={() => pickStory(i)}
                  role="button"
                  tabIndex={0}
                  className="group relative overflow-hidden rounded-xl border border-dashed border-zinc-400 bg-white"
                >
                  <div className="h-32 w-full bg-zinc-200">
                    {story.imageUrl ? (
                      <img src={resolveUrl(story.imageUrl)} alt={`${story.title} preview`} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-sm text-zinc-600">
                        {uploading ? "Uploading..." : "Click to upload image"}
                      </div>
                    )}
                  </div>
                </div>

                <input
                  ref={(el) => (storyFileRefs.current[i] = el)}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onStoryFile(i)}
                />

                <div className="mt-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Image URL</label>
                  <input
                    value={story.imageUrl}
                    onChange={(e) => updateTopStory(i, { imageUrl: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                    placeholder="/uploads/story.png or https://..."
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Title" value={story.title} onChange={(v) => updateTopStory(i, { title: v })} placeholder="WORLD NEWS" />
                <Field label="Route (to)" value={story.to} onChange={(v) => updateTopStory(i, { to: v })} placeholder="/worldnews" />
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">Blurb</label>
                <textarea
                  value={story.blurb}
                  onChange={(e) => updateTopStory(i, { blurb: e.target.value })}
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">Top Stories editor collapsed.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
        placeholder={placeholder}
      />
    </div>
  );
}

