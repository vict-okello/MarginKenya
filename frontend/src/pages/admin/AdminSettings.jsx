import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function isImageFile(file) {
  return file && typeof file.type === "string" && file.type.startsWith("image/");
}

function fileSizeMb(file) {
  if (!file?.size) return 0;
  return file.size / (1024 * 1024);
}

export default function AdminBrandingSettings() {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  const adminUser = useMemo(() => {
    return safeJsonParse(localStorage.getItem("adminUser"), null);
  }, []);

  const role = adminUser?.role || "";
  const isSuperAdmin = role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("writer");
  const [inviteError, setInviteError] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [dashboardSaving, setDashboardSaving] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [teamUsers, setTeamUsers] = useState([]);
  const [usersActionId, setUsersActionId] = useState("");
  const [openBasic, setOpenBasic] = useState(true);
  const [openDashboardAppearance, setOpenDashboardAppearance] = useState(true);
  const [openInvites, setOpenInvites] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);

  const [initial, setInitial] = useState(null);
  const [dashboardInitial, setDashboardInitial] = useState(null);

  const [siteName, setSiteName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [ogFile, setOgFile] = useState(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [clearFavicon, setClearFavicon] = useState(false);
  const [clearOg, setClearOg] = useState(false);

  const [_logoPreview, setLogoPreview] = useState("");
  const [_faviconPreview, setFaviconPreview] = useState("");
  const [_ogPreview, setOgPreview] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [dashboardSubtitle, setDashboardSubtitle] = useState("");
  const [dashboardColorFrom, setDashboardColorFrom] = useState("#ffffff");
  const [dashboardColorTo, setDashboardColorTo] = useState("#e4e4e7");
  const [dashboardProfileFile, setDashboardProfileFile] = useState(null);
  const [dashboardProfilePreview, setDashboardProfilePreview] = useState("");
  const [clearDashboardProfile, setClearDashboardProfile] = useState(false);

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const ogInputRef = useRef(null);
  const dashboardProfileInputRef = useRef(null);

  useEffect(() => {
    if (!token) navigate("/admin-login", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (token && !isSuperAdmin) navigate("/admin", { replace: true });
  }, [token, isSuperAdmin, navigate]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!token || !isSuperAdmin) return;

        setError("");
        setNotice("");
        setLoading(true);

        const res = await fetch(`${API}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate("/admin-login", { replace: true });
          return;
        }

        const data = await res.json().catch(() => null);
        const branding = data?.branding || {};
        const dashboard = data?.adminDashboard || {};

        if (!alive) return;

        const normalized = {
          siteName: String(branding.siteName || "MarginKenya"),
          logo: String(branding.logo || ""),
          favicon: String(branding.favicon || ""),
          defaultOgImage: String(branding.defaultOgImage || ""),
        };

        setInitial(normalized);
        setSiteName(normalized.siteName);
        const normalizedDashboard = {
          title: String(dashboard.title || "Editorial Command Center"),
          subtitle: String(dashboard.subtitle || "Site-aligned dashboard with live metrics and quick editorial controls."),
          headerColorFrom: String(dashboard.headerColorFrom || "#ffffff"),
          headerColorTo: String(dashboard.headerColorTo || "#e4e4e7"),
          profileImage: String(dashboard.profileImage || ""),
        };

        setDashboardInitial(normalizedDashboard);
        setDashboardTitle(normalizedDashboard.title);
        setDashboardSubtitle(normalizedDashboard.subtitle);
        setDashboardColorFrom(normalizedDashboard.headerColorFrom);
        setDashboardColorTo(normalizedDashboard.headerColorTo);

        setLogoPreview(joinUrl(API, normalized.logo));
        setFaviconPreview(joinUrl(API, normalized.favicon));
        setOgPreview(joinUrl(API, normalized.defaultOgImage));
        setDashboardProfilePreview(joinUrl(API, normalizedDashboard.profileImage));
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load settings.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [API, token, isSuperAdmin, navigate]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!faviconFile) return;
    const url = URL.createObjectURL(faviconFile);
    setFaviconPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [faviconFile]);

  useEffect(() => {
    if (!ogFile) return;
    const url = URL.createObjectURL(ogFile);
    setOgPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [ogFile]);

  useEffect(() => {
    if (!dashboardProfileFile) return;
    const url = URL.createObjectURL(dashboardProfileFile);
    setDashboardProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [dashboardProfileFile]);

  const loadTeamUsers = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    try {
      setUsersLoading(true);
      setUsersError("");
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load admin users.");
      }

      setTeamUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e) {
      setUsersError(e?.message || "Failed to load admin users.");
    } finally {
      setUsersLoading(false);
    }
  }, [API, token, isSuperAdmin]);

  async function onToggleUserAccess(user, enabled) {
    if (!user?.id || !user?.canManage) return;
    try {
      setUsersActionId(user.id);
      setUsersError("");
      const res = await fetch(`${API}/api/admin/users/${user.id}/access`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update user access.");
      }

      await loadTeamUsers();
    } catch (e) {
      setUsersError(e?.message || "Failed to update user access.");
    } finally {
      setUsersActionId("");
    }
  }

  async function onDeleteUser(user) {
    if (!user?.id || !user?.canManage) return;
    const ok = window.confirm(`Delete ${user.email}? This cannot be undone.`);
    if (!ok) return;

    try {
      setUsersActionId(user.id);
      setUsersError("");
      const res = await fetch(`${API}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete user.");
      }

      await loadTeamUsers();
    } catch (e) {
      setUsersError(e?.message || "Failed to delete user.");
    } finally {
      setUsersActionId("");
    }
  }

  useEffect(() => {
    loadTeamUsers();
  }, [loadTeamUsers]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    const nameChanged = siteName.trim() !== initial.siteName;
    const anyFile = Boolean(logoFile || faviconFile || ogFile);
    const anyClear = Boolean(clearLogo || clearFavicon || clearOg);
    return nameChanged || anyFile || anyClear;
  }, [initial, siteName, logoFile, faviconFile, ogFile, clearLogo, clearFavicon, clearOg]);

  const dashboardDirty = useMemo(() => {
    if (!dashboardInitial) return false;
    const textChanged =
      dashboardTitle.trim() !== dashboardInitial.title ||
      dashboardSubtitle.trim() !== dashboardInitial.subtitle ||
      dashboardColorFrom !== dashboardInitial.headerColorFrom ||
      dashboardColorTo !== dashboardInitial.headerColorTo;
    const filesChanged = Boolean(dashboardProfileFile);
    const clearChanged = Boolean(clearDashboardProfile);
    return textChanged || filesChanged || clearChanged;
  }, [
    dashboardInitial,
    dashboardTitle,
    dashboardSubtitle,
    dashboardColorFrom,
    dashboardColorTo,
    dashboardProfileFile,
    clearDashboardProfile,
  ]);

  function validate() {
    const name = siteName.trim();
    if (!name) return "Site name is required.";
    if (name.length > 60) return "Site name must be 60 characters or less.";

    const files = [
      { file: logoFile, label: "Logo" },
      { file: faviconFile, label: "Favicon" },
      { file: ogFile, label: "Default OG image" },
    ];

    for (const item of files) {
      if (!item.file) continue;
      if (!isImageFile(item.file)) return `${item.label} must be an image file.`;
      if (fileSizeMb(item.file) > 3) return `${item.label} must be 3MB or smaller.`;
    }
    return "";
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!token || !isSuperAdmin) {
      setError("Not authorized.");
      return;
    }

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    if (!dirty) {
      setNotice("No changes to save.");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("siteName", siteName.trim());
      if (logoFile) fd.append("logo", logoFile);
      if (faviconFile) fd.append("favicon", faviconFile);
      if (ogFile) fd.append("defaultOgImage", ogFile);
      if (clearLogo) fd.append("clearLogo", "1");
      if (clearFavicon) fd.append("clearFavicon", "1");
      if (clearOg) fd.append("clearDefaultOgImage", "1");

      const res = await fetch(`${API}/api/settings/branding`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save branding.");
      }

      const updated = {
        siteName: String(data.siteName || siteName.trim()),
        logo: String(data.logo || ""),
        favicon: String(data.favicon || ""),
        defaultOgImage: String(data.defaultOgImage || ""),
      };

      setInitial(updated);
      setSiteName(updated.siteName);

      setLogoFile(null);
      setFaviconFile(null);
      setOgFile(null);
      setClearLogo(false);
      setClearFavicon(false);
      setClearOg(false);

      setLogoPreview(joinUrl(API, updated.logo));
      setFaviconPreview(joinUrl(API, updated.favicon));
      setOgPreview(joinUrl(API, updated.defaultOgImage));

      setNotice("Branding updated successfully.");
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    if (!initial) return;
    setError("");
    setNotice("");

    setSiteName(initial.siteName);
    setLogoFile(null);
    setFaviconFile(null);
    setOgFile(null);
    setClearLogo(false);
    setClearFavicon(false);
    setClearOg(false);

    setLogoPreview(joinUrl(API, initial.logo));
    setFaviconPreview(joinUrl(API, initial.favicon));
    setOgPreview(joinUrl(API, initial.defaultOgImage));

    if (logoInputRef.current) logoInputRef.current.value = "";
    if (faviconInputRef.current) faviconInputRef.current.value = "";
    if (ogInputRef.current) ogInputRef.current.value = "";
  }

  async function onSaveDashboard(e) {
    e.preventDefault();
    setDashboardError("");
    setDashboardNotice("");

    if (!token || !isSuperAdmin) {
      setDashboardError("Not authorized.");
      return;
    }

    const title = dashboardTitle.trim();
    const subtitle = dashboardSubtitle.trim();

    if (!title) {
      setDashboardError("Dashboard title is required.");
      return;
    }
    if (title.length > 80) {
      setDashboardError("Dashboard title must be 80 characters or less.");
      return;
    }
    if (subtitle.length > 180) {
      setDashboardError("Dashboard subtitle must be 180 characters or less.");
      return;
    }

    if (!dashboardDirty) {
      setDashboardNotice("No dashboard changes to save.");
      return;
    }

    try {
      setDashboardSaving(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("subtitle", subtitle);
      fd.append("headerColorFrom", dashboardColorFrom);
      fd.append("headerColorTo", dashboardColorTo);
      if (dashboardProfileFile) fd.append("profileImage", dashboardProfileFile);
      if (clearDashboardProfile) fd.append("clearProfileImage", "1");

      const res = await fetch(`${API}/api/settings/dashboard`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save dashboard settings.");
      }

      const updated = {
        title: String(data.title || title),
        subtitle: String(data.subtitle || subtitle),
        headerColorFrom: String(data.headerColorFrom || dashboardColorFrom),
        headerColorTo: String(data.headerColorTo || dashboardColorTo),
        profileImage: String(data.profileImage || ""),
      };

      setDashboardInitial(updated);
      setDashboardTitle(updated.title);
      setDashboardSubtitle(updated.subtitle);
      setDashboardColorFrom(updated.headerColorFrom);
      setDashboardColorTo(updated.headerColorTo);
      setDashboardProfileFile(null);
      setClearDashboardProfile(false);
      setDashboardProfilePreview(joinUrl(API, updated.profileImage));
      if (dashboardProfileInputRef.current) dashboardProfileInputRef.current.value = "";
      setDashboardNotice("Admin dashboard settings updated.");
    } catch (e2) {
      setDashboardError(e2?.message || "Failed to save dashboard settings.");
    } finally {
      setDashboardSaving(false);
    }
  }

  function onResetDashboard() {
    if (!dashboardInitial) return;
    setDashboardError("");
    setDashboardNotice("");
    setDashboardTitle(dashboardInitial.title);
    setDashboardSubtitle(dashboardInitial.subtitle);
    setDashboardColorFrom(dashboardInitial.headerColorFrom);
    setDashboardColorTo(dashboardInitial.headerColorTo);
    setDashboardProfileFile(null);
    setClearDashboardProfile(false);
    setDashboardProfilePreview(joinUrl(API, dashboardInitial.profileImage));
    if (dashboardProfileInputRef.current) dashboardProfileInputRef.current.value = "";
  }

  async function onSendInvite(e) {
    e.preventDefault();
    setInviteError("");
    setInviteNotice("");
    setInviteUrl("");

    if (!token || !isSuperAdmin) {
      setInviteError("Not authorized.");
      return;
    }

    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();

    if (!name || !email) {
      setInviteError("Name and email are required.");
      return;
    }

    try {
      setInviting(true);

      const res = await fetch(`${API}/api/admin/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role: inviteRole }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create invite.");
      }

      const createdUrl = String(data?.inviteUrl || "");
      const sent = Boolean(data?.emailSent);
      const emailError = String(data?.emailError || "").trim();

      setInviteUrl(createdUrl);
      setInviteNotice(
        sent
          ? "Invite link created and email sent."
          : `Invite created, but email was not sent. ${emailError ? `Reason: ${emailError}. ` : ""}Share the link manually.`
      );
      setInviteName("");
      setInviteEmail("");
      setInviteRole("writer");
      await loadTeamUsers();
    } catch (e2) {
      setInviteError(e2?.message || "Failed to create invite.");
    } finally {
      setInviting(false);
    }
  }

  if (!token) return null;
  if (!isSuperAdmin) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <header className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
        <h1 className="text-xl font-semibold text-zinc-900">Site Branding</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Update site identity assets. Changes apply across the whole website.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-zinc-300 bg-white/70 p-5 text-sm text-zinc-600">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          <section className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">Basic</h2>
              <button
                type="button"
                onClick={() => setOpenBasic((v) => !v)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                {openBasic ? "Collapse" : "Expand"}
              </button>
            </div>

            {openBasic ? (
              <>
                <label className="mt-3 block text-sm font-medium text-zinc-800" htmlFor="siteName">
                  Site name
                </label>
                <input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                  placeholder="MarginKenya"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-zinc-500">{siteName.trim().length}/60</p>
              </>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">Admin Dashboard Appearance</h2>
              <button
                type="button"
                onClick={() => setOpenDashboardAppearance((v) => !v)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                {openDashboardAppearance ? "Collapse" : "Expand"}
              </button>
            </div>

            {openDashboardAppearance ? (
              <>
                <p className="mt-1 text-xs text-zinc-600">
                  These settings only affect the Admin Dashboard header colors and profile image.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-800" htmlFor="dashboardTitle">
                  Dashboard title
                </label>
                <input
                  id="dashboardTitle"
                  value={dashboardTitle}
                  onChange={(e) => setDashboardTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-800" htmlFor="dashboardSubtitle">
                  Dashboard subtitle
                </label>
                <input
                  id="dashboardSubtitle"
                  value={dashboardSubtitle}
                  onChange={(e) => setDashboardSubtitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                  maxLength={180}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-800" htmlFor="dashboardColorFrom">
                  Header color (start)
                </label>
                <input
                  id="dashboardColorFrom"
                  type="color"
                  value={dashboardColorFrom}
                  onChange={(e) => setDashboardColorFrom(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-800" htmlFor="dashboardColorTo">
                  Header color (end)
                </label>
                <input
                  id="dashboardColorTo"
                  type="color"
                  value={dashboardColorTo}
                  onChange={(e) => setDashboardColorTo(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-2"
                />
              </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UploadCard
                    title="Profile Image"
                    subtitle="Shown near logout"
                    previewUrl={dashboardProfilePreview}
                    onPick={() => dashboardProfileInputRef.current?.click()}
                    onClear={() => {
                      setDashboardProfileFile(null);
                      setClearDashboardProfile(true);
                      setDashboardProfilePreview("");
                      if (dashboardProfileInputRef.current) dashboardProfileInputRef.current.value = "";
                    }}
                    hasFile={Boolean(dashboardProfileFile || clearDashboardProfile)}
                  />
                </div>

                <input
                  ref={dashboardProfileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setDashboardProfileFile(e.target.files?.[0] || null);
                    setClearDashboardProfile(false);
                  }}
                />

                {(dashboardError || dashboardNotice) && (
                  <div
                    className={[
                      "mt-3 rounded-2xl border px-4 py-3 text-sm",
                      dashboardError
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                  >
                    {dashboardError || dashboardNotice}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={onResetDashboard}
                    disabled={dashboardSaving || !dashboardDirty}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset dashboard
                  </button>
                  <button
                    type="button"
                    onClick={onSaveDashboard}
                    disabled={dashboardSaving || !dashboardDirty}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {dashboardSaving ? "Saving..." : "Save dashboard"}
                  </button>
                </div>
              </>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">Invite Admin User</h2>
              <button
                type="button"
                onClick={() => setOpenInvites((v) => !v)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                {openInvites ? "Collapse" : "Expand"}
              </button>
            </div>
            {openInvites ? (
              <>
                <p className="mt-1 text-xs text-zinc-600">
                  Create a one-time invite link for a new editor or writer.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              />
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              >
                <option value="writer">Writer</option>
                <option value="editor">Editor</option>
              </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onSendInvite}
                    disabled={inviting}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {inviting ? "Creating..." : "Create invite link"}
                  </button>
                </div>

                {(inviteError || inviteNotice) && (
                  <div
                    className={[
                      "mt-3 rounded-2xl border px-4 py-3 text-sm",
                      inviteError
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                  >
                    {inviteError || inviteNotice}
                  </div>
                )}

                {inviteUrl && (
                  <div className="mt-3 rounded-2xl border border-zinc-300 bg-white p-3">
                    <p className="text-xs font-medium text-zinc-700">Invite URL</p>
                    <div className="mt-2 flex flex-col gap-2 md:flex-row">
                      <input
                        readOnly
                        value={inviteUrl}
                        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(inviteUrl)}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-300 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Editors & Writers</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  All invited and active editor/writer accounts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenUsers((v) => !v)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
                >
                  {openUsers ? "Collapse" : "Expand"}
                </button>
                <button
                  type="button"
                  onClick={loadTeamUsers}
                  disabled={usersLoading}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {usersLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {openUsers && usersError && (
              <div className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {usersError}
              </div>
            )}

            {openUsers && !usersError && usersLoading ? (
              <div className="mt-3 rounded-2xl border border-zinc-300 bg-white p-4 text-sm text-zinc-600">
                Loading users...
              </div>
            ) : null}

            {openUsers && !usersError && !usersLoading && teamUsers.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-zinc-300 bg-white p-4 text-sm text-zinc-600">
                No editor or writer users yet.
              </div>
            ) : null}

            {openUsers && !usersError && !usersLoading && teamUsers.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-300 bg-white">
                <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Source</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {teamUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 border-t border-zinc-100 px-3 py-2 text-sm text-zinc-800"
                  >
                    <div className="col-span-3 truncate">{user.name || "-"}</div>
                    <div className="col-span-2 truncate">{user.email || "-"}</div>
                    <div className="col-span-2 capitalize">{user.role || "-"}</div>
                    <div className="col-span-2 capitalize">{user.status || "-"}</div>
                    <div className="col-span-1 capitalize text-xs text-zinc-600">{user.source || "-"}</div>
                    <div className="col-span-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleUserAccess(user, user.status === "disabled")}
                        disabled={usersActionId === user.id || !user.canManage}
                        className={[
                          "rounded-lg border px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                          user.status === "disabled"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
                        ].join(" ")}
                      >
                        {usersActionId === user.id
                          ? "Updating..."
                          : user.status === "disabled"
                            ? "Restore"
                            : "Revoke"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        disabled={usersActionId === user.id || !user.canManage}
                        className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {!user.canManage ? "Managed in .env" : usersActionId === user.id ? "Updating..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {(error || notice) && (
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm",
                error
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {error || notice}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={saving || !dirty}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={saving || !dirty}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function UploadCard({ title, subtitle, previewUrl, onPick, onClear, hasFile }) {
  return (
    <div className="rounded-2xl border border-zinc-300 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <p className="mt-0.5 text-xs text-zinc-600">{subtitle}</p>
        </div>

        {hasFile ? (
          <span className="rounded-full bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white">
            Selected
          </span>
        ) : (
          <span className="rounded-full border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-700">
            Current
          </span>
        )}
      </div>

      <div className="mt-3 flex h-24 items-center justify-center overflow-hidden rounded-xl border border-zinc-300">
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="h-full w-full rounded-lg border border-zinc-300 object-contain" />
        ) : (
          <p className="text-xs text-zinc-500">No image</p>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onPick}
          className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Upload
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
