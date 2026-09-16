import type { Metadata } from "next";
import { Oswald, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Scoutline — Verified player profiles for college coaches",
  description:
    "A recruiting directory where high school basketball players keep a verified profile, stats, and highlight film — and coaches browse for free.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user?.email) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const service = createServiceClient();
    const { data } = await service.from("admins").select("email").eq("email", user.email).maybeSingle();
    isAdmin = !!data;
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-line-light bg-paper/95 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="font-display text-xl font-semibold tracking-tight">
              Scoutline
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/players" className="hover:text-amber-700">
                Player directory
              </Link>
              <Link href="/lists" className="hover:text-amber-700">
                Ranked lists
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin/lists" className="hover:text-amber-700 font-medium">
                      Admin
                    </Link>
                  )}
                  <LogoutButton />
                  <Link
                    href="/dashboard"
                    className="rounded-sm bg-ink text-paper px-4 py-2 hover:bg-ink/90"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-amber-700">
                    Log in
                  </Link>
                  <Link
                    href="/join"
                    className="rounded-sm bg-ink text-paper px-4 py-2 hover:bg-ink/90"
                  >
                    List your profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line-light mt-24">
          <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink/60 flex justify-between">
            <span>© {new Date().getFullYear()} Scoutline</span>
            <span>Built for coaches who don't have time to dig.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
