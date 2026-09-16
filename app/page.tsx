import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Get seen by the coaches who are actually looking.
          </h1>
          <p className="mt-5 text-lg text-ink/70 max-w-md">
            Scoutline is a verified directory of high school players — stats, film, and
            contact info in one place, built so college coaches can evaluate fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-sm bg-ink text-paper px-6 py-3 font-medium hover:bg-ink/90"
            >
              List your profile — $9/mo
            </Link>
            <Link
              href="/players"
              className="rounded-sm border border-ink px-6 py-3 font-medium hover:bg-ink hover:text-paper transition-colors"
            >
              Browse players
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink/50">
            Free for coaches and scouts, always. No account needed to browse.
          </p>
        </div>

        {/* Mock profile card grounding the hero in the real product */}
        <div className="border border-line-light bg-white rounded-sm p-5 shadow-[4px_4px_0_0_#13161C]">
          <div className="flex items-center gap-2 text-xs text-ink/50 mb-3">
            <span className="text-court font-semibold border border-court/40 rounded-full px-2 py-0.5">
              Verified
            </span>
            <span>Class of 2027 · Guard</span>
          </div>
          <h3 className="font-display text-2xl font-semibold">Jordan Malik</h3>
          <p className="text-sm text-ink/60">6'2" · Rosemount, MN · Minnesota Fury (AAU)</p>
          <p className="stat mt-3 text-sm border-t border-line-light pt-3">
            17.8 PPG / 5.3 APG / 2.1 SPG — Fall league, 2026
          </p>
          <div className="mt-3 aspect-video rounded-sm overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/4Z0kFQuFTHg"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink text-paper py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-2xl font-semibold mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="stat text-amber text-sm mb-2">1</p>
              <h3 className="font-display text-lg font-semibold mb-1">Build your profile</h3>
              <p className="text-sm text-paper/70">
                Stats, grad year, height, GPA, and a link to your highlight film. Takes ten
                minutes.
              </p>
            </div>
            <div>
              <p className="stat text-amber text-sm mb-2">2</p>
              <h3 className="font-display text-lg font-semibold mb-1">Get verified</h3>
              <p className="text-sm text-paper/70">
                We confirm your team and grad year so coaches can trust what they're
                looking at.
              </p>
            </div>
            <div>
              <p className="stat text-amber text-sm mb-2">3</p>
              <h3 className="font-display text-lg font-semibold mb-1">Stay listed for $9/mo</h3>
              <p className="text-sm text-paper/70">
                Cancel anytime. Your profile comes down the day your subscription lapses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coach pitch */}
      <section className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-3">For coaches and scouts</h2>
          <p className="text-ink/70">
            Filter by grad year, position, and region. Every listed player has a stat
            line and film link up front — no chasing down a Twitter account to find
            out someone already graduated.
          </p>
          <Link href="/players" className="inline-block mt-4 text-amber-700 font-medium">
            Browse the directory →
          </Link>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold mb-3">Ranked lists</h2>
          <p className="text-ink/70">
            Curated, position-by-position rankings for each grad class, built and
            updated by our staff — for coaches who want a shortlist, not a database.
          </p>
          <Link href="/lists" className="inline-block mt-4 text-amber-700 font-medium">
            See ranked lists →
          </Link>
        </div>
      </section>
    </div>
  );
}
