import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;

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
  const base = (api || "").replace(/\/+$/, "").replace(/\/api$/i, "");
  return base ? `${base}${url}` : url;
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
  const leadStory = activeStories[0] || null;
  const sideStories = activeStories.slice(1);

  const selected = useMemo(() => {
    if (!selectedId) return activeStories[0] || null;
    return activeStories.find((s) => String(s.id) === String(selectedId)) || null;
  }, [activeStories, selectedId]);

  const pulseText = useMemo(
    () =>
      desk === "local"
        ? "Local Pulse: county assemblies, parliament, and grassroots civic movements."
        : "Global Pulse: diplomacy, multilateral policy shifts, and election watch.",
    [desk]
  );

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
  }, [desk, activeStories, selectedId]);

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
      next[desk] = [...(next[desk] || []), story];
      return next;
    });
    setSelectedId(String(story.id));
    setPanelOpen(true);
  }

  function deleteSelected() {
    if (!selected) return;
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      const list = (next[desk] || []).filter((s) => String(s.id) !== String(selected.id));
      next[desk] = list;
      return next;
    });
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
      setNotice("Saved.");
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

      patchSelected({ image: resolveImageUrl(API, json.url) });
      setNotice("Image uploaded.");
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-[0.05em] text-black/90 md:text-6xl">
              Politics
            </h1>
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            <p className="pt-3 text-sm text-black/65">
              Manage local and international stories with the same structure as the live Politics page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addStory}
              className="rounded border border-black/25 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              New Story
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={saveAll}
              className="rounded border border-black/25 bg-[#dfe3e8] px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={load}
              className="rounded border border-black/25 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-2 rounded border border-black/25 p-1 w-fit">
          <button
            type="button"
            onClick={() => setDesk("local")}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              desk === "local" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
            }`}
          >
            Local News
          </button>
          <button
            type="button"
            onClick={() => setDesk("international")}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              desk === "international" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
            }`}
          >
            International
          </button>
        </div>

        <MotionDiv
          key={desk}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-5 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70"
        >
          {pulseText}
        </MotionDiv>

        {(error || notice) && (
          <div className="mt-4 grid gap-2">
            {error ? (
              <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-black">{error}</div>
            ) : null}
            {notice ? (
              <div className="rounded border border-black/20 bg-white/70 px-4 py-3 text-sm text-black">{notice}</div>
            ) : null}
          </div>
        )}

        {loading ? (
          <div className="mt-5 rounded border border-black/15 bg-white/30 p-5 text-sm text-black/70">Loading politics...</div>
        ) : activeStories.length === 0 ? (
          <div className="mt-5 rounded border border-black/15 bg-white/30 p-5 text-sm text-black/70">
            No stories yet. Click <span className="font-semibold">New Story</span>.
          </div>
        ) : (
          <>
            <MotionDiv
              key={`${desk}-preview`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]"
            >
              {leadStory ? (
                <MotionArticle className="overflow-hidden rounded border border-black/15 bg-white/40">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(String(leadStory.id));
                      setPanelOpen(true);
                    }}
                    className="group block w-full text-left"
                  >
                    <img
                      src={
                        resolveImageUrl(API, leadStory.image) ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='1200' height='700' fill='%23eef2f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='34'%3ELead Story Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={leadStory.title || "Lead"}
                      className="h-72 w-full object-cover md:h-96"
                    />
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                        {leadStory.tag || "Politics"} <span className="px-2">-</span> {leadStory.date || "Date"}
                      </p>
                      <h2 className="pt-3 text-4xl leading-tight text-black/90 transition group-hover:text-black md:text-[42px]">
                        {leadStory.title || "Set the lead headline"}
                      </h2>
                      <p className="pt-4 text-black/75">{leadStory.summary || "Add a summary for this story."}</p>
                    </div>
                  </button>
                </MotionArticle>
              ) : null}

              <div className="grid gap-5">
                {sideStories.slice(0, 2).map((story) => (
                  <MotionArticle key={story.id} className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(String(story.id));
                        setPanelOpen(true);
                      }}
                      className="group contents text-left"
                    >
                      <img
                        src={
                          resolveImageUrl(API, story.image) ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='680' height='360'%3E%3Crect width='680' height='360' fill='%23eef2f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'%3ESide Image%3C/text%3E%3C/svg%3E"
                        }
                        alt={story.title || "Story"}
                        className="h-36 w-full rounded object-cover"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {story.tag || "Politics"} <span className="px-2">-</span> {story.date || "Date"}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {story.title || "Set side headline"}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{story.summary || "Add side summary."}</p>
                      </div>
                    </button>
                  </MotionArticle>
                ))}
              </div>
            </MotionDiv>

            {sideStories.length > 2 ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {sideStories.slice(2).map((story) => (
                  <MotionArticle key={story.id} className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(String(story.id));
                        setPanelOpen(true);
                      }}
                      className="group contents text-left"
                    >
                      <img
                        src={
                          resolveImageUrl(API, story.image) ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='680' height='360'%3E%3Crect width='680' height='360' fill='%23eef2f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'%3EStory Image%3C/text%3E%3C/svg%3E"
                        }
                        alt={story.title || "Story"}
                        className="h-36 w-full rounded object-cover"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                          {story.tag || "Politics"} <span className="px-2">-</span> {story.date || "Date"}
                        </p>
                        <h3 className="pt-2 text-2xl leading-tight text-black/85 transition group-hover:text-black">
                          {story.title || "Set story headline"}
                        </h3>
                        <p className="pt-3 text-sm text-black/70">{story.summary || "Add story summary."}</p>
                      </div>
                    </button>
                  </MotionArticle>
                ))}
              </div>
            ) : null}

            <div className="mt-6 rounded border border-black/20 bg-[#dfe3e8]">
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3"
              >
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Story Editor</p>
                  <p className="mt-1 text-xs text-black/55">Edit title, summary, tag, image and full content for selected story.</p>
                </div>
                <span className="rounded border border-black/25 bg-white px-3 py-1 text-xs font-semibold text-black">
                  {panelOpen ? "Collapse" : "Expand"}
                </span>
              </button>

              {panelOpen ? (
                <div className="border-t border-black/15 bg-white/40 p-4">
                  {!selected ? (
                    <p className="text-sm text-black/60">Select a story from preview to edit.</p>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Title</label>
                          <input
                            value={selected.title || ""}
                            onChange={(e) => patchSelected({ title: e.target.value })}
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          />
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Tag</label>
                            <input
                              value={selected.tag || ""}
                              onChange={(e) => patchSelected({ tag: e.target.value })}
                              className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Date</label>
                            <input
                              value={selected.date || ""}
                              onChange={(e) => patchSelected({ date: e.target.value })}
                              className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Summary</label>
                          <textarea
                            value={selected.summary || ""}
                            onChange={(e) => patchSelected({ summary: e.target.value })}
                            rows={4}
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Content</label>
                          <textarea
                            value={selected.content || ""}
                            onChange={(e) => patchSelected({ content: e.target.value })}
                            rows={8}
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={saveAll}
                            disabled={saving}
                            className="h-8 rounded bg-black px-2.5 py-1 text-xs font-semibold leading-none text-white hover:opacity-90 disabled:opacity-60"
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSelected("up")}
                            className="h-8 rounded border border-black/25 bg-white px-2.5 py-1 text-xs font-semibold leading-none text-black hover:bg-black/5"
                          >
                            Move Up
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSelected("down")}
                            className="h-8 rounded border border-black/25 bg-white px-2.5 py-1 text-xs font-semibold leading-none text-black hover:bg-black/5"
                          >
                            Move Down
                          </button>
                          <button
                            type="button"
                            onClick={deleteSelected}
                            className="h-8 rounded border border-black/25 bg-white px-2.5 py-1 text-xs font-semibold leading-none text-black hover:bg-black/5"
                          >
                            Delete Story
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="rounded border border-black/15 bg-white/60 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Image Upload</p>
                          <p className="mt-1 text-xs text-black/55">Upload JPG/PNG/WebP or paste image URL.</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="rounded border border-black/25 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-black/5"
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

                            <input
                              value={selected.image || ""}
                              onChange={(e) => patchSelected({ image: e.target.value })}
                              className="min-w-[220px] flex-1 rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                              placeholder="Paste image URL"
                            />
                          </div>
                        </div>

                        <div className="overflow-hidden rounded border border-black/15 bg-white">
                          <div className="border-b border-black/10 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Preview</p>
                          </div>
                          <img
                            src={
                              resolveImageUrl(API, selected.image) ||
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='1200' height='700' fill='%23eef2f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='34'%3ENo Image%3C/text%3E%3C/svg%3E"
                            }
                            alt={selected.title || "preview"}
                            className="h-64 w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </MotionSection>
  );
}
