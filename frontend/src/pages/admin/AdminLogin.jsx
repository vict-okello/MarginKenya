import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePageViewTracker from "../../hooks/usePageViewTracker";

export default function AdminLogin() {
  usePageViewTracker();

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      // Ensure adminUser always has role
      const admin = data.admin || {};
      const role = admin.role || "writer";

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify({ ...admin, role }));

      // So you can confirm immediately (open DevTools console)
      console.log("Logged in as role:", role);

      const nextPath = location.state?.from || "/admin";
      navigate(nextPath, { replace: true });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">MarginKenya Admins</h1>
      <p className="mt-2 text-sm text-zinc-600">Sign in to access the dashboard analytics.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
            placeholder="********"
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}