import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionButton = motion.button;

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

export default function AdminPolitics() {
  const API = import.meta.env.VITE_API_URL;

  const [desk, setDesk] = useState("local");
  const [visibleCounts, setVisibleCounts] = useState({ local: 3, international: 3 });

  const [politicsDesk, setPoliticsDesk] = useState(emptyDesk);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fileInputRef = useRef(null);
  const [uploadingForId, setUploadingForId] = useState("");

  const activeStories = politicsDesk[desk] || [];
  const visibleCount = visibleCounts[desk];
  const visibleStories = activeStories.slice(0, visibleCount);

  const leadStory = visibleStories[0] || null;
  const topSideStories = visibleStories.slice(1, 3);
  const extraStories = visibleStories.slice(3);
  const canLoadMore = visibleCount < activeStories.length;

  const pulseText = useMemo(
    () =>
      desk === "local"
        ? "Local Pulse: county assemblies, parliament, and grassroots civic movements."
        : "Global Pulse: diplomacy, multilateral policy shifts, and election watch.",
    [desk]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      setToast("");
      try {
        const res = await fetch(`${API}/api/politics`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load politics");
        const data = normalizeDesk(await res.json());
        if (alive) setPoliticsDesk(data);
      } catch (e) {
        if (alive) setError(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [API]);

  function setStory(id, patch) {
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      next[desk] = (next[desk] || []).map((s) => (String(s.id) === String(id) ? { ...s, ...patch } : s));
      return next;
    });
  }

  function addStory() {
    setToast("");
    setError("");
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      next[desk] = [makeNewStory(), ...(next[desk] || [])];
      return next;
    });
    setVisibleCounts((prev) => ({ ...prev, [desk]: Math.max(prev[desk], 3) }));
  }

  function deleteStory(id) {
    setToast("");
    setError("");
    setPoliticsDesk((prev) => {
      const next = { ...prev };
      next[desk] = (next[desk] || []).filter((s) => String(s.id) !== String(id));
      return next;
    });
  }

  function moveStory(id, direction) {
    setPoliticsDesk((prev) => {
      const list = [...(prev[desk] || [])];
      const idx = list.findIndex((s) => String(s.id) === String(id));
      if (idx < 0) return prev;

      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= list.length) return prev;

      const tmp = list[idx];
      list[idx] = list[swapWith];
      list[swapWith] = tmp;

      return { ...prev, [desk]: list };
    });
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    setToast("");
    try {
      const res = await fetch(`${API}/api/politics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(politicsDesk),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json().catch(() => null);
      const next = normalizeDesk(json?.data || politicsDesk);
      setPoliticsDesk(next);
      setToast("Saved");
    } catch (e) {
      setError(e?.message || "Save error");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file, storyId) {
    setError("");
    setToast("");
    setUploadingForId(storyId);

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${API}/api/politics/upload`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      if (!json?.url) throw new Error("Upload returned no url");

      setStory(storyId, { image: `${API}${json.url}` });
      setToast("Image uploaded");
    } catch (e) {
      setError(e?.message || "Upload error");
    } finally {
      setUploadingForId("");
    }
  }

  function openUploadPicker(storyId) {
    setUploadingForId(storyId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file || !uploadingForId) return;
    uploadImage(file, uploadingForId);
  }

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#d8d8dc] px-4 py-12"
    >
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-black/90 md:text-4xl">
              Politics Edits
            </h1>
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            <p className="pt-3 max-w-2xl text-sm text-black/65">
              Same layout as Politics — edit Local and International stories, then save to publish.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2 rounded border border-black/25 p-1">
              <MotionButton
                type="button"
                onClick={() => setDesk("local")}
                className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  desk === "local" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                Local News
              </MotionButton>
              <MotionButton
                type="button"
                onClick={() => setDesk("international")}
                className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  desk === "international" ? "bg-black text-white" : "text-black/70 hover:bg-black/10"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                International
              </MotionButton>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <MotionButton
                type="button"
                onClick={addStory}
                className="rounded border border-black/25 bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/80 transition hover:bg-white/40"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Add Story
              </MotionButton>

              <MotionButton
                type="button"
                onClick={saveAll}
                disabled={saving || loading}
                className="rounded bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black/80 disabled:opacity-60"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? "Saving..." : "Save"}
              </MotionButton>
            </div>
          </div>
        </div>

        <MotionDiv
          key={desk}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 rounded border border-black/25 bg-[#dfe2e6] px-4 py-3 text-xs uppercase tracking-[0.12em] text-black/70"
        >
          {pulseText}
        </MotionDiv>

        {toast ? (
          <div className="mt-4 rounded border border-black/20 bg-white/35 px-4 py-3 text-sm text-black/75">
            {toast}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded border border-red-900/20 bg-white/35 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 rounded border border-black/15 bg-white/30 p-5 text-sm text-black/70">
            Loading politics...
          </div>
        ) : activeStories.length === 0 ? (
          <div className="mt-5 rounded border border-black/15 bg-white/30 p-5 text-sm text-black/70">
            No stories yet. Click <span className="font-semibold">Add Story</span>, then <span className="font-semibold">Save</span>.
          </div>
        ) : (
          <>
            <MotionDiv
              key={`${desk}-grid`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]"
            >
              {leadStory ? (
                <MotionArticle className="overflow-hidden rounded border border-black/15 bg-white/40">
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                        Lead Story <span className="px-2">-</span> {leadStory.id}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveStory(leadStory.id, "up")}
                          className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStory(leadStory.id, "down")}
                          className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStory(leadStory.id)}
                          className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Tag</span>
                          <input
                            value={leadStory.tag || ""}
                            onChange={(e) => setStory(leadStory.id, { tag: e.target.value })}
                            className="rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Date</span>
                          <input
                            value={leadStory.date || ""}
                            onChange={(e) => setStory(leadStory.id, { date: e.target.value })}
                            className="rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                            placeholder="YYYY-MM-DD"
                          />
                        </label>

                        <label className="grid gap-1 md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Title</span>
                          <input
                            value={leadStory.title || ""}
                            onChange={(e) => setStory(leadStory.id, { title: e.target.value })}
                            className="rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <label className="grid gap-1 md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Summary</span>
                          <textarea
                            value={leadStory.summary || ""}
                            onChange={(e) => setStory(leadStory.id, { summary: e.target.value })}
                            className="min-h-[90px] rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <label className="grid gap-1 md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">
                            Content (optional for article page)
                          </span>
                          <textarea
                            value={leadStory.content || ""}
                            onChange={(e) => setStory(leadStory.id, { content: e.target.value })}
                            className="min-h-[140px] rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <div className="grid gap-2 md:col-span-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openUploadPicker(leadStory.id)}
                              className="rounded border border-black/25 bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/80 hover:bg-white/40"
                            >
                              {uploadingForId === leadStory.id ? "Uploading..." : "Upload Image"}
                            </button>

                            <input
                              value={leadStory.image || ""}
                              onChange={(e) => setStory(leadStory.id, { image: e.target.value })}
                              className="flex-1 rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                              placeholder="Or paste image URL"
                            />
                          </div>

                          <div className="overflow-hidden rounded border border-black/15 bg-white/40">
                            {leadStory.image ? (
                              <img
                                src={leadStory.image}
                                alt={leadStory.title || "Lead image"}
                                className="h-72 w-full object-cover md:h-96"
                              />
                            ) : (
                              <div className="flex h-72 items-center justify-center text-sm text-black/60 md:h-96">
                                No image yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionArticle>
              ) : null}

              <div className="grid gap-5">
                {topSideStories.map((story) => (
                  <MotionArticle
                    key={story.id}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
                      <div className="overflow-hidden rounded border border-black/10 bg-white/40">
                        {story.image ? (
                          <img src={story.image} alt={story.title} className="h-36 w-full object-cover" />
                        ) : (
                          <div className="flex h-36 items-center justify-center text-xs text-black/55">No image</div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                            {story.tag} <span className="px-2">-</span> {story.date}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveStory(story.id, "up")}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStory(story.id, "down")}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteStory(story.id)}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3">
                          <label className="grid gap-1">
                            <span className="text-xs uppercase tracking-[0.12em] text-black/60">Title</span>
                            <input
                              value={story.title || ""}
                              onChange={(e) => setStory(story.id, { title: e.target.value })}
                              className="rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                            />
                          </label>

                          <label className="grid gap-1">
                            <span className="text-xs uppercase tracking-[0.12em] text-black/60">Summary</span>
                            <textarea
                              value={story.summary || ""}
                              onChange={(e) => setStory(story.id, { summary: e.target.value })}
                              className="min-h-[90px] rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                            />
                          </label>

                          <div className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openUploadPicker(story.id)}
                                className="rounded border border-black/25 bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/80 hover:bg-white/40"
                              >
                                {uploadingForId === story.id ? "Uploading..." : "Upload Image"}
                              </button>

                              <input
                                value={story.image || ""}
                                onChange={(e) => setStory(story.id, { image: e.target.value })}
                                className="flex-1 rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                                placeholder="Or paste image URL"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionArticle>
                ))}
              </div>
            </MotionDiv>

            {extraStories.length > 0 ? (
              <MotionDiv
                key={`${desk}-extras-${visibleCount}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-5 grid gap-5 md:grid-cols-2"
              >
                {extraStories.map((story) => (
                  <MotionArticle
                    key={story.id}
                    className="grid gap-4 rounded border border-black/15 bg-white/30 p-4 sm:grid-cols-[170px_1fr]"
                  >
                    <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
                      <div className="overflow-hidden rounded border border-black/10 bg-white/40">
                        {story.image ? (
                          <img src={story.image} alt={story.title} className="h-36 w-full object-cover" />
                        ) : (
                          <div className="flex h-36 items-center justify-center text-xs text-black/55">No image</div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-black/55">
                            {story.tag} <span className="px-2">-</span> {story.date}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveStory(story.id, "up")}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStory(story.id, "down")}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteStory(story.id)}
                              className="rounded border border-black/20 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 hover:bg-white/55"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <label className="grid gap-1">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Title</span>
                          <input
                            value={story.title || ""}
                            onChange={(e) => setStory(story.id, { title: e.target.value })}
                            className="rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs uppercase tracking-[0.12em] text-black/60">Summary</span>
                          <textarea
                            value={story.summary || ""}
                            onChange={(e) => setStory(story.id, { summary: e.target.value })}
                            className="min-h-[90px] rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                          />
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openUploadPicker(story.id)}
                            className="rounded border border-black/25 bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/80 hover:bg-white/40"
                          >
                            {uploadingForId === story.id ? "Uploading..." : "Upload Image"}
                          </button>

                          <input
                            value={story.image || ""}
                            onChange={(e) => setStory(story.id, { image: e.target.value })}
                            className="flex-1 rounded border border-black/20 bg-white/60 px-3 py-2 text-sm"
                            placeholder="Or paste image URL"
                          />
                        </div>
                      </div>
                    </div>
                  </MotionArticle>
                ))}
              </MotionDiv>
            ) : null}

            {canLoadMore ? (
              <div className="mt-7 text-center">
                <MotionButton
                  type="button"
                  onClick={() =>
                    setVisibleCounts((prev) => ({
                      ...prev,
                      [desk]: Math.min(prev[desk] + 2, activeStories.length),
                    }))
                  }
                  className="rounded bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/80"
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Load More
                </MotionButton>
              </div>
            ) : null}
          </>
        )}
      </div>
    </MotionSection>
  );
}
