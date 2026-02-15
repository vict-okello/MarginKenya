// src/pages/AdminWorld.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionAside = motion.aside;
const MotionImage = motion.img;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

const regionOptions = ["all", "africa", "europe", "asia", "americas", "middle-east"];
const colorOptions = [
  { name: "Purple", value: "bg-[#6358e8]" },
  { name: "Red", value: "bg-[#f0503a]" },
  { name: "Orange", value: "bg-[#ee5b45]" },
  { name: "Gold", value: "bg-[#d8b73a]" },
  { name: "Green", value: "bg-[#2ec86b]" },
  { name: "Blue", value: "bg-[#3da5d9]" },
  { name: "Slate", value: "bg-[#4b5563]" },
];
const regionBriefing = {
  all: { title: "Global Blend", signal: "Live desk feed", risk: "Mixed", tempo: "High" },
  africa: { title: "Africa Desk", signal: "Policy + growth shift", risk: "Moderate", tempo: "Rising" },
  europe: { title: "Europe Desk", signal: "Culture + markets", risk: "Low", tempo: "Stable" },
  asia: { title: "Asia Desk", signal: "Tech acceleration", risk: "Moderate", tempo: "High" },
  americas: { title: "Americas Desk", signal: "Health + AI policy", risk: "Moderate", tempo: "Rising" },
  "middle-east": { title: "Middle East Desk", signal: "Sports + civic momentum", risk: "Low", tempo: "Steady" },
};

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const makeLead = () => ({
  id: makeId(),
  type: "lead",
  label: "World News",
  date: new Date().toISOString().slice(0, 10),
  title: "",
  summary: "",
  content: "",
  image: "",
  articleId: "lead-worldnews",
  status: "draft", // draft | published
});

const makeSide = () => ({
  id: makeId(),
  type: "side",
  label: "World News",
  date: new Date().toISOString().slice(0, 10),
  title: "",
  to: "/worldnews",
  color: "bg-[#6358e8]",
  region: "all",
  image: "",
  status: "draft",
});

function normalizeWorld(payload) {
  const lead = payload?.lead ? { ...makeLead(), ...payload.lead, type: "lead" } : makeLead();
  const storiesRaw = Array.isArray(payload?.stories) ? payload.stories : [];
  const stories = storiesRaw.map((s) => ({ ...makeSide(), ...s, type: "side" }));
  return { lead, stories };
}

function safeDateStr(s) {
  if (!s) return "";
  return String(s).slice(0, 32);
}

function buildPreviewImg(API, path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}${path}`;
}

export default function AdminWorld({ variant = "page" }) {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");
  const isPage = variant === "page";

  const [activeRegion, setActiveRegion] = useState("all");
  const activeBriefing = regionBriefing[activeRegion];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [lead, setLead] = useState(makeLead());
  const [stories, setStories] = useState([]);

  const [selectedKey, setSelectedKey] = useState("lead"); // "lead" or story id
  const [panelOpen, setPanelOpen] = useState(true);

  const leadFileRef = useRef(null);
  const storyFileRef = useRef(null);

  const selected = useMemo(() => {
    if (selectedKey === "lead") return lead;
    return stories.find((s) => s.id === selectedKey) || null;
  }, [selectedKey, lead, stories]);

  const visibleSideStories = useMemo(() => {
    const list = activeRegion === "all" ? stories : stories.filter((s) => s.region === activeRegion);
    // Preview should look like the real page: show published only
    return list.filter((s) => s.status === "published");
  }, [activeRegion, stories]);

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  async function load() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API}/api/worldnews-admin`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load world news");
      const norm = normalizeWorld(data);
      setLead(norm.lead);
      setStories(norm.stories);
      setSelectedKey("lead");
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll(nextLead = lead, nextStories = stories) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const res = await fetch(`${API}/api/worldnews-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({ lead: nextLead, stories: nextStories }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save world news");
      const norm = normalizeWorld(data);
      setLead(norm.lead);
      setStories(norm.stories);
      setNotice("Saved.");
      window.setTimeout(() => setNotice(""), 1400);
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file, target) {
    setUploading(true);
    setError("");
    setNotice("");
    try {
      if (!token) throw new Error("Missing admin token. Please login again.");
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/worldnews-admin/upload`, {
        method: "POST",
        headers: { ...authHeaders },
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      const imageUrl = data.imageUrl || "";

      if (target === "lead") {
        setLead((p) => ({ ...p, image: imageUrl }));
      } else {
        setStories((prev) => prev.map((s) => (s.id === target ? { ...s, image: imageUrl } : s)));
      }

      setNotice("Image uploaded.");
      window.setTimeout(() => setNotice(""), 1400);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (leadFileRef.current) leadFileRef.current.value = "";
      if (storyFileRef.current) storyFileRef.current.value = "";
    }
  }

  function addSideStory() {
    const s = makeSide();
    setStories((prev) => [s, ...prev]);
    setSelectedKey(s.id);
    setPanelOpen(true);
  }

  function deleteSideStory(id) {
    setStories((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedKey === id) setSelectedKey("lead");
      return next;
    });
  }

  function deleteLeadStory() {
    setLead(makeLead());
    setSelectedKey("lead");
  }

  function patchSelected(patch) {
    if (!selected) return;
    if (selectedKey === "lead") {
      setLead((p) => ({ ...p, ...patch }));
      return;
    }
    setStories((prev) => prev.map((s) => (s.id === selectedKey ? { ...s, ...patch } : s)));
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
      className={`bg-[#d8d8dc] px-4 ${isPage ? "py-12" : "py-10"}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* MATCHES WORLDNEWS HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
          <div>
            {isPage ? (
              <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-black/90 md:text-4xl">
                World News Edits
              </h1>
            ) : (
              <h2 className="text-3xl font-black uppercase tracking-[0.04em] text-black/90">World News Edits</h2>
            )}
            <div className="mt-2 h-[3px] w-20 rounded bg-black/70" />
            {isPage ? (
              <p className="pt-3 text-sm text-black/65">
                Edit global headlines, analysis, and stories shaping markets and policy.
              </p>
            ) : null}
          </div>

          {/* Admin actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedKey("lead");
                setPanelOpen(true);
              }}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Edit Lead
            </button>
            <button
              type="button"
              onClick={addSideStory}
              className="rounded border border-black/25 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              New Side Story
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={() => saveAll()}
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

        {/* MATCHES BRIEFING BLOCK */}
        <div className="rounded border border-black/20 bg-[#dfe3e8] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-black/55">Global Focus</p>
              <p className="pt-1 text-sm text-black/75">{activeBriefing.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`rounded border px-2 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                    activeRegion === region
                      ? "border-black bg-black text-white"
                      : "border-black/25 text-black/65 hover:bg-black/10"
                  }`}
                >
                  {region.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-black/70 sm:grid-cols-3">
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Signal: {activeBriefing.signal}</p>
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Risk: {activeBriefing.risk}</p>
            <p className="rounded border border-black/15 bg-white/40 px-2 py-1">Tempo: {activeBriefing.tempo}</p>
          </div>
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

        {/* PREVIEW GRID */}
        <div className="mt-5 rounded-2xl border border-black/15 bg-gradient-to-br from-[#e7ebf0] via-[#dfe5ec] to-[#d6dde6] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/65">Live Preview</p>
            <p className="text-xs text-black/55">Click a card to edit it</p>
          </div>

          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.95fr]"
          >
            {/* Lead Preview */}
            <MotionArticle variants={itemVariants}>
              <button
                type="button"
                onClick={() => {
                  setSelectedKey("lead");
                  setPanelOpen(true);
                }}
                className={`group block w-full overflow-hidden rounded-2xl border bg-white/80 text-left shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 ${
                  selectedKey === "lead" ? "border-black/45 ring-2 ring-black/20" : "border-black/15"
                }`}
              >
                <div className="relative overflow-hidden">
                  <MotionImage
                    src={
                      buildPreviewImg(API, lead.image) ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='1200' height='700' fill='%23cfd5dc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='40'%3EUpload Lead Image%3C/text%3E%3C/svg%3E"
                    }
                    alt="World News lead"
                    className="h-56 w-full object-cover md:h-72"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.28 }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      {lead.status || "draft"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-black/60">
                    <span className="rounded bg-[#6358e8] px-2 py-1 font-semibold text-white">
                      {lead.label || "World News"}
                    </span>
                    <span>{safeDateStr(lead.date) || "-"}</span>
                  </div>
                  <h2 className="pt-3 text-3xl font-semibold leading-tight text-black/90 transition group-hover:text-black md:text-[40px] [font-family:Georgia,Times,serif]">
                    {lead.title || "Set the lead headline"}
                  </h2>
                </div>
              </button>
            </MotionArticle>

            {/* Side Preview */}
            <MotionAside variants={itemVariants} className="grid content-start gap-3">
              {visibleSideStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: "easeOut" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKey(story.id);
                      setPanelOpen(true);
                    }}
                    className={`group block w-full rounded-2xl border bg-white/80 p-3 text-left shadow-[0_8px_18px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 ${
                      selectedKey === story.id ? "border-black/45 ring-2 ring-black/20" : "border-black/15"
                    }`}
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_108px] sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-black/60">
                          <span className={`rounded px-2 py-1 font-semibold text-white ${story.color}`}>
                            {story.label}
                          </span>
                          <span>{safeDateStr(story.date)}</span>
                        </div>
                        <h3 className="pt-2 text-3xl leading-tight text-black/85 transition group-hover:text-black md:text-[34px] [font-family:Georgia,Times,serif]">
                          {story.title || "Untitled side story"}
                        </h3>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-black/10 bg-zinc-200">
                        <img
                          src={
                            buildPreviewImg(API, story.image) ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='220'%3E%3Crect width='320' height='220' fill='%23d9dee5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='22'%3ENo Image%3C/text%3E%3C/svg%3E"
                          }
                          alt={story.title || "Side story"}
                          className="h-20 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}

              {visibleSideStories.length === 0 ? (
                <div className="rounded-2xl border border-black/15 bg-white/70 p-4 text-sm text-black/65">
                  No published side stories for this region yet.
                </div>
              ) : null}
            </MotionAside>
          </MotionDiv>
        </div>
        {/* EDITOR PANEL — sits BELOW preview so the preview layout stays identical */}
        <div className="mt-6 rounded border border-black/20 bg-[#dfe3e8]">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3"
          >
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                {selectedKey === "lead" ? "Lead Editor" : "Side Story Editor"}
              </p>
              <p className="mt-1 text-xs text-black/55">
                {selectedKey === "lead"
                  ? "Upload lead image, set headline and status."
                  : "Edit title, label, region, and publish state."}
              </p>
            </div>
            <span className="rounded border border-black/25 bg-white px-3 py-1 text-xs font-semibold text-black">
              {panelOpen ? "Collapse" : "Expand"}
            </span>
          </button>

          {panelOpen ? (
            <div className="border-t border-black/15 bg-white/40 p-4">
              {!selected ? (
                <p className="text-sm text-black/60">Select a story to edit.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  {/* LEFT: fields */}
                  <div className="grid gap-3">
                    {/* Common */}
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                        Title
                      </label>
                      <input
                        value={selected.title}
                        onChange={(e) => patchSelected({ title: e.target.value })}
                        placeholder={selectedKey === "lead" ? "Lead headline" : "Side story headline"}
                        className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                      />
                    </div>

                    {selectedKey === "lead" ? (
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                          Summary
                        </label>
                        <textarea
                          value={selected.summary || ""}
                          onChange={(e) => patchSelected({ summary: e.target.value })}
                          placeholder="Short article summary..."
                          rows={3}
                          className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                        />
                      </div>
                    ) : null}

                    {selectedKey === "lead" ? (
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                          Article Content
                        </label>
                        <textarea
                          value={selected.content || ""}
                          onChange={(e) => patchSelected({ content: e.target.value })}
                          placeholder="Write full article content here..."
                          rows={8}
                          className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                        />
                      </div>
                    ) : null}

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                          Label
                        </label>
                        <input
                          value={selected.label}
                          onChange={(e) => patchSelected({ label: e.target.value })}
                          placeholder="World News"
                          className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                          Date
                        </label>
                        <input
                          value={selected.date}
                          onChange={(e) => patchSelected({ date: e.target.value })}
                          placeholder="Jan 25, 2025"
                          className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                        />
                      </div>
                    </div>

                    {selectedKey !== "lead" ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                            Region
                          </label>
                          <select
                            value={selected.region}
                            onChange={(e) => patchSelected({ region: e.target.value })}
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          >
                            {regionOptions.map((r) => (
                              <option key={r} value={r}>
                                {r.replace("-", " ")}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                            Tag Color
                          </label>
                          <select
                            value={selected.color}
                            onChange={(e) => patchSelected({ color: e.target.value })}
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          >
                            {colorOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-2 md:grid-cols-2">
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

                      {selectedKey !== "lead" ? (
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                            Link (to)
                          </label>
                          <input
                            value={selected.to}
                            onChange={(e) => patchSelected({ to: e.target.value })}
                            placeholder="/worldnews"
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          />
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">
                            Article ID
                          </label>
                          <input
                            value={selected.articleId || ""}
                            onChange={(e) => patchSelected({ articleId: e.target.value })}
                            placeholder="manufacturing-emerging-trends"
                            className="w-full rounded border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveAll()}
                        className="h-8 rounded px-2.5 py-1 text-xs font-semibold leading-none text-white hover:opacity-90 disabled:opacity-60 bg-black"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      {selectedKey === "lead" ? (
                        <button
                          type="button"
                          onClick={deleteLeadStory}
                          className="h-8 rounded border border-black/25 bg-white px-2.5 py-1 text-xs font-semibold leading-none text-black hover:bg-black/5"
                        >
                          Delete Lead
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => deleteSideStory(selected.id)}
                          className="h-8 rounded border border-black/25 bg-white px-2.5 py-1 text-xs font-semibold leading-none text-black hover:bg-black/5"
                        >
                          Delete Story
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: image upload + preview */}
                  <div className="grid gap-3">
                    <div className="rounded border border-black/15 bg-white/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Image Upload</p>
                      <p className="mt-1 text-xs text-black/55">Upload from your computer (JPG/PNG/WebP).</p>

                      {selectedKey === "lead" ? (
                        <div className="mt-3 grid gap-2">
                          <input
                            ref={leadFileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={uploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadImage(f, "lead");
                            }}
                            className="block w-full max-w-xs text-sm"
                          />
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          <input
                            ref={storyFileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={uploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadImage(f, selected.id);
                            }}
                            className="block w-full max-w-xs text-sm"
                          />
                        </div>
                      )}

                      <p className="mt-2 text-xs text-black/55">
                        Stored as: <span className="font-semibold">{selected.image || "No image yet"}</span>
                      </p>
                    </div>

                    <div className="overflow-hidden rounded border border-black/15 bg-white">
                      <div className="border-b border-black/10 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/70">Preview</p>
                      </div>
                      <img
                        src={
                          buildPreviewImg(API, selected.image) ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='1200' height='700' fill='%23eef2f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='34'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }
                        alt="preview"
                        className="h-64 w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </MotionSection>
  );
}
