import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "admin_podcast_draft_v1";

const defaultEpisodes = [];

const colorOptions = [
  "from-[#1f2937] to-[#0f172a]",
  "from-[#0f766e] to-[#134e4a]",
  "from-[#7f1d1d] to-[#450a0a]",
  "from-[#312e81] to-[#1e1b4b]",
  "from-[#9a3412] to-[#7c2d12]",
];

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneEpisodes(input = []) {
  return input.map((episode, idx) => ({
    id: episode?.id || `podcast-${idx}-${makeId()}`,
    title: episode?.title || "",
    host: episode?.host || "",
    duration: episode?.duration || "",
    mood: episode?.mood || "Analysis",
    channel: episode?.channel || "",
    description: episode?.description || "",
    color: episode?.color || "from-[#1f2937] to-[#0f172a]",
    watchUrl: episode?.watchUrl || "",
  }));
}

function loadInitialEpisodes() {
  if (typeof window === "undefined") return cloneEpisodes(defaultEpisodes);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneEpisodes(defaultEpisodes);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneEpisodes(defaultEpisodes);
    return cloneEpisodes(parsed);
  } catch {
    return cloneEpisodes(defaultEpisodes);
  }
}

export default function AdminPodcast() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");

  const [episodes, setEpisodes] = useState(() => loadInitialEpisodes());
  const [selectedId, setSelectedId] = useState(() => loadInitialEpisodes()[0]?.id || "");
  const [editorOpen, setEditorOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(false);

  const selected = useMemo(
    () => episodes.find((episode) => String(episode.id) === String(selectedId)) || episodes[0] || null,
    [episodes, selectedId]
  );

  const featured = episodes[0] || null;
  const queue = episodes.slice(1, 4);

  useEffect(() => {
    if (!episodes.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !episodes.some((episode) => String(episode.id) === String(selectedId))) {
      setSelectedId(episodes[0].id);
    }
  }, [episodes, selectedId]);

  useEffect(() => {
    let mounted = true;

    async function loadPublished() {
      if (!API) return;
      setLoadingPublished(true);
      try {
        const res = await fetch(`${API}/api/podcast`);
        const json = await res.json();
        if (!res.ok) return;
        if (mounted && Array.isArray(json) && json.length > 0) {
          const next = cloneEpisodes(json);
          setEpisodes(next);
          setSelectedId(next[0]?.id || "");
          setNotice("Loaded published podcast episodes.");
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
    setEpisodes((prev) =>
      prev.map((episode) => (String(episode.id) === String(selected.id) ? { ...episode, ...patch } : episode))
    );
  }

  function addEpisode() {
    const next = {
      id: makeId(),
      title: "",
      host: "",
      duration: "30 min",
      mood: "Analysis",
      channel: "",
      description: "",
      color: "from-[#1f2937] to-[#0f172a]",
      watchUrl: "",
    };
    setEpisodes((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setEditorOpen(true);
    setNotice("New episode added.");
  }

  function deleteSelected() {
    if (!selected) return;
    setEpisodes((prev) => {
      const next = prev.filter((episode) => String(episode.id) !== String(selected.id));
      setSelectedId(next[0]?.id || "");
      return next;
    });
    setNotice("Episode removed.");
  }

  function moveSelected(direction) {
    if (!selected) return;
    setEpisodes((prev) => {
      const next = [...prev];
      const index = next.findIndex((episode) => String(episode.id) === String(selected.id));
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
      setNotice("Podcast draft saved locally.");
    } catch {
      setNotice("Could not save draft in this browser.");
    }
  }

  function resetFromDefault() {
    const next = cloneEpisodes(defaultEpisodes);
    setEpisodes(next);
    setSelectedId(next[0]?.id || "");
    setNotice("Reset podcast episodes.");
  }

  async function publishEpisodes() {
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
      const res = await fetch(`${API}/api/podcast`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(episodes),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Publish failed");

      const next = Array.isArray(json?.data) ? cloneEpisodes(json.data) : episodes;
      setEpisodes(next);
      setSelectedId(next[0]?.id || "");
      setNotice("Published. Podcast page is now updated.");
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
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] md:text-4xl">Podcast Edits</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Edit featured episodes, queue order, and watch links for the Podcast page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addEpisode}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              New Episode
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
              onClick={publishEpisodes}
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
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.8fr]">
            <article className={`rounded-2xl border border-zinc-300 bg-gradient-to-br ${featured.color} p-4 text-white`}>
              <p className="text-xs uppercase tracking-[0.12em] text-white/80">Featured Episode</p>
              <h3 className="pt-2 text-3xl font-semibold leading-tight">{featured.title || "Untitled episode"}</h3>
              <p className="pt-2 text-sm text-white/80">
                {featured.host || "Host"} <span className="px-2">-</span> {featured.channel || "Channel"}
                <span className="px-2">-</span> {featured.duration || "Duration"}
              </p>
              <p className="pt-3 text-sm text-white/90">{featured.description || "Add description"}</p>
              <p className="pt-3 text-xs text-white/80">Watch link: {featured.watchUrl || "Not set"}</p>
            </article>

            <div className="rounded-2xl border border-zinc-300 bg-zinc-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Up Next</p>
              <div className="mt-2 space-y-2">
                {queue.map((episode, idx) => (
                  <article key={episode.id} className="rounded-lg border border-zinc-300 bg-white p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      Queue {idx + 1} - {episode.duration || "Duration"}
                    </p>
                    <h3 className="pt-1 text-sm font-semibold text-zinc-900">{episode.title || "Untitled"}</h3>
                  </article>
                ))}
              </div>
            </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Episode Editor</p>
            <p className="mt-1 text-xs text-zinc-600">Select and edit episode details in display order.</p>
          </div>
          <span className="rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800">
            {editorOpen ? "Collapse" : "Expand"}
          </span>
        </button>

        {editorOpen ? (
          <div className="border-t border-zinc-200 p-4">
            <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Episodes</p>
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {episodes.map((episode, idx) => (
                    <button
                      key={episode.id}
                      type="button"
                      onClick={() => setSelectedId(episode.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        String(selected?.id) === String(episode.id)
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-wide opacity-80">Position {idx + 1}</p>
                      <p className="truncate font-semibold">{episode.title || "Untitled"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-zinc-600">Select an episode to edit.</p>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Title" value={selected.title} onChange={(v) => patchSelected({ title: v })} />
                      <Field label="Host" value={selected.host} onChange={(v) => patchSelected({ host: v })} />
                      <Field label="Duration (e.g. 42 min)" value={selected.duration} onChange={(v) => patchSelected({ duration: v })} />
                      <Field label="Mood" value={selected.mood} onChange={(v) => patchSelected({ mood: v })} />
                      <Field label="Channel" value={selected.channel} onChange={(v) => patchSelected({ channel: v })} />
                      <Field label="Watch URL" value={selected.watchUrl} onChange={(v) => patchSelected({ watchUrl: v })} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Background Gradient</label>
                      <select
                        value={selected.color || "from-[#1f2937] to-[#0f172a]"}
                        onChange={(e) => patchSelected({ color: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                      >
                        {colorOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Description</label>
                      <textarea
                        value={selected.description}
                        onChange={(e) => patchSelected({ description: e.target.value })}
                        rows={5}
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
                        Delete Episode
                      </button>
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
