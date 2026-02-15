import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { businessArticles } from "../../data/businessArticles";

const STORAGE_KEY = "admin_business_draft_v1";
const SCOPES = ["Local", "International"];

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneStories(input = []) {
  return input.map((s, i) => ({
    id: s?.id || `business-${i}-${makeId()}`,
    scope: s?.scope || "Local",
    tag: s?.tag || "Business",
    title: s?.title || "",
    author: s?.author || s?.authorName || "",
    authorName: s?.authorName || s?.author || "",
    authorRole: s?.authorRole || "",
    authorBio: s?.authorBio || "",
    summary: s?.summary || "",
    body: s?.body || "",
    date: s?.date || "",
    image: s?.image || "",
  }));
}

function loadInitialStories() {
  if (typeof window === "undefined") return cloneStories(businessArticles);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneStories(businessArticles);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneStories(businessArticles);
    return cloneStories(parsed);
  } catch {
    return cloneStories(businessArticles);
  }
}

export default function AdminBusiness() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [stories, setStories] = useState(() => loadInitialStories());
  const [activeScope, setActiveScope] = useState("Local");
  const [selectedId, setSelectedId] = useState(() => loadInitialStories()[0]?.id || "");
  const [editorOpen, setEditorOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const fileRef = useRef(null);

  const scopedStories = useMemo(
    () => stories.filter((s) => String(s.scope || "Local") === activeScope),
    [stories, activeScope]
  );

  const selected = useMemo(
    () => scopedStories.find((s) => String(s.id) === String(selectedId)) || scopedStories[0] || null,
    [scopedStories, selectedId]
  );

  const lead = scopedStories[0] || null;
  const side = scopedStories.slice(1, 3);
  const rest = scopedStories.slice(3, 9);

  useEffect(() => {
    if (!scopedStories.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !scopedStories.some((s) => String(s.id) === String(selectedId))) {
      setSelectedId(scopedStories[0].id);
    }
  }, [scopedStories, selectedId]);

  useEffect(() => {
    let mounted = true;

    async function loadPublished() {
      if (!API) return;
      setLoadingPublished(true);
      try {
        const res = await fetch(`${API}/api/business`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) {
          const next = cloneStories(json);
          setStories(next);
          setSelectedId(next[0]?.id || "");
          setNotice("Loaded published business stories.");
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

  function patchSelected(patch) {
    if (!selected) return;
    setStories((prev) => prev.map((s) => (String(s.id) === String(selected.id) ? { ...s, ...patch } : s)));
  }

  function setScopeStories(transform) {
    setStories((prev) => {
      const scoped = prev.filter((s) => String(s.scope || "Local") === activeScope);
      const others = prev.filter((s) => String(s.scope || "Local") !== activeScope);
      const nextScoped = transform(scoped);
      return [...nextScoped, ...others];
    });
  }

  function addStory() {
    const next = {
      id: makeId(),
      scope: activeScope,
      tag: "Business",
      title: "",
      author: "",
      authorName: "",
      authorRole: "",
      authorBio: "",
      summary: "",
      body: "",
      date: new Date().toISOString().slice(0, 10),
      image: "",
    };
    setScopeStories((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setEditorOpen(true);
    setNotice("New story added.");
  }

  function deleteSelected() {
    if (!selected) return;
    setScopeStories((prev) => {
      const next = prev.filter((s) => String(s.id) !== String(selected.id));
      setSelectedId(next[0]?.id || "");
      return next;
    });
    setNotice("Story removed.");
  }

  function moveSelected(direction) {
    if (!selected) return;
    setScopeStories((prev) => {
      const next = [...prev];
      const index = next.findIndex((s) => String(s.id) === String(selected.id));
      if (index < 0) return prev;

      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= next.length) return prev;

      const temp = next[index];
      next[index] = next[swap];
      next[swap] = temp;
      return next;
    });
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      setNotice("Business draft saved locally.");
    } catch {
      setNotice("Could not save draft in this browser.");
    }
  }

  function resetFromDefault() {
    const next = cloneStories(businessArticles);
    setStories(next);
    setSelectedId(next[0]?.id || "");
    setNotice("Reset to default business content.");
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

      const res = await fetch(`${API}/api/uploads/business`, {
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
      const res = await fetch(`${API}/api/business`, {
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
      setNotice("Published. Business page is now updated.");
    } catch (err) {
      setNotice(err?.message || "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className="space-y-4 text-zinc-900">
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Business Edits</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Edit, reorder, preview, and publish business stories.
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

        <div className="mt-4 inline-flex rounded-xl border border-zinc-300 bg-white p-1">
          {SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setActiveScope(scope)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                activeScope === scope ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {scope} ({stories.filter((s) => String(s.scope || "Local") === scope).length})
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm text-zinc-700">{notice}</div>
      ) : null}

      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Preview - {activeScope}</h2>

        {lead ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <article className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
              <div className="overflow-hidden rounded-xl bg-zinc-200">
                {lead.image ? (
                  <img src={resolveImageUrl(lead.image)} alt={lead.title || "Lead business story"} className="h-64 w-full object-cover" />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-zinc-500">No image</div>
                )}
              </div>
              <p className="pt-3 text-xs uppercase tracking-[0.12em] text-zinc-600">
                {lead.scope || "Scope"} - {lead.tag || "Tag"} - {lead.date || "Date"}
              </p>
              <h3 className="pt-2 text-3xl font-semibold leading-tight text-zinc-900">{lead.title || "Untitled lead"}</h3>
              <p className="pt-2 text-sm text-zinc-700">{lead.summary || "Add summary"}</p>
            </article>

            <div className="grid gap-4">
              {side.map((story) => (
                <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    <div className="overflow-hidden rounded-xl bg-zinc-200">
                      {story.image ? (
                        <img src={resolveImageUrl(story.image)} alt={story.title || "Business story"} className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs text-zinc-500">No image</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                        {story.scope || "Scope"} - {story.tag || "Tag"} - {story.date || "Date"}
                      </p>
                      <h3 className="pt-1 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((story) => (
              <article key={story.id} className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
                <div className="overflow-hidden rounded-xl bg-zinc-200">
                  {story.image ? (
                    <img src={resolveImageUrl(story.image)} alt={story.title || "Business story"} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <p className="pt-3 text-xs text-zinc-500">{story.date || "Date"}</p>
                <h3 className="pt-2 text-xl leading-tight text-zinc-900">{story.title || "Untitled"}</h3>
                <p className="pt-2 text-xs text-zinc-600">{story.scope || "Scope"} - {story.tag || "Tag"}</p>
              </article>
            ))}
          </div>
        ) : null}
        {!lead ? (
          <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-600">
            No stories in {activeScope}. Click <span className="font-semibold">New Story</span> to add one.
          </div>
        ) : null}
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
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Stories - {activeScope}</p>
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {scopedStories.map((story, idx) => (
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
                      <Field label="Scope" value={selected.scope} onChange={(v) => patchSelected({ scope: v })} />
                      <Field label="Tag" value={selected.tag} onChange={(v) => patchSelected({ tag: v })} />
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
                        to={`/business/article/${selected.id}`}
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
