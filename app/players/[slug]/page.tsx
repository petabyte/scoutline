import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Player, heightLabel, embedUrl } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlayerProfile({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single<Player>();

  if (!player) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedInCoach = !!user;
  const embed = embedUrl(player.highlight_url);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {player.is_verified && (
              <span className="text-court text-xs font-semibold border border-court/40 rounded-full px-2 py-0.5">
                Verified
              </span>
            )}
            <span className="text-xs text-ink/50">Class of {player.grad_year}</span>
          </div>
          <h1 className="font-display text-4xl font-semibold">{player.full_name}</h1>
          <p className="text-ink/60 mt-1">
            {[player.position, heightLabel(player.height_inches), player.hometown]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {player.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photo_url}
            alt=""
            className="h-24 w-24 rounded-sm object-cover border border-line-light"
          />
        )}
      </div>

      {player.stat_line && (
        <p className="stat mt-6 border-y border-line-light py-4 text-sm">{player.stat_line}</p>
      )}

      {player.highlight_url && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold mb-2">Highlight film</h2>
          {embed ? (
            <div className="aspect-video">
              <iframe
                src={embed}
                className="w-full h-full rounded-sm"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={player.highlight_url}
              target="_blank"
              rel="noreferrer"
              className="text-amber-700 font-medium"
            >
              Watch film →
            </a>
          )}
        </div>
      )}

      {player.bio && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold mb-2">About</h2>
          <p className="text-ink/80 leading-relaxed">{player.bio}</p>
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm border-t border-line-light pt-6">
        {player.high_school && (
          <div>
            <dt className="text-ink/50">High school</dt>
            <dd>{player.high_school}</dd>
          </div>
        )}
        {player.club_team && (
          <div>
            <dt className="text-ink/50">Club / AAU team</dt>
            <dd>{player.club_team}</dd>
          </div>
        )}
        {player.gpa && (
          <div>
            <dt className="text-ink/50">GPA</dt>
            <dd>{player.gpa}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 border-t border-line-light pt-6">
        <h2 className="font-display text-lg font-semibold mb-2">Contact</h2>
        {isLoggedInCoach ? (
          player.contact_email ? (
            <a href={`mailto:${player.contact_email}`} className="text-amber-700 font-medium">
              {player.contact_email}
            </a>
          ) : (
            <p className="text-ink/50 text-sm">No contact email listed.</p>
          )
        ) : (
          <p className="text-sm text-ink/60">
            <a href="/login" className="text-amber-700 font-medium">
              Log in
            </a>{" "}
            as a coach or scout to see contact info.
          </p>
        )}
      </div>
    </div>
  );
}
