"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "coach-signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgFields, setOrgFields] = useState({ full_name: "", organization: "", role: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleCoachSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }
    if (data.user) {
      await supabase.from("coaches").insert({
        id: data.user.id,
        full_name: orgFields.full_name,
        organization: orgFields.organization,
        role: orgFields.role,
      });
    }
    setLoading(false);
    router.push("/players");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">
        {mode === "signin" ? "Log in" : "Coach / scout sign up"}
      </h1>
      <p className="text-sm text-ink/60 mt-2">
        {mode === "signin"
          ? "Players and coaches both log in here."
          : "Free account — see contact info and save players you're tracking."}
      </p>

      <form
        onSubmit={mode === "signin" ? handleSignIn : handleCoachSignup}
        className="mt-6 space-y-4"
      >
        {mode === "coach-signup" && (
          <>
            <div>
              <label className="block text-xs text-ink/50 mb-1">Full name</label>
              <input
                required
                value={orgFields.full_name}
                onChange={(e) => setOrgFields({ ...orgFields, full_name: e.target.value })}
                className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1">School / organization</label>
              <input
                required
                value={orgFields.organization}
                onChange={(e) => setOrgFields({ ...orgFields, organization: e.target.value })}
                className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1">Role</label>
              <input
                placeholder="Head Coach, Recruiting Coordinator, etc."
                value={orgFields.role}
                onChange={(e) => setOrgFields({ ...orgFields, role: e.target.value })}
                className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-xs text-ink/50 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-sm bg-ink text-paper px-5 py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Create free account"}
        </button>
      </form>

      <div className="mt-6 text-sm text-ink/60 space-y-1">
        {mode === "signin" ? (
          <>
            <p>
              Coach or scout, new here?{" "}
              <button onClick={() => setMode("coach-signup")} className="text-amber-700 font-medium">
                Create a free account
              </button>
            </p>
            <p>
              Player, new here?{" "}
              <a href="/join" className="text-amber-700 font-medium">
                List your profile
              </a>
            </p>
          </>
        ) : (
          <button onClick={() => setMode("signin")} className="text-amber-700 font-medium">
            ← Back to log in
          </button>
        )}
      </div>
    </div>
  );
}
