"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Player } from "@/lib/types";

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("players").select("*").eq("id", user.id).maybeSingle();
      setPlayer(data as Player);
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof Player>(key: K, value: Player[K]) {
    setPlayer((p) => (p ? { ...p, [key]: value } : p));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!player) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("players")
      .update({
        height_inches: player.height_inches,
        hometown: player.hometown,
        high_school: player.high_school,
        club_team: player.club_team,
        gpa: player.gpa,
        bio: player.bio,
        stat_line: player.stat_line,
        highlight_url: player.highlight_url,
        contact_email: player.contact_email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", player.id);
    setSaving(false);
    setMessage(error ? error.message : "Saved.");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !player) return;
    setUploading(true);
    const path = `${player.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("headshots").upload(path, file, {
      upsert: true,
    });
    if (error) {
      setUploading(false);
      setMessage(error.message);
      return;
    }
    const { data } = supabase.storage.from("headshots").getPublicUrl(path);
    await supabase.from("players").update({ photo_url: data.publicUrl }).eq("id", player.id);
    set("photo_url", data.publicUrl);
    setUploading(false);
  }

  async function openBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else setMessage(error);
  }

  async function startCheckout() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else setMessage(error);
  }

  if (loading) return <div className="mx-auto max-w-2xl px-5 py-16 text-ink/50">Loading…</div>;
  if (!player) return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-ink/60">
      <p>No player profile found. <a href="/join" className="text-amber-700 font-medium">Create your profile →</a></p>
    </div>
  );

  const isActive = player.subscription_status === "active";

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      {checkoutSuccess && (
        <div className="mb-6 rounded-sm bg-court/10 border border-court/30 px-4 py-3 text-sm text-court font-medium">
          Payment successful! Fill in your stats and bio below to complete your profile.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">{player.full_name}</h1>
        <a
          href={`/players/${player.slug}`}
          className="text-sm text-amber-700 font-medium"
          target="_blank"
        >
          View public profile →
        </a>
      </div>

      {/* Subscription status banner */}
      <div
        className={`mt-6 border rounded-sm p-4 text-sm flex items-center justify-between ${
          isActive ? "border-court/40 bg-court/5" : "border-amber/40 bg-amber/10"
        }`}
      >
        <div>
          <p className="font-medium">
            {isActive ? "Your profile is live." : "Your profile is not published yet."}
          </p>
          <p className="text-ink/60 mt-0.5">
            {isActive
              ? "Coaches can find you in the directory. Manage or cancel your subscription any time."
              : "Subscribe to publish your profile in the directory."}
          </p>
        </div>
        <button
          onClick={isActive ? openBillingPortal : startCheckout}
          className="shrink-0 rounded-sm bg-ink text-paper px-4 py-2 text-sm font-medium"
        >
          {isActive ? "Manage billing" : "Subscribe — $9/mo"}
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs text-ink/50 mb-1">Headshot</label>
          <div className="flex items-center gap-4">
            {player.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo_url} alt="" className="h-16 w-16 rounded-sm object-cover" />
            )}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ink/50 mb-1">Height (inches)</label>
            <input
              type="number"
              value={player.height_inches ?? ""}
              onChange={(e) => set("height_inches", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1">GPA</label>
            <input
              type="number"
              step="0.01"
              value={player.gpa ?? ""}
              onChange={(e) => set("gpa", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-ink/50 mb-1">Hometown</label>
          <input
            value={player.hometown ?? ""}
            onChange={(e) => set("hometown", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">High school</label>
          <input
            value={player.high_school ?? ""}
            onChange={(e) => set("high_school", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Club / AAU team</label>
          <input
            value={player.club_team ?? ""}
            onChange={(e) => set("club_team", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">
            Stat line <span className="text-ink/40">(free text, e.g. "18.4 PPG / 6.1 RPG")</span>
          </label>
          <input
            value={player.stat_line ?? ""}
            onChange={(e) => set("stat_line", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">
            Highlight film URL <span className="text-ink/40">(YouTube, Hudl, or Vimeo link)</span>
          </label>
          <input
            value={player.highlight_url ?? ""}
            onChange={(e) => set("highlight_url", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Bio</label>
          <textarea
            rows={4}
            value={player.bio ?? ""}
            onChange={(e) => set("bio", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">
            Contact email <span className="text-ink/40">(shown only to logged-in coaches)</span>
          </label>
          <input
            value={player.contact_email ?? ""}
            onChange={(e) => set("contact_email", e.target.value)}
            className="w-full border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>

        {message && <p className="text-sm text-ink/70">{message}</p>}
        <button
          disabled={saving}
          className="rounded-sm bg-ink text-paper px-5 py-2.5 font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
