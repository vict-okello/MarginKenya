import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import usePageViewTracker from "../hooks/usePageViewTracker";

const THEME_KEY = "admin_dashboard_theme";

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function joinUrl(base, path) {
  const b = String(base || "").replace(/\/$/, "");
  const p = String(path || "");
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/hero", label: "Hero", icon: "hero" },
  { to: "/admin/world", label: "World", icon: "world" },
  { to: "/admin/latest-news", label: "Latest News", icon: "latest-news" },
  { to: "/admin/resources", label: "Resources", icon: "resources" },
  { to: "/admin/technology", label: "Technology", icon: "technology" },
  { to: "/admin/health", label: "Health", icon: "health" },
  { to: "/admin/business", label: "Business", icon: "business" },
  { to: "/admin/politics", label: "Politics", icon: "politics" },
  { to: "/admin/culture", label: "Culture", icon: "culture" },
  { to: "/admin/sports", label: "Sports", icon: "sports" },
  { to: "/admin/podcast", label: "Podcast", icon: "podcast" },
  { to: "/admin/newsletter", label: "Newsletter", icon: "newsletter" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminLayout() {
  usePageViewTracker();

  const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");
  const [settingsAvatar, setSettingsAvatar] = useState("");
  const [siteName, setSiteName] = useState("MarginKenya");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const items = navRef.current?.querySelectorAll("[data-nav-item]");
    if (!items?.length) return;

    items.forEach((item, index) => {
      item.animate(
        [
          { opacity: 0, transform: "translateX(-10px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        {
          duration: 260,
          delay: index * 45,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        }
      );
    });
  }, []);

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
        const img = String(data?.adminDashboard?.profileImage || "");
        const brandingName = String(data?.branding?.siteName || "MarginKenya");
        if (alive) setSettingsAvatar(img);
        if (alive) setSiteName(brandingName);
      } catch {
        // Keep fallback avatar.
      }
    })();

    return () => {
      alive = false;
    };
  }, [API]);

  const adminUser = safeJsonParse(localStorage.getItem("adminUser"), null);
  const roleText = String(adminUser?.role || "editor").replaceAll("_", " ");
  const admin = {
    name: adminUser?.email ? String(adminUser.email).split("@")[0] : "Admin",
    role: roleText.charAt(0).toUpperCase() + roleText.slice(1),
    avatarUrl: settingsAvatar
      ? joinUrl(API, settingsAvatar)
      : "https://api.dicebear.com/9.x/thumbs/svg?seed=VeloraAdmin",
  };

  return (
    <div className={["min-h-screen transition-colors", isDark ? "bg-zinc-950 text-zinc-100" : "bg-[#d8d8dc] text-zinc-900"].join(" ")}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside
          className={[
            "border-b p-4 md:min-h-screen md:border-b-0 md:border-r transition-colors",
            isDark ? "border-white/10 bg-zinc-950/80" : "border-zinc-300 bg-white/70",
          ].join(" ")}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide">{siteName} Admin Panel</p>
              <p className={["text-xs", isDark ? "text-white/60" : "text-zinc-600"].join(" ")}>Content & Analytics</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDark((v) => !v)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                isDark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
              ].join(" ")}
            >
              {isDark ? "Dark" : "Light"}
            </button>
          </div>

          <div
            className={[
              "mb-6 flex items-center gap-3 rounded-2xl border p-3",
              isDark ? "border-white/10 bg-white/5" : "border-zinc-300 bg-white/80",
            ].join(" ")}
          >
            <img
              src={admin.avatarUrl}
              alt="Admin avatar"
              className={["h-10 w-10 rounded-full border", isDark ? "border-white/10" : "border-zinc-300"].join(" ")}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{admin.name}</p>
              <p className={["text-xs", isDark ? "text-white/60" : "text-zinc-600"].join(" ")}>{admin.role}</p>
            </div>
          </div>

          <nav ref={navRef} className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                data-nav-item
                className={({ isActive }) =>
                  [
                    "group block rounded-xl px-3 py-2 text-sm transition duration-200",
                    isActive
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-zinc-900 text-white"
                      : isDark
                        ? "text-white/70 hover:bg-white/5 hover:text-white"
                        : "text-zinc-700 hover:bg-white hover:text-zinc-900",
                  ].join(" ")
                }
              >
                <span className="flex items-center gap-2.5">
                  <span className="transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                </span>
              </NavLink>
            ))}
          </nav>

        </aside>

        {/* Main */}
        <main className="p-4 md:p-6">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  );
}

function NavIcon({ name }) {
  const common = {
    className: "h-4 w-4 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
        </svg>
      );
    case "hero":
      return (
        <svg {...common}>
          <path d="M12 3l2.7 5.5L21 9.3l-4.5 4.3L17.6 20 12 17.1 6.4 20l1.1-6.4L3 9.3l6.3-.8L12 3z" />
        </svg>
      );
    case "world":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      );
    case "latest-news":
      return (
        <svg {...common}>
          <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "resources":
      return (
        <svg {...common}>
          <path d="M4 6a2 2 0 0 1 2-2h8l6 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
          <path d="M14 4v6h6" />
        </svg>
      );
    case "technology":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M9 19h6M12 16v3" />
        </svg>
      );
    case "health":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </svg>
      );
    case "business":
      return (
        <svg {...common}>
          <path d="M4 20V8m5 12V4m5 16v-9m5 9V6" />
          <path d="M3 20h18" />
        </svg>
      );
    case "politics":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6 20V8l6-4 6 4v12" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "culture":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
        </svg>
      );
    case "sports":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8 8c2 2 6 2 8 0M8 16c2-2 6-2 8 0M12 4v16" />
        </svg>
      );
    case "podcast":
      return (
        <svg {...common}>
          <path d="M12 17a3 3 0 0 0 3-3V9a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
          <path d="M7 10a5 5 0 0 1 10 0M5 10a7 7 0 0 1 14 0M12 17v4" />
        </svg>
      );
    case "newsletter":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 8l9 6 9-6" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.1 1.1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.1-1.1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4L5.9 4a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2H8.6a1 1 0 0 0 .6-.9V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6V15z" />
        </svg>
      );
    default:
      return null;
  }
}
