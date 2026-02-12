import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cultureArticles } from "../../data/cultureArticles";

const STORAGE_KEY = "admin_culture_draft_v1";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneStories(input = []) {
  return input.map((s, i) => ({
    id: s?.id || `culture-${i}-${makeId()}`,
    title: s?.title || "",
    date: s?.date || "",
    author: s?.author || "",
    summary: s?.summary || "",
    body: s?.body || "",
    image: s?.image || "",
  }));
}

function loadInitialStories() {
  if (typeof window === "undefined") return cloneStories(cultureArticles);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneStories(cultureArticles);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneStories(cultureArticles);
    return cloneStories(parsed);
  } catch {
    return cloneStories(cultureArticles);
  }
}

export default function AdminCulture() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [stories, setStories] = useState(() => loadInitialStories());
  const [selectedId, setSelectedId] = useState(() => loadInitialStories()[0]?.id || "");
  const [editorOpen, setEditorOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const fileRef = useRef(null);

  const selected = useMemo(
    () => stories.find((s) => String(s.id) === String(selectedId)) || stories[0] || null,
    [stories, selectedId]
  );

  const topStories = stories.slice(0, 2);
  const bottomStories = stories.slice(2, 8);

  useEffect(() => {
    let mounted = true;

    async function loadPublished() {
      if (!API) return;
      setLoadingPublished(true);
      try {
        const res = await fetch(`${API}/api/culture`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) {
          const next = cloneStories(json);
          setStories(next);
          setSelectedId(next[0]?.id || "");
          setNotice("Loaded published culture stories.");
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
    return API ? `${API}${image}` : image;
  }

  function patchSelected(patch) {
    if (!selected) return;
    setStories((prev) => prev.map((s) => (String(s.id) === String(selected.id) ? { ...s, ...patch } : s)));
  }

  function addStory() {
    const newStory = {
      id: makeId(),
      title: "",
      date: new Date().toISOString().slice(0, 10),
      author: "",
      summary: "",
      body: "",
      image: "",
    };
    setStories((prev) => [newStory, ...prev]);
    setSelectedId(newStory.id);
    setEditorOpen(true);
    setNotice("New story added.");
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

      const temp = next[index];
      next[index] = next[swap];
      next[swap] = temp;
      return next;
    });
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      setNotice("Culture draft saved locally.");
    } catch {
      setNotice("Could not save draft in this browser.");
    }
  }

  function resetFromDefault() {
    const next = cloneStories(cultureArticles);
    setStories(next);
    setSelectedId(next[0]?.id || "");
    setNotice("Reset to default culture content.");
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

      const res = await fetch(`${API}/api/uploads/culture`, {
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
      const res = await fetch(`${API}/api/culture`, {
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
      setNotice("Published. Culture page is now updated.");
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
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Culture Edits</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Edit culture stories, reorder layout, and preview changes before publishing.
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Preview</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {topStories.map((story) => (
              <article key={story.id} className="rounded border border-zinc-300 bg-zinc-100 p-3">
                <div className="overflow-hidden rounded bg-zinc-200">
                  {story.image ? (
                    <img src={resolveImageUrl(story.image)} alt={story.title || "Culture story"} className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <p className="pt-3 text-xs text-zinc-500">{story.date || "Date"}</p>
                <h3 className="pt-2 text-2xl font-semibold leading-tight text-zinc-900">
                  {story.title || "Untitled story"}
                </h3>
                <p className="pt-2 text-sm text-zinc-700">{story.summary || "Add a short summary."}</p>
                <p className="pt-2 text-xs text-zinc-600">{story.author || "Author"}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bottomStories.map((story) => (
              <article key={story.id} className="rounded border border-zinc-300 bg-zinc-100 p-3">
                <div className="overflow-hidden rounded bg-zinc-200">
                  {story.image ? (
                    <img src={resolveImageUrl(story.image)} alt={story.title || "Culture story"} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <p className="pt-3 text-xs text-zinc-500">{story.date || "Date"}</p>
                <h3 className="pt-2 text-lg font-semibold leading-tight text-zinc-900">{story.title || "Untitled story"}</h3>
                <p className="pt-2 text-xs text-zinc-600">{story.author || "Author"}</p>
              </article>
            ))}
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
            <p className="mt-1 text-xs text-zinc-600">Select and edit a story in the exact order shown above.</p>
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
                        <span className="text-xs text-zinc-600">
                          {selected.image ? "Image is set." : "No image selected."}
                        </span>
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
                        to={`/culture/article/${selected.id}`}
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
