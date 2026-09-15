"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel({ initialLists, players }: { initialLists: any[]; players: any[] }) {
  const router = useRouter();
  const [newList, setNewList] = useState({ title: "", slug: "", description: "" });
  const [itemForm, setItemForm] = useState<Record<string, { player_slug: string; rank: string; note: string }>>({});

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/lists", { method: "POST", body: JSON.stringify(newList) });
    setNewList({ title: "", slug: "", description: "" });
    router.refresh();
  }

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/admin/lists/${id}`, { method: "PATCH", body: JSON.stringify({ published: !published }) });
    router.refresh();
  }

  async function addItem(listId: string) {
    const form = itemForm[listId];
    if (!form?.player_slug || !form?.rank) return;
    await fetch(`/api/admin/lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify({ player_slug: form.player_slug, rank: Number(form.rank), note: form.note }),
    });
    setItemForm({ ...itemForm, [listId]: { player_slug: "", rank: "", note: "" } });
    router.refresh();
  }

  async function removeItem(listId: string, playerId: string) {
    await fetch(`/api/admin/lists/${listId}/items`, {
      method: "DELETE",
      body: JSON.stringify({ player_id: playerId }),
    });
    router.refresh();
  }

  async function toggleVerify(playerId: string, isVerified: boolean) {
    await fetch("/api/admin/verify", {
      method: "POST",
      body: JSON.stringify({ player_id: playerId, is_verified: !isVerified }),
    });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 space-y-16">
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin — curated lists</h1>

        <form onSubmit={createList} className="mt-6 flex flex-wrap gap-3 items-end border-b border-line-light pb-6">
          <input
            placeholder="Title"
            required
            value={newList.title}
            onChange={(e) => setNewList({ ...newList, title: e.target.value })}
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
          <input
            placeholder="slug-like-this"
            required
            value={newList.slug}
            onChange={(e) => setNewList({ ...newList, slug: e.target.value })}
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
          <input
            placeholder="Description"
            value={newList.description}
            onChange={(e) => setNewList({ ...newList, description: e.target.value })}
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white flex-1 min-w-[200px]"
          />
          <button className="rounded-sm bg-ink text-paper px-4 py-2 text-sm font-medium">
            Create list
          </button>
        </form>

        <div className="mt-8 space-y-8">
          {initialLists.map((list) => (
            <div key={list.id} className="border border-line-light rounded-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold">{list.title}</h2>
                  <p className="text-xs text-ink/50">/lists/{list.slug}</p>
                </div>
                <button
                  onClick={() => togglePublish(list.id, list.published)}
                  className={`text-sm px-3 py-1.5 rounded-sm font-medium ${
                    list.published ? "bg-court/10 text-court" : "bg-amber/10 text-amber-800"
                  }`}
                >
                  {list.published ? "Published" : "Draft — publish"}
                </button>
              </div>

              <ul className="mt-3 divide-y divide-line-light">
                {(list.curated_list_items ?? [])
                  .sort((a: any, b: any) => a.rank - b.rank)
                  .map((item: any) => (
                    <li key={item.players.id} className="py-2 flex items-center justify-between text-sm">
                      <span>
                        #{item.rank} — {item.players.full_name} ({item.players.grad_year})
                      </span>
                      <button
                        onClick={() => removeItem(list.id, item.players.id)}
                        className="text-xs text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>

              <div className="mt-3 flex gap-2">
                <input
                  placeholder="player-slug"
                  value={itemForm[list.id]?.player_slug ?? ""}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, [list.id]: { ...itemForm[list.id], player_slug: e.target.value, rank: itemForm[list.id]?.rank ?? "", note: itemForm[list.id]?.note ?? "" } })
                  }
                  className="border border-line-light rounded-sm px-2 py-1.5 text-sm bg-white w-40"
                />
                <input
                  placeholder="rank"
                  type="number"
                  value={itemForm[list.id]?.rank ?? ""}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, [list.id]: { ...itemForm[list.id], rank: e.target.value, player_slug: itemForm[list.id]?.player_slug ?? "", note: itemForm[list.id]?.note ?? "" } })
                  }
                  className="border border-line-light rounded-sm px-2 py-1.5 text-sm bg-white w-20"
                />
                <input
                  placeholder="note (optional)"
                  value={itemForm[list.id]?.note ?? ""}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, [list.id]: { ...itemForm[list.id], note: e.target.value, player_slug: itemForm[list.id]?.player_slug ?? "", rank: itemForm[list.id]?.rank ?? "" } })
                  }
                  className="border border-line-light rounded-sm px-2 py-1.5 text-sm bg-white flex-1"
                />
                <button
                  onClick={() => addItem(list.id)}
                  className="text-sm bg-ink text-paper px-3 py-1.5 rounded-sm"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold">Verify players</h2>
        <ul className="mt-4 divide-y divide-line-light border-y border-line-light">
          {players.map((p) => (
            <li key={p.id} className="py-2 flex items-center justify-between text-sm">
              <span>
                {p.full_name} — {p.grad_year} — {p.slug}{" "}
                <span className="text-ink/40">
                  ({p.subscription_status}
                  {p.is_published ? ", published" : ""})
                </span>
              </span>
              <button
                onClick={() => toggleVerify(p.id, p.is_verified)}
                className={`text-xs px-3 py-1 rounded-sm font-medium ${
                  p.is_verified ? "bg-court/10 text-court" : "bg-ink/5 text-ink/60"
                }`}
              >
                {p.is_verified ? "Verified ✓" : "Mark verified"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
