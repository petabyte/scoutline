import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components ("use client"). Safe to call multiple times —
// Supabase caches the underlying client.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
