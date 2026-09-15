import { createClient, createServiceClient } from "@/lib/supabase/server";

// Returns the logged-in user's email if they're in the `admins` table,
// otherwise null. Use this to gate admin routes/pages server-side.
export async function requireAdminEmail(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const service = createServiceClient();
  const { data } = await service.from("admins").select("email").eq("email", user.email).single();
  return data ? user.email : null;
}
