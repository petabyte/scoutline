"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function slugify(name: string, gradYear: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${gradYear}-${suffix}`;
}

export default function JoinPage() {
  const supabase = createClient();
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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError || !signUpData.user) {
      setLoading(false);
      return setError(signUpError?.message ?? "Could not create account.");
    }

    const slug = slugify(form.full_name, form.grad_year);
    const { error: insertError } = await supabase.from("players").insert({
      id: signUpData.user.id,
      slug,
      full_name: form.full_name,
      grad_year: Number(form.grad_year),
      position: form.position,
      contact_email: form.email,
      is_published: false,
      subscription_status: "inactive",
    });
    if (insertError) {
      setLoading(false);
      return setError(insertError.message);
    }

    // Kick off Stripe Checkout for the $9/mo subscription.
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url, error: checkoutError } = await res.json();
    setLoading(false);
    if (checkoutError || !url) {
      setError(checkoutError ?? "Could not start checkout.");
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
              {["2026", "2027", "2028", "2029"].map((y) => (
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
