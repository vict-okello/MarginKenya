import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#f59e0b", "#60a5fa", "#34d399", "#f472b6", "#c084fc"];
const EMPTY_STATS = {
  kpis: {
    totalViews: 0,
    uniqueVisitors: 0,
    avgReadTimeSec: 0,
    bounceRate: 0,
  },
  viewsByDay: [
    { day: "Mon", views: 0 },
    { day: "Tue", views: 0 },
    { day: "Wed", views: 0 },
    { day: "Thu", views: 0 },
    { day: "Fri", views: 0 },
    { day: "Sat", views: 0 },
    { day: "Sun", views: 0 },
  ],
  categoryTraffic: [],
  topArticles: [],
  articleReadStats: [],
  sectionEdits: [],
};

function joinUrl(base, path) {
  const b = String(base || "").replace(/\/$/, "");
  const p = String(path || "");
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

export default function AdminDashboard() {
  const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const { isDark = false } = useOutletContext() || {};

  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [error, setError] = useState("");
  const [dashboardConfig, setDashboardConfig] = useState({
    siteName: "MarginKenya",
    title: "Editorial Command Center",
    subtitle: "Site-aligned dashboard with live metrics and quick editorial controls.",
    headerColorFrom: "#ffffff",
    headerColorTo: "#e4e4e7",
    profileImage: "",
  });

  // ✅ Read role from localStorage
  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = adminUser?.role || "writer";
  const canSeeAnalytics = role === "editor" || role === "super_admin";
  const canSeeActivity = role === "editor" || role === "super_admin";

  // Fetch live stats ONLY when JWT exists, and send it in Authorization header.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");

        const token = localStorage.getItem("adminToken");

        // If not logged in -> do NOT fetch.
        if (!token) {
          if (alive) setStats(null);
          return;
        }

        if (!API) throw new Error("VITE_API_URL is missing");

        // ✅ Optional: Writers don’t fetch analytics endpoints
        if (!canSeeAnalytics) {
          if (alive) {
            setStats(null);
            setRecentEvents([]);
            setLastSyncAt(new Date());
          }
          return;
        }

        const statsPromise = fetch(`${API}/api/admin/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const recentPromise = fetch(`${API}/api/events/recent`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const [res, recentRes] = await Promise.all([statsPromise, recentPromise]);

        // Token invalid/expired -> logout and redirect (no demo fallback)
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          if (alive) {
            setStats(null);
            setError("Session expired. Please log in again.");
            navigate("/admin-login", { replace: true });
          }
          return;
        }

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Stats endpoint error (${res.status})`);
        }

        const json = await res.json();
        const recentJson = recentRes.ok ? await recentRes.json().catch(() => []) : [];

        if (alive) {
          setStats(json);
          setRecentEvents(Array.isArray(recentJson) ? recentJson.slice(0, 8) : []);
          setLastSyncAt(new Date());
        }
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load live stats.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [API, navigate, canSeeAnalytics]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token || !API) return;

        const res = await fetch(`${API}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        const cfg = data?.adminDashboard || {};
        const branding = data?.branding || {};

        if (!alive) return;
        setDashboardConfig({
          siteName: String(branding.siteName || "MarginKenya"),
          title: String(cfg.title || "Editorial Command Center"),
          subtitle: String(cfg.subtitle || "Site-aligned dashboard with live metrics and quick editorial controls."),
          headerColorFrom: String(cfg.headerColorFrom || "#ffffff"),
          headerColorTo: String(cfg.headerColorTo || "#e4e4e7"),
          profileImage: String(cfg.profileImage || ""),
        });
      } catch {
        // Keep defaults if settings fail.
      }
    })();

    return () => {
      alive = false;
    };
  }, [API]);

  // Entrance animation
  useEffect(() => {
    if (!pageRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = pageRef.current.querySelectorAll("[data-anim]");
    nodes.forEach((node, idx) => {
      node.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(0.995)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        {
          duration: 420,
          delay: idx * 55,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        }
      );
    });
  }, []);

  const data = stats ?? EMPTY_STATS;
  const pulseData = useMemo(() => {
    const raw = Array.isArray(data?.viewsByDay) ? data.viewsByDay : [];
    if (!raw.length) return [];

    const maxViews = Math.max(...raw.map((d) => Number(d.views) || 0), 0);
    if (maxViews <= 16) return raw;

    return raw.map((d) => ({
      ...d,
      views: Math.round(((Number(d.views) || 0) / maxViews) * 14),
    }));
  }, [data?.viewsByDay]);

  const trend = computeTrend(data.viewsByDay);
  const maxTopViews = Math.max(1, ...data.topArticles.map((a) => a.views || 0));
  const maxAvgArticleRead = Math.max(1, ...data.articleReadStats.map((a) => a.avgReadTimeSec || 0));
  const updatedAt = (lastSyncAt || new Date()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const chartTheme = {
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.12)",
    axis: isDark ? "rgba(255,255,255,0.65)" : "rgba(39,39,42,0.7)",
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div
      ref={pageRef}
      className={[
        "space-y-4 rounded-2xl p-4 md:p-5",
        isDark ? "bg-zinc-950 text-white" : "bg-[#d8d8dc] text-zinc-900",
      ].join(" ")}
    >
      <header
        data-anim
        className={[
          "rounded-2xl border p-5",
          isDark
            ? "border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-800"
            : "border-zinc-900/10 bg-gradient-to-br from-white to-zinc-100",
        ].join(" ")}
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${dashboardConfig.headerColorFrom}, ${dashboardConfig.headerColorTo})`,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                isDark ? "text-white/50" : "text-zinc-600"
              }`}
            >
              {dashboardConfig.siteName} Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{dashboardConfig.title}</h1>
            <p className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
              {dashboardConfig.subtitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill label={error ? "Live (Error)" : stats ? "Live Data" : "Waiting for Live Data"} />
              <Pill label={`Updated ${updatedAt}`} />
              <Pill label={`${Math.abs(trend.views)}% weekly shift`} />
              <Pill label={`Role: ${String(role).replaceAll("_", " ")}`} />
            </div>

            {error && (
              <div
                className={[
                  "mt-3 rounded-xl border px-3 py-2 text-sm",
                  isDark
                    ? "border-red-500/25 bg-red-500/10 text-red-200"
                    : "border-red-300 bg-red-50 text-red-700",
                ].join(" ")}
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {dashboardConfig.profileImage ? (
              <img
                src={joinUrl(API, dashboardConfig.profileImage)}
                alt="Dashboard profile"
                className="h-11 w-11 rounded-full border border-white/30 object-cover"
              />
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className={[
                "rounded-xl border px-4 py-2 text-sm font-medium transition",
                isDark
                  ? "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                  : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100",
              ].join(" ")}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ✅ If role can’t see analytics, show a locked panel instead of charts */}
      {!canSeeAnalytics ? (
        <Panel isDark={isDark} title="Analytics Locked" subtitle="Role restricted">
          <div className={isDark ? "text-sm text-white/70" : "text-sm text-zinc-600"}>
            Your role ({String(role).replaceAll("_", " ")}) doesn’t have access to analytics. Ask an editor or super admin
            for access.
          </div>
        </Panel>
      ) : (
        <>
          <section data-anim className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              isDark={isDark}
              label="Total Views"
              value={data.kpis.totalViews.toLocaleString()}
              note="Audience reach"
            />
            <KpiCard
              isDark={isDark}
              label="Unique Visitors"
              value={data.kpis.uniqueVisitors.toLocaleString()}
              note="Distinct readers"
            />
            <KpiCard isDark={isDark} label="Avg Read Time" value={formatTime(data.kpis.avgReadTimeSec)} note="Engagement depth" />
            <KpiCard isDark={isDark} label="Bounce Rate" value={`${data.kpis.bounceRate}%`} note="Landing performance" />
          </section>

          <section data-anim className="grid grid-cols-1 gap-3 xl:grid-cols-5">
            <Panel isDark={isDark} title="Audience Pulse" subtitle="7-day trend" className="xl:col-span-3">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pulseData}>
                    <defs>
                      <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" />
                    <XAxis dataKey="day" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke={chartTheme.axis}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 16]}
                      ticks={[0, 4, 8, 12, 16]}
                    />
                    <Tooltip content={<ChartTooltip isDark={isDark} />} />
                    <Area type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2.4} fillOpacity={1} fill="url(#pulseGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel isDark={isDark} title="Traffic Mix" subtitle="Category share" className="xl:col-span-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryTraffic} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                      {data.categoryTraffic.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 space-y-2">
                {data.categoryTraffic.map((item, idx) => (
                  <div
                    key={item.name}
                    className={[
                      "rounded-xl border px-3 py-2",
                      isDark ? "border-white/10 bg-white/5" : "border-zinc-300 bg-white/70",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{item.name}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-zinc-300/70"}`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section data-anim className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <Panel isDark={isDark} title="Top Performing Stories" subtitle="This week" className="xl:col-span-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topArticles}>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" />
                    <XAxis dataKey="title" hide />
                    <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip isDark={isDark} />} />
                    <Bar dataKey="views" radius={[8, 8, 0, 0]} fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-3 space-y-2">
                {data.topArticles.map((article, index) => (
                  <li
                    key={article.title}
                    className={[
                      "rounded-xl border px-3 py-2.5",
                      isDark ? "border-white/10 bg-white/5" : "border-zinc-300 bg-white/70",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="min-w-0 truncate">
                        <span className={isDark ? "text-white/45 mr-2" : "text-zinc-500 mr-2"}>#{index + 1}</span>
                        {article.title}
                      </p>
                      <p className="whitespace-nowrap font-medium">{article.views.toLocaleString()}</p>
                    </div>
                    <div className={`mt-2 h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-zinc-300/70"}`}>
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{
                          width: `${Math.max(8, Math.round((article.views / maxTopViews) * 100))}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            {canSeeActivity ? (
              <Panel isDark={isDark} title="Recent Activity" subtitle="Editorial feed">
                {recentEvents.length ? (
                  <ul className="space-y-2">
                    {recentEvents.map((event, idx) => (
                      <ActivityRow
                        key={`${event.createdAt || "time"}-${event.type || "type"}-${idx}`}
                        isDark={isDark}
                        time={formatActivityTime(event.createdAt)}
                        text={formatActivityText(event)}
                      />
                    ))}
                  </ul>
                ) : (
                  <div
                    className={
                      isDark
                        ? "rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70"
                        : "rounded-xl border border-zinc-300 bg-white/70 p-3 text-sm text-zinc-600"
                    }
                  >
                    No recent activity yet.
                  </div>
                )}
              </Panel>
            ) : (
              <Panel isDark={isDark} title="Recent Activity" subtitle="Role restricted">
                <div className={isDark ? "text-sm text-white/70" : "text-sm text-zinc-600"}>
                  Activity feed is hidden for your role.
                </div>
              </Panel>
            )}

            <Panel isDark={isDark} title="Avg Read Time by Article" subtitle="Top engagement depth">
              {data.articleReadStats.length ? (
                <ul className="space-y-2">
                  {data.articleReadStats.slice(0, 8).map((item, index) => (
                    <li
                      key={`${item.articleId || "article"}-${index}`}
                      className={[
                        "rounded-xl border px-3 py-2.5",
                        isDark ? "border-white/10 bg-white/5" : "border-zinc-300 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <p className="min-w-0 truncate">
                          <span className={isDark ? "mr-2 text-white/45" : "mr-2 text-zinc-500"}>#{index + 1}</span>
                          {item.title || "Untitled"}
                        </p>
                        <p className="whitespace-nowrap font-medium">{formatTime(item.avgReadTimeSec || 0)}</p>
                      </div>
                      <p className={isDark ? "mt-1 text-xs text-white/60" : "mt-1 text-xs text-zinc-600"}>
                        {Number(item.reads || 0).toLocaleString()} reads
                      </p>
                      <div className={`mt-2 h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-zinc-300/70"}`}>
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${Math.max(
                              8,
                              Math.round(((item.avgReadTimeSec || 0) / maxAvgArticleRead) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className={
                    isDark
                      ? "rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70"
                      : "rounded-xl border border-zinc-300 bg-white/70 p-3 text-sm text-zinc-600"
                  }
                >
                  No article read-time stats yet.
                </div>
              )}
            </Panel>
          </section>

          <section data-anim className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <Panel isDark={isDark} title="Publishing Velocity" subtitle="Edits by section">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sectionEdits}>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" />
                    <XAxis dataKey="section" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip isDark={isDark} />} />
                    <Line type="monotone" dataKey="edits" stroke="#34d399" strokeWidth={2.4} dot={{ r: 4, fill: "#34d399" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel isDark={isDark} title="Status" subtitle="System">
              <div className="space-y-2 text-sm">
                <div
                  className={
                    isDark
                      ? "rounded-xl border border-white/10 bg-white/5 p-3"
                      : "rounded-xl border border-zinc-300 bg-white/70 p-3"
                  }
                >
                  API: {error ? "Connected (live) error loading stats" : stats ? "Connected (live stats)" : "Connecting..."}
                </div>
                <div
                  className={
                    isDark
                      ? "rounded-xl border border-white/10 bg-white/5 p-3"
                      : "rounded-xl border border-zinc-300 bg-white/70 p-3"
                  }
                >
                  Theme: {isDark ? "Dark mode" : "Light mode"}
                </div>
                <div
                  className={
                    isDark
                      ? "rounded-xl border border-white/10 bg-white/5 p-3"
                      : "rounded-xl border border-zinc-300 bg-white/70 p-3"
                  }
                >
                  Last refresh: {updatedAt}
                </div>
              </div>
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({ isDark, label, value, note }) {
  return (
    <div
      data-anim
      className={
        isDark
          ? "rounded-2xl border border-white/10 bg-white/5 p-4"
          : "rounded-2xl border border-zinc-300 bg-white/70 p-4"
      }
    >
      <p className={isDark ? "text-xs uppercase tracking-wide text-white/60" : "text-xs uppercase tracking-wide text-zinc-600"}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className={isDark ? "mt-2 text-xs text-white/70" : "mt-2 text-xs text-zinc-600"}>{note}</p>
    </div>
  );
}

function Panel({ isDark, title, subtitle, children, className = "" }) {
  return (
    <section
      data-anim
      className={`${isDark ? "rounded-2xl border border-white/10 bg-white/5 p-4" : "rounded-2xl border border-zinc-300 bg-white/70 p-4"} ${className}`}
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className={isDark ? "mt-1 text-xs text-white/60" : "mt-1 text-xs text-zinc-600"}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Pill({ label }) {
  return (
    <span className="rounded-full border border-zinc-400/40 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
      {label}
    </span>
  );
}

function ActivityRow({ isDark, time, text }) {
  return (
    <li
      data-anim
      className={
        isDark
          ? "flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
          : "flex items-start gap-3 rounded-xl border border-zinc-300 bg-white/70 p-3 text-sm"
      }
    >
      <span
        className={
          isDark
            ? "mt-0.5 inline-flex min-w-14 justify-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70"
            : "mt-0.5 inline-flex min-w-14 justify-center rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
        }
      >
        {time}
      </span>
      <p>{text}</p>
    </li>
  );
}

function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={
        isDark
          ? "rounded-xl border border-white/15 bg-zinc-950/95 px-3 py-2 text-xs text-white/85 shadow-xl"
          : "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-800 shadow-xl"
      }
    >
      {label ? <p className={isDark ? "mb-1 text-white/60" : "mb-1 text-zinc-600"}>{label}</p> : null}
      {payload.map((item) => (
        <p key={`${item.dataKey}-${item.name}`} className="font-medium" style={{ color: item.color || "#111" }}>
          {item.name || item.dataKey}: {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
        </p>
      ))}
    </div>
  );
}

function computeTrend(viewsByDay = []) {
  if (viewsByDay.length < 2) return { views: 0 };
  const first = viewsByDay[0]?.views ?? 0;
  const last = viewsByDay[viewsByDay.length - 1]?.views ?? 0;
  if (!first) return { views: 0 };
  return { views: Math.round(((last - first) / first) * 100) };
}

function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function formatActivityTime(value) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatActivityText(event = {}) {
  const type = String(event.type || "").trim();
  const title = String(event.title || "").trim();
  const category = String(event.category || "").trim();
  const path = String(event.path || "").trim();

  if (title && category) return `${title} (${category}).`;
  if (title) return `${title}.`;
  if (category && type) return `${type.replace("_", " ")} in ${category}.`;
  if (path && type) return `${type.replace("_", " ")} on ${path}.`;
  if (type) return `${type.replace("_", " ")} event recorded.`;
  return "Activity recorded.";
}
