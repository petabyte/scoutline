import Link from "next/link";
import { Player, heightLabel } from "@/lib/types";

export default function PlayerCard({ player, rank }: { player: Player; rank?: number }) {
  return (
    <Link
      href={`/players/${player.slug}`}
      className="group block border border-line-light rounded-sm bg-white/40 hover:bg-white transition-colors"
    >
      <div className="flex gap-4 p-4">
        {rank !== undefined && (
          <div className="font-display text-3xl text-ink/30 w-10 shrink-0 tabular-nums">
            {String(rank).padStart(2, "0")}
          </div>
        )}
        <div className="h-16 w-16 shrink-0 rounded-sm bg-ink/10 overflow-hidden">
          {player.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold truncate group-hover:text-amber-700">
              {player.full_name}
            </h3>
            {player.is_verified && (
              <span className="text-court text-xs font-semibold border border-court/40 rounded-full px-2 py-0.5 shrink-0">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-ink/70">
            {[player.position, `Class of ${player.grad_year}`, heightLabel(player.height_inches)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {player.stat_line && (
            <p className="stat text-sm mt-1 text-ink/80">{player.stat_line}</p>
          )}
          {player.club_team && (
            <p className="text-xs text-ink/50 mt-1">{player.club_team}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
