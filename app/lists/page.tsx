import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const supabase = createClient();
  const { data: lists } = await supabase
    .from("curated_lists")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-4xl font-semibold">Ranked lists</h1>
      <p className="text-ink/60 mt-2">
        Curated by our staff, position by position, class by class.
      </p>
      <div className="mt-8 divide-y divide-line-light border-y border-line-light">
        {lists?.map((l) => (
          <Link key={l.id} href={`/lists/${l.slug}`} className="block py-4 hover:bg-white/50">
            <h2 className="font-display text-xl font-semibold">{l.title}</h2>
            {l.description && <p className="text-sm text-ink/60 mt-1">{l.description}</p>}
          </Link>
        ))}
        {lists?.length === 0 && (
          <p className="text-ink/50 py-12 text-center">No lists published yet.</p>
        )}
      </div>
    </div>
  );
}
