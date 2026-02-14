import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function formatK(n) {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function StatCard({ title, value, sub, tone = "neutral" }) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-500/25 bg-emerald-50"
      : tone === "negative"
      ? "border-red-500/25 bg-red-50"
      : "border-zinc-300 bg-white";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-zinc-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-600">{sub}</p> : null}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border border-zinc-300 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-zinc-900">{label}</p>
      <p className="text-xs text-zinc-600">
        New subscribers: <span className="font-semibold text-zinc-900">{value}</span>
      </p>
    </div>
  );
}

export default function AdminNewsletter() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = adminUser?.role || "writer";
  const canView = role === "editor" || role === "super_admin";

  useEffect(() => {
    if (!token) navigate("/admin-login", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (token && !canView) navigate("/admin", { replace: true });
  }, [token, canView, navigate]);

  const [days, setDays] = useState(30);
  const [chartMode, setChartMode] = useState("area");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [emails, setEmails] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  async function loadStats() {
    if (!canView) return;

    if (!API) {
      setError("VITE_API_URL is missing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/subscribers/stats?days=${days}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 || res.status === 403) {
        setError("Not authorized.");
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load newsletter stats");
      setStats(json);
    } catch (e) {
      setError(e?.message || "Failed to load newsletter stats");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmails(targetPage = 1, targetSearch = search) {
    if (!canView) return;
    if (!API) return;
    if (!token) return;

    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(pageSize),
      });
      if (targetSearch.trim()) params.set("q", targetSearch.trim());

      const res = await fetch(`${API}/api/subscribers/list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError("Not authorized.");
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load subscribers list");

      setEmails(Array.isArray(json?.items) ? json.items : []);
      setTotalEmails(Number(json?.total || 0));
      setTotalPages(Number(json?.totalPages || 1));
      setPage(Number(json?.page || targetPage));
    } catch (e) {
      setError(e?.message || "Failed to load subscribers list");
    } finally {
      setLoadingList(false);
    }
  }

  async function exportSubscribers() {
    if (!canView) return;

    if (!API) {
      setError("VITE_API_URL is missing.");
      return;
    }
    if (!token) {
      setError("Missing admin token. Please login again.");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`${API}/api/subscribers/export.csv?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError("Not authorized.");
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || "Failed to export subscribers");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "Failed to export subscribers");
    }
  }

  useEffect(() => {
    if (!canView) return;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, API, canView]);

  useEffect(() => {
    if (!canView) return;
    loadEmails(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, search, canView]);

  const series = useMemo(() => {
    const raw = Array.isArray(stats?.series) ? stats.series : [];
    return raw.map((row) => ({
      ...row,
      label: String(row?.date || "").slice(5),
      newSubs: Number(row?.newSubs || 0),
    }));
  }, [stats]);

  const totals = useMemo(() => {
    const total = series.reduce((sum, row) => sum + row.newSubs, 0);
    const avg = series.length ? total / series.length : 0;
    const peak = series.reduce((m, row) => Math.max(m, row.newSubs), 0);
    const today = series[series.length - 1]?.newSubs || 0;
    return { total, avg, peak, today };
  }, [series]);

  const growth = useMemo(() => {
    const pct = Number(stats?.growthPct || 0);
    return {
      value: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`,
      tone: pct > 0 ? "positive" : pct < 0 ? "negative" : "neutral",
      sub: "Compared with previous 7 days",
    };
  }, [stats]);

  const barsWindow = useMemo(() => {
    return series.length > 14 ? series.slice(series.length - 14) : series;
  }, [series]);

  const insight = useMemo(() => {
    if (!series.length) return "No trend data yet.";
    if (totals.today > totals.avg * 1.25) return "Today is above your average signup rate.";
    if (totals.today < totals.avg * 0.75) return "Today is below your average signup rate.";
    return "Today is near your average signup rate.";
  }, [series, totals.today, totals.avg]);

  if (!token || !canView) return null;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-zinc-900 md:text-4xl">
              Newsletter
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Monitor subscriber growth and newsletter momentum.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
            >
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard title="Total Subscribers" value={stats ? formatK(stats.totalSubscribers) : "-"} sub="All time" />
        <StatCard
          title="New In Range"
          value={stats ? formatK(stats.newSubscribersInRange) : "-"}
          sub={`Last ${days} days`}
        />
        <StatCard title="Last 7 Days" value={stats ? formatK(stats.last7) : "-"} sub="Current weekly window" />
        <StatCard title="Growth" value={stats ? growth.value : "-"} sub={growth.sub} tone={growth.tone} />
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Daily New Subscribers</h2>
            <p className="mt-1 text-xs text-zinc-600">{insight}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChartMode("area")}
              className={`h-9 rounded-lg border px-3 text-sm ${
                chartMode === "area"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-900"
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartMode("bar")}
              className={`h-9 rounded-lg border px-3 text-sm ${
                chartMode === "bar"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-900"
              }`}
            >
              Bars
            </button>
          </div>
        </div>

        <div className="mt-3 h-[330px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === "area" ? (
              <AreaChart data={series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#52525b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#52525b" }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="newSubs"
                  stroke="#18181b"
                  fill="#18181b"
                  fillOpacity={0.18}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <BarChart data={barsWindow} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#52525b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#52525b" }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="newSubs" radius={[8, 8, 0, 0]} fill="#18181b" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 sm:grid-cols-3">
          <p>
            Range total: <span className="font-semibold text-zinc-900">{formatK(totals.total)}</span>
          </p>
          <p>
            Avg/day: <span className="font-semibold text-zinc-900">{totals.avg.toFixed(1)}</span>
          </p>
          <p>
            Peak/day: <span className="font-semibold text-zinc-900">{totals.peak}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Subscriber Emails</h2>
            <p className="mt-1 text-xs text-zinc-600">
              {totalEmails} total {search ? `for "${search}"` : "subscribers"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(query.trim());
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email..."
                className="h-10 w-56 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
              />
              <button
                type="submit"
                className="h-10 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={exportSubscribers}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-700">
              <tr>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Source</th>
                <th className="px-3 py-2 font-semibold">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {loadingList ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-zinc-500">
                    Loading subscribers...
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-zinc-500">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                emails.map((item) => (
                  <tr key={`${item.email}-${item.createdAt}`} className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-zinc-900">{item.email}</td>
                    <td className="px-3 py-2 text-zinc-700">{item.source || "website"}</td>
                    <td className="px-3 py-2 text-zinc-700">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
          <p>
            Page {page} of {Math.max(1, totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loadingList}
              onClick={() => loadEmails(page - 1, search)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loadingList}
              onClick={() => loadEmails(page + 1, search)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}