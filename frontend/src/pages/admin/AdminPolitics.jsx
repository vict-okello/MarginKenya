import { useEffect, useMemo, useRef, useState } from "react";

const emptyDesk = { local: [], international: [] };

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeNewStory() {
  return {
    id: makeId(),
    title: "",
    summary: "",
    tag: "Politics",
    date: new Date().toISOString().slice(0, 10),
    image: "",
    content: "",
    author: "",
    authorName: "",
    authorRole: "",
    authorBio: "",
  };
}

function normalizeDesk(payload) {
  return {
    local: Array.isArray(payload?.local) ? payload.local : [],
    international: Array.isArray(payload?.international) ? payload.international : [],
  };
}

function resolveImageUrl(api, url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/?uploads\//i.test(url)) {
    const base = (api || "").replace(/\/+$/, "").replace(/\/api$/i, "");
    const normalized = url.startsWith("/") ? url : `/${url}`;
    return base ? `${base}${normalized}` : normalized;
  }
  return url;
}

export default function AdminPolitics() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [desk, setDesk] = useState("local");
  const [politicsDesk, setPoliticsDesk] = useState(emptyDesk);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  const fileRef = useRef(null);

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const activeStories = useMemo(() => politicsDesk[desk] || [], [politicsDesk, desk]);
  const selected = useMemo(() => {
    if (!selectedId) return activeStories[0] || null;
    return activeStories.find((s) => String(s.id) === String(selectedId)) || activeStories[0] || null;
  }, [activeStories, selectedId]);

  const leadStory = activeStories[0] || null;
  const sideStories = activeStories.slice(1, 3);
  const restStories = activeStories.slice(3, 9);

  async function load() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`${API}/api/politics`, {
        credentials: "include",
        headers: { ...authHeaders },
      });
      if (!res.ok) throw new Error("Failed to load politics");

      const data = await res.json();
      const next = normalizeDesk(data);
      setPoliticsDesk(next);
      const first = (next[desk] || [])[0];
      setSelectedId(first?.id ? String(first.id) : "");
    } catch (e) {
      setError(e?.message || "Failed to load politics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

  useEffect(() => {
    if (!activeStories.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !activeStories.some((s) => String(s.id) === String(selectedId))) {
      setSelectedId(String(activeStories[0].id));
    }
  }, [activeStories, selectedId]);

  function patchSelected(patch) {
    if (!selected) return;
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      next[desk] = (next[desk] || []).map((s) =>
        String(s.id) === String(selected.id) ? { ...s, ...patch } : s
      );
      return next;
    });
  }

  function addStory() {
    const story = makeNewStory();
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      next[desk] = [story, ...(next[desk] || [])];
      return next;
    });
    setSelectedId(String(story.id));
    setPanelOpen(true);
    setNotice("New story added.");
  }

  function deleteSelected() {
    if (!selected) return;
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      const list = (next[desk] || []).filter((s) => String(s.id) !== String(selected.id));
      next[desk] = list;
      setSelectedId(list[0]?.id ? String(list[0].id) : "");
      return next;
    });
    setNotice("Story removed.");
  }

  function moveSelected(direction) {
    if (!selected) return;
    setPoliticsDesk((prev) => {
      const list = [...(prev[desk] || [])];
      const idx = list.findIndex((s) => String(s.id) === String(selected.id));
      if (idx < 0) return prev;

      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= list.length) return prev;

      const tmp = list[idx];
      list[idx] = list[swap];
      list[swap] = tmp;

      return { ...prev, [desk]: list };
    });
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!token) throw new Error("Missing admin token. Please login again.");

      const res = await fetch(`${API}/api/politics`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(politicsDesk),
      });

      if (!res.ok) throw new Error("Failed to save politics");
      const json = await res.json().catch(() => null);
      const next = normalizeDesk(json?.data || politicsDesk);
      setPoliticsDesk(next);
      setNotice("Published. Politics page is now updated.");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file) {
    if (!selected) return;

    setUploading(true);
    setError("");
    setNotice("");

    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/politics/upload`, {
        method: "POST",
        credentials: "include",
        headers: { ...authHeaders },
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      if (!json?.url) throw new Error("Upload returned no url");

      patchSelected({ image: json.url });
      setNotice("Image uploaded.");
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="space-y-4 text-zinc-900">
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Politics Edits</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage local and international politics stories with the same live page structure.
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
              disabled={saving || loading}
              onClick={saveAll}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={load}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-xl border border-zinc-300 bg-white p-1">
          <button
            type="button"
            onClick={() => setDesk("local")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              desk === "local" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            Local ({politicsDesk.local.length})
          </button>
          <button
            type="button"
            onClick={() => setDesk("international")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              desk === "international" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            International ({politicsDesk.international.length})
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div className="grid gap-2">
          {error ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-zinc-900">{error}</div>
          ) : null}
          {notice ? (
            <div className="rounded-2xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm text-zinc-700">{notice}</div>
          ) : null}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5 text-sm text-zinc-700">Loading politics...</div>
      ) : (
        <>
          <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Preview - {desk}</h2>

            {leadStory ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
                <article className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                  <div className="overflow-hidden rounded-xl bg-zinc-200">
                    {leadStory.image ? (
                      <img
                        src={resolveImageUrl(API, leadStory.image)}
                        alt={leadStory.title || "Lead story"}
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">No image</div>
                    )}
                  </div>
                  <p className="pt-3 text-xs uppercase tracking-[0.12em] text-zinc-600">
                    {leadStory.tag || "Politics"} - {leadStory.date || "Date"}
                  </p>
                  <h3 className="pt-2 text-3xl font-semibold leading-tight text-zinc-900">
                    {leadStory.title || "Set the lead headline"}
                  </h3>
                  <p className="pt-2 text-sm text-zinc-700">{leadStory.summary || "Add a summary"}</p>
                </article>

                <div className="grid gap-4">
                  {sideStories.map((story) => (
                    <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                        <div className="overflow-hidden rounded-xl bg-zinc-200">
                          {story.image ? (
                            <img
                              src={resolveImageUrl(API, story.image)}
                              alt={story.title || "Politics story"}
                              className="h-28 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-28 items-center justify-center text-xs text-zinc-500">No image</div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                            {story.tag || "Politics"} - {story.date || "Date"}
                          </p>
                          <h3 className="pt-1 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                          <p className="pt-2 text-sm text-zinc-700">{story.summary || "Add summary"}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-600">
                No stories in this desk. Click <span className="font-semibold">New Story</span> to add one.
              </div>
            )}

            {restStories.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {restStories.map((story) => (
                  <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                    <div className="overflow-hidden rounded-xl bg-zinc-200">
                      {story.image ? (
                        <img
                          src={resolveImageUrl(API, story.image)}
                          alt={story.title || "Politics story"}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center text-sm text-zinc-500">No image</div>
                      )}
                    </div>
                    <p className="pt-3 text-xs text-zinc-500">{story.date || "Date"}</p>
                    <h3 className="pt-2 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                    <p className="pt-2 text-xs text-zinc-600">{story.tag || "Politics"}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-300 bg-white/70">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3"
            >
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Story Editor - {desk}</p>
                <p className="mt-1 text-xs text-zinc-600">Edit title, summary, tag, image and full content.</p>
              </div>
              <span className="rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800">
                {panelOpen ? "Collapse" : "Expand"}
              </span>
            </button>

            {panelOpen ? (
              <div className="border-t border-zinc-200 p-4">
                <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                  <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Stories</p>
                    <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                      {activeStories.map((story, idx) => (
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
                          <Field label="Tag" value={selected.tag} onChange={(v) => patchSelected({ tag: v })} />
                          <Field label="Date" value={selected.date} onChange={(v) => patchSelected({ date: v })} />
                          <Field label="Image URL" value={selected.image} onChange={(v) => patchSelected({ image: v })} />
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Image Upload</p>
                          <p className="mt-1 text-xs text-zinc-600">Upload JPG, PNG, or WEBP.</p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                            >
                              {uploading ? "Uploading..." : "Upload Image"}
                            </button>

                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadImage(file);
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Author Credibility Line</label>
                          <textarea
                            value={selected.authorBio || ""}
                            onChange={(e) => patchSelected({ authorBio: e.target.value })}
                            rows={2}
                            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Summary</label>
                          <textarea
                            value={selected.summary || ""}
                            onChange={(e) => patchSelected({ summary: e.target.value })}
                            rows={4}
                            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Content</label>
                          <textarea
                            value={selected.content || ""}
                            onChange={(e) => patchSelected({ content: e.target.value })}
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
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
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
