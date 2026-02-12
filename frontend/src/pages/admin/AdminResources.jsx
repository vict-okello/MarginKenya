// src/pages/AdminResources.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
const MotionDiv = motion.div;

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyResource = () => ({
  id: makeId(),
  title: "",
  summary: "",
  content: "",
  image: "", // saved path from backend upload: /uploads/resources/xxx.jpg
  category: "Guide", // Guide | Research | Toolkit | Deep Dive
  source: "",
  url: "",
  publishedAt: new Date().toISOString().slice(0, 16),
  status: "draft", // draft | published
});

function normalize(payload) {
  const list = Array.isArray(payload?.resources) ? payload.resources : [];
  return list.map((r) => ({
    ...emptyResource(),
    ...r,
    publishedAt: r?.publishedAt || new Date().toISOString().slice(0, 16),
    status: r?.status === "published" ? "published" : "draft",
    category: r?.category || "Guide",
    image: r?.image || "",
    source: r?.source || "",
    url: r?.url || "",
    title: r?.title || "",
    summary: r?.summary || "",
    content: r?.content || "",
  }));
}

export default function AdminResources() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editorOpen, setEditorOpen] = useState(true);

  const fileRef = useRef(null);

  const selected = useMemo(
    () => resources.find((r) => r.id === selectedId) || null,
    [resources, selectedId]
  );

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const sorted = useMemo(() => {
    const copy = [...resources];
    copy.sort((a, b) => {
      const ad = new Date(a.publishedAt || 0).getTime();
      const bd = new Date(b.publishedAt || 0).getTime();
      return bd - ad;
    });
    return copy;
  }, [resources]);

  function patchSelected(patch) {
    setResources((prev) => prev.map((r) => (r.id === selectedId ? { ...r, ...patch } : r)));
  }

  function addResource() {
    const r = emptyResource();
    setResources((prev) => [r, ...prev]);
    setSelectedId(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeResource(id) {
    setResources((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id || "");
      return next;
    });
  }

  function togglePublish(id) {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === "published" ? "draft" : "published",
              publishedAt:
                r.status === "published"
                  ? r.publishedAt
                  : new Date().toISOString().slice(0, 16),
            }
          : r
      )
    );
  }

  async function load() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API}/api/resources-admin`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load resources");
      const list = normalize(data);
      setResources(list);
      setSelectedId(list[0]?.id || "");
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll(nextResources = resources) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const res = await fetch(`${API}/api/resources-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({ resources: nextResources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save resources");
      const list = normalize(data);
      setResources(list);
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

      const res = await fetch(`${API}/api/resources-admin/upload`, {
        method: "POST",
        headers: { ...authHeaders },
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      patchSelected({ image: data.imageUrl || data.url || "" });
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.36 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      {/* MATCHES ResourcesPage HEADER EXACTLY */}
      <div className="mx-auto w-full max-w-5xl pb-6">
        <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
          Articles & Resources
        </h1>
        <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
        <p className="pt-3 text-sm text-black/65">Guides, research, and deep dives to keep you informed.</p>
        <div className="mt-4 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70">
          Resource Pulse: expert guides, practical toolkits, and research-backed insights in one feed.
        </div>
        <p className="pt-3 text-sm text-black/65">Create, edit, and publish resources for the live website.</p>

        {/* Admin actions under same header container */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addResource}
            className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            New Resource
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

      {/* STACKED LAYOUT: Queue first, Editor below */}
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-6">
          {/* Resource Queue */}
          <aside className="rounded border border-black/15 bg-white/60">
            <div className="border-b border-black/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                Resource Queue
              </p>
              <p className="mt-1 text-xs text-black/55">
                Select a resource to edit.
              </p>
            </div>

            <div className="max-h-[420px] overflow-auto">
              {loading ? (
                <div className="px-4 py-6 text-sm text-black/60">Loading…</div>
              ) : sorted.length === 0 ? (
                <div className="px-4 py-6 text-sm text-black/60">
                  No resources yet.
                </div>
              ) : (
                <ul className="divide-y divide-black/10">
                  {sorted.map((r) => {
                    const active = r.id === selectedId;
                    return (
                      <li key={r.id} className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(r.id)}
                          className={`w-full rounded px-3 py-3 text-left transition ${
                            active
                              ? "bg-black text-white"
                              : "bg-white/60 text-black hover:bg-black/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{r.title || "Untitled"}</p>
                              <p className="mt-1 line-clamp-2 text-xs opacity-80">
                                {r.summary || "No summary yet."}
                              </p>
                              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] opacity-70">
                                {r.category} • {r.status === "published" ? "Published" : "Draft"} •{" "}
                                {r.publishedAt ? r.publishedAt.replace("T", " ") : ""}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                                r.status === "published"
                                  ? "border-white/40 bg-white/10 text-white"
                                  : "border-black/15 bg-black/5 text-black/70"
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                        </button>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => togglePublish(r.id)}
                            className="rounded border border-black/20 bg-[#dfe2e6] px-2 py-1 text-xs font-semibold text-black hover:bg-black/5"
                          >
                            {r.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeResource(r.id)}
                            className="rounded border border-black/20 bg-white px-2 py-1 text-xs font-semibold text-black hover:bg-black/5"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Editor BELOW */}
          <main className="rounded border border-black/15 bg-white/60">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Editor</p>
              <button
                type="button"
                onClick={() => setEditorOpen((v) => !v)}
                className="rounded border border-black/25 bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-black/5"
              >
                {editorOpen ? "Collapse" : "Expand"}
              </button>
            </div>

            {!editorOpen ? (
              <div className="px-4 py-5 text-sm text-black/60">Editor collapsed. Expand to continue editing.</div>
            ) : !selected ? (
              <div className="px-4 py-8 text-sm text-black/60">Select or create a resource to edit.</div>
            ) : (
              <MotionDiv
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 p-4"
              >
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Title</label>
                  <input
                    value={selected.title}
                    onChange={(e) => patchSelected({ title: e.target.value })}
                    placeholder="Resource title"
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Summary</label>
                  <textarea
                    rows={3}
                    value={selected.summary}
                    onChange={(e) => patchSelected({ summary: e.target.value })}
                    placeholder="Short summary"
                    className="w-full resize-none rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>

                {/* Image upload */}
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

                  <p className="text-xs text-black/55">
                    <span className="font-semibold">{selected.image || "No image selected"}</span>
                  </p>
                </div>

                {selected.image ? (
                  <div className="overflow-hidden rounded border border-black/10 bg-white">
                    <div className="border-b border-black/10 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Image Preview</p>
                    </div>
                    <img
                      src={`${API}${selected.image}`}
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
                    placeholder="Full resource content"
                    className="w-full resize-none rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Category</label>
                    <select
                      value={selected.category}
                      onChange={(e) => patchSelected({ category: e.target.value })}
                      className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                    >
                      <option value="Guide">Guide</option>
                      <option value="Research">Research</option>
                      <option value="Toolkit">Toolkit</option>
                      <option value="Deep Dive">Deep Dive</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Source</label>
                    <input
                      value={selected.source}
                      onChange={(e) => patchSelected({ source: e.target.value })}
                      placeholder="Publisher / Author"
                      className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => patchSelected({ status: e.target.value })}
                    className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
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
                      const next = resources.map((r) =>
                        r.id === selectedId
                          ? { ...r, status: "published", publishedAt: new Date().toISOString().slice(0, 16) }
                          : r
                      );
                      setResources(next);
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
      </div>
    </MotionSection>
  );
}


