import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerCard from "@/components/PlayerCard";
import { Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: list } = await supabase
    .from("curated_lists")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!list) notFound();

  const { data: items } = await supabase
    .from("curated_list_items")
    .select("rank, note, players(*)")
    .eq("list_id", list.id)
    .order("rank", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-4xl font-semibold">{list.title}</h1>
      {list.description && <p className="text-ink/60 mt-2">{list.description}</p>}

      <div className="mt-8 grid gap-3">
        {items?.map((item: any) => (
          <div key={item.players.id}>
            <PlayerCard player={item.players as Player} rank={item.rank} />
            {item.note && (
              <p className="text-sm text-ink/60 italic mt-1 ml-14">{item.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
