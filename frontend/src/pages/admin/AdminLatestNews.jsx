// src/pages/AdminLatestNewsPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
const MotionDiv = motion.div;

const emptyStory = () => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: "",
  summary: "",
  content: "",
  image: "", // backend path e.g. /uploads/latest-news/xxx.jpg
  source: "",
  url: "",
  publishedAt: new Date().toISOString().slice(0, 16),
  status: "draft",
  author: "",
  authorName: "",
  authorRole: "",
  authorBio: "",
});

function normalizeList(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return list.map((s) => ({
    ...emptyStory(),
    id: s?.id || emptyStory().id,
    title: s?.title || "",
    summary: s?.summary || "",
    content: s?.body || s?.content || "",
    image: s?.image || "",
    source: s?.category || "Latest News",
    url: s?.url || "",
    publishedAt: s?.date ? `${s.date}T00:00` : new Date().toISOString().slice(0, 16),
    status: s?.status || "published",
    author: s?.author || s?.authorName || "",
    authorName: s?.authorName || s?.author || "",
    authorRole: s?.authorRole || "",
    authorBio: s?.authorBio || "",
  }));
}

function toBackendPayload(stories) {
  return stories.map((s) => ({
    id: s.id,
    title: s.title || "",
    category: s.source || "Latest News",
    date: (s.publishedAt || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    image: s.image || "",
    author: s.author || s.authorName || "",
    authorName: s.authorName || s.author || "",
    authorRole: s.authorRole || "",
    authorBio: s.authorBio || "",
    summary: s.summary || "",
    body: s.content || "",
  }));
}

export default function AdminLatestNewsPage() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [stories, setStories] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editorOpen, setEditorOpen] = useState(true);

  const fileRef = useRef(null);
  const pageRef = useRef(null);

  const selected = useMemo(
    () => stories.find((s) => s.id === selectedId) || null,
    [stories, selectedId]
  );

  const sorted = useMemo(() => {
    const copy = [...stories];
    copy.sort((a, b) => {
      const ad = new Date(a.publishedAt || 0).getTime();
      const bd = new Date(b.publishedAt || 0).getTime();
      return bd - ad;
    });
    return copy;
  }, [stories]);

  const [featured, sideOne, sideTwo, ...bottomRow] = sorted;

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  function toImageSrc(image) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    return `${API}${image}`;
  }

  function patchSelected(patch) {
    setStories((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s))
    );
  }

  function addStory() {
    const s = emptyStory();
    setStories((prev) => [s, ...prev]);
    setSelectedId(s.id);
    pageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteStoryAndSave(id) {
    if (!id || saving) return;
    const ok = window.confirm("Delete this story permanently?");
    if (!ok) return;

    const next = stories.filter((s) => s.id !== id);
    const nextSelectedId = id === selectedId ? next[0]?.id || "" : selectedId;

    setStories(next);
    setSelectedId(nextSelectedId);
    await saveAll(next);
    setSelectedId(nextSelectedId);
    setNotice("Story deleted.");
    window.setTimeout(() => setNotice(""), 1400);
  }

  function togglePublish(id) {
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "published" ? "draft" : "published",
              publishedAt:
                s.status === "published"
                  ? s.publishedAt
                  : new Date().toISOString().slice(0, 16),
            }
          : s
      )
    );
  }

  async function load() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API}/api/latest-news`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load latest news");
      const list = normalizeList(data);
      setStories(list);
      setSelectedId(list[0]?.id || "");
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll(nextStories = stories) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const payload = toBackendPayload(nextStories);
      const res = await fetch(`${API}/api/latest-news`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save latest news");
      const list = normalizeList(data);
      setStories(list);
      if (!selectedId && list[0]?.id) setSelectedId(list[0].id);
      setNotice("Saved.");
      window.setTimeout(() => setNotice(""), 1400);
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file) {
    if (!selectedId) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/latest-news/upload`, {
        method: "POST",
        headers: { ...authHeaders },
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Image upload failed");

      // backend returns { url: "/uploads/latest-news/xxx.jpg" }
      patchSelected({ image: data.url || "" });
      setNotice("Image uploaded.");
      window.setTimeout(() => setNotice(""), 1400);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MotionSection
      ref={pageRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
          Latest News
        </h1>
        <p className="pt-2 text-sm text-black/65">
          Manage stories, update details, and publish changes to the live feed.
        </p>
        <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addStory}
            className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            New Story
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={() => saveAll()}
            className="rounded border border-black/25 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={load}
            className="rounded border border-black/25 bg-[#dfe2e6] px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {(error || notice) && (
          <div className="mt-4 grid gap-2">
            {error && (
              <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-black">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded border border-black/20 bg-white/70 px-4 py-3 text-sm text-black">
                {notice}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        {loading ? (
          <div className="mt-5 rounded border border-black/15 bg-white/60 px-4 py-8 text-sm text-black/60">
            Loading...
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-5 rounded border border-black/15 bg-white/60 px-4 py-8 text-sm text-black/60">
            No stories yet.
          </div>
        ) : (
          <>
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]"
            >
              {featured ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(featured.id)}
                  className={`group relative overflow-hidden rounded text-left ${
                    selectedId === featured.id ? "ring-2 ring-black" : "ring-1 ring-black/10"
                  }`}
                >
                  {featured.image ? (
                    <img
                      src={toImageSrc(featured.image)}
                      alt={featured.title || "Featured story"}
                      className="h-[280px] w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-[430px]"
                    />
                  ) : (
                    <div className="h-[280px] w-full bg-black/10 md:h-[430px]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute right-3 top-3 rounded border border-white/30 bg-black/35 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
                    {featured.status}
                  </div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <p className="text-4xl leading-tight">{featured.title || "Untitled"}</p>
                    <p className="pt-2 text-sm text-white/80">
                      {(featured.source || "Latest Desk") +
                        " - " +
                        (featured.publishedAt || "").replace("T", " ")}
                    </p>
                  </div>
                </button>
              ) : null}

              <div className="grid gap-5">
                {[sideOne, sideTwo]
                  .filter(Boolean)
                  .map((story) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => setSelectedId(story.id)}
                      className={`group grid grid-cols-[1fr_180px] gap-4 rounded text-left ${
                        selectedId === story.id ? "ring-2 ring-black" : "ring-1 ring-black/10"
                      }`}
                    >
                      <div className="my-auto p-2">
                        <div className="mb-2 inline-block rounded border border-black/20 bg-white/75 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-black/70">
                          {story.status}
                        </div>
                        <p className="text-[32px] leading-tight text-black/85 transition group-hover:text-black">
                          {story.title || "Untitled"}
                        </p>
                        <p className="pt-2 text-sm text-black/60">
                          {(story.source || "Latest Desk") +
                            " - " +
                            (story.publishedAt || "").replace("T", " ")}
                        </p>
                      </div>
                      {story.image ? (
                        <img
                          src={toImageSrc(story.image)}
                          alt={story.title || "Story"}
                          className="h-52 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-52 w-full rounded bg-black/10" />
                      )}
                    </button>
                  ))}
              </div>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid gap-5 md:grid-cols-3"
            >
              {bottomRow.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setSelectedId(story.id)}
                  className={`group rounded text-left ${
                    selectedId === story.id ? "ring-2 ring-black" : "ring-1 ring-black/10"
                  }`}
                >
                  {story.image ? (
                    <img
                      src={toImageSrc(story.image)}
                      alt={story.title || "Story"}
                      className="h-56 w-full rounded object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-56 w-full rounded bg-black/10" />
                  )}
                  <div className="px-1">
                    <div className="mt-3 inline-block rounded border border-black/20 bg-white/75 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-black/70">
                      {story.status}
                    </div>
                    <p className="pt-2 text-[32px] leading-tight text-black/85 transition group-hover:text-black">
                      {story.title || "Untitled"}
                    </p>
                    <p className="pt-2 text-sm text-black/60">
                      {(story.source || "Latest Desk") +
                        " - " +
                        (story.publishedAt || "").replace("T", " ")}
                    </p>
                  </div>
                </button>
              ))}
            </MotionDiv>
          </>
        )}

        <main className="mt-6 rounded border border-black/15 bg-white/60">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
              Editor
            </p>
            <button
              type="button"
              onClick={() => setEditorOpen((v) => !v)}
              className="rounded border border-black/25 bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-black/5"
            >
              {editorOpen ? "Collapse" : "Expand"}
            </button>
          </div>

          {!editorOpen ? (
            <div className="px-4 py-5 text-sm text-black/60">Editor collapsed.</div>
          ) : !selected ? (
            <div className="px-4 py-8 text-sm text-black/60">
              Select a story from the layout above, or create a new one.
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 p-4"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(selected.id)}
                  className="rounded border border-black/20 bg-[#dfe2e6] px-3 py-2 text-xs font-semibold text-black hover:bg-black/5"
                >
                  {selected.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteStoryAndSave(selected.id)}
                  disabled={saving}
                  className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-black hover:bg-red-500/20 disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete Story"}
                </button>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Title
                </label>
                <input
                  value={selected.title}
                  onChange={(e) => patchSelected({ title: e.target.value })}
                  placeholder="Headline"
                  className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Author Name
                </label>
                <input
                  value={selected.authorName || selected.author || ""}
                  onChange={(e) => patchSelected({ author: e.target.value, authorName: e.target.value })}
                  placeholder="Reporter name"
                  className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Author Role
                </label>
                <input
                  value={selected.authorRole || ""}
                  onChange={(e) => patchSelected({ authorRole: e.target.value })}
                  placeholder="Correspondent / Editor"
                  className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Author Credibility Line
                </label>
                <textarea
                  rows={2}
                  value={selected.authorBio || ""}
                  onChange={(e) => patchSelected({ authorBio: e.target.value })}
                  placeholder="One-line credibility profile"
                  className="w-full resize-none rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Summary
                </label>
                <textarea
                  rows={3}
                  value={selected.summary}
                  onChange={(e) => patchSelected({ summary: e.target.value })}
                  placeholder="Short summary"
                  className="w-full resize-none rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Image (Upload)
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="block w-full max-w-xs text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f);
                    }}
                    disabled={uploading}
                  />

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="rounded border border-black/25 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Choose File"}
                  </button>

                  {selected.image ? (
                    <button
                      type="button"
                      onClick={() => patchSelected({ image: "" })}
                      className="rounded border border-black/25 bg-[#dfe2e6] px-3 py-2 text-sm font-semibold text-black hover:bg-black/5"
                    >
                      Remove Image
                    </button>
                  ) : null}
                </div>

                <p className="text-xs text-black/55">{selected.image || "No image"}</p>
              </div>

              {selected.image ? (
                <div className="overflow-hidden rounded border border-black/10 bg-white">
                  <div className="border-b border-black/10 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                      Image Preview
                    </p>
                  </div>
                  <img
                    src={toImageSrc(selected.image)}
                    alt={selected.title || "Preview"}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                  Full Content
                </label>
                <textarea
                  rows={9}
                  value={selected.content}
                  onChange={(e) => patchSelected({ content: e.target.value })}
                  placeholder="Full story content"
                  className="w-full resize-none rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                    Source
                  </label>
                  <input
                    value={selected.source}
                    onChange={(e) => patchSelected({ source: e.target.value })}
                    placeholder="Publisher / Desk"
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                    External Link
                  </label>
                  <input
                    value={selected.url}
                    onChange={(e) => patchSelected({ url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                    Published At
                  </label>
                  <input
                    type="datetime-local"
                    value={selected.publishedAt}
                    onChange={(e) => patchSelected({ publishedAt: e.target.value })}
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                    Status
                  </label>
                  <select
                    value={selected.status}
                    onChange={(e) => patchSelected({ status: e.target.value })}
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveAll()}
                  className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    const next = stories.map((s) =>
                      s.id === selectedId
                        ? {
                            ...s,
                            status: "published",
                            publishedAt: new Date().toISOString().slice(0, 16),
                          }
                        : s
                    );
                    setStories(next);
                    saveAll(next);
                  }}
                  className="rounded border border-black/25 bg-[#dfe2e6] px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
                >
                  Publish & Save
                </button>
              </div>
            </MotionDiv>
          )}
        </main>
      </div>
    </MotionSection>
  );
}
