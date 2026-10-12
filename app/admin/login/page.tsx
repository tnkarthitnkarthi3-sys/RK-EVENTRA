
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "Admin login failed.");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        setMessage("Only administrators can access this page.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-6">

      <div className="w-full max-w-md rounded-3xl border border-yellow-400/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-4xl shadow-xl">
            👑
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            RK EVENTRA
          </h1>

          <p className="mt-2 font-semibold text-yellow-300">
            Administrator Login
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Authorized administrators only
          </p>

        </div>

        <form
          onSubmit={handleAdminLogin}
          className="mt-8 space-y-5"
        >

          <div>
            <label className="mb-2 block font-semibold text-white">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rkeventra.com"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Admin Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 font-bold text-gray-950 shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "👑 Admin Login"}
          </button>

        </form>

        {message && (
          <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-center font-semibold text-red-300">
            {message}
          </p>
        )}

        <a
          href="/login"
          className="mt-6 block text-center font-semibold text-gray-400 hover:text-white"
        >
          ← Back to User Login
        </a>

      </div>
    </main>
  );
}
