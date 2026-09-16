import { createClient } from "@/lib/supabase/server";
import PlayerCard from "@/components/PlayerCard";
import { Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { grad_year?: string; position?: string; q?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("players")
    .select("*")
    .eq("is_published", true)
    .order("is_verified", { ascending: false })
    .order("updated_at", { ascending: false });

  if (searchParams.grad_year) query = query.eq("grad_year", Number(searchParams.grad_year));
  if (searchParams.position) query = query.eq("position", searchParams.position);
  if (searchParams.q) query = query.ilike("full_name", `%${searchParams.q}%`);

  const { data: players } = await query.returns<Player[]>();

  const gradYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
  const positions = ["PG", "SG", "SF", "PF", "C"];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl font-semibold">Player directory</h1>
      <p className="text-ink/60 mt-2">
        {players?.length ?? 0} verified and active profiles. Free to browse — no account
        needed.
      </p>

      <form className="mt-8 flex flex-wrap gap-3 items-end border-y border-line-light py-4">
        <div>
          <label className="block text-xs text-ink/50 mb-1">Name</label>
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by name"
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Grad year</label>
          <select
            name="grad_year"
            defaultValue={searchParams.grad_year ?? ""}
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          >
            <option value="">Any</option>
            {gradYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Position</label>
          <select
            name="position"
            defaultValue={searchParams.position ?? ""}
            className="border border-line-light rounded-sm px-3 py-2 text-sm bg-white"
          >
            <option value="">Any</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-sm bg-ink text-paper px-5 py-2 text-sm font-medium">
          Filter
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {players?.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
        {players?.length === 0 && (
          <p className="text-ink/50 col-span-2 py-12 text-center">
            No players match those filters yet.
          </p>
        )}
      </div>
    </div>
  );
}
