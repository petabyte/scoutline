"use client";

import { useState } from "react";

export default function JoinPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    grad_year: "2027",
    position: "PG",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const { url, error: joinError } = await res.json();
    setLoading(false);
    if (joinError || !url) {
      setError(joinError ?? "Could not create account.");
      return;
    }
    window.location.href = url;
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">List your profile</h1>
      <p className="text-sm text-ink/60 mt-2">
        $9/mo, cancel anytime. You'll finish with Stripe on the next step, then land back
        here to fill in stats, film, and a photo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs text-ink/50 mb-1">Full name</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ink/50 mb-1">Grad year</label>
            <select
              value={form.grad_year}
              onChange={(e) => set("grad_year", e.target.value)}
              className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
            >
              {["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1">Position</label>
            <select
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
            >
              {["PG", "SG", "SF", "PF", "C"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-sm bg-ink text-paper px-5 py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? "Please wait…" : "Continue to payment"}
        </button>
        <p className="text-xs text-ink/50">
          Players under 18: have a parent or guardian complete signup and payment.
        </p>
      </form>
    </div>
  );
}
