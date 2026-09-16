import { redirect } from "next/navigation";
import { requireAdminEmail } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminListsPage() {
  const admin = await requireAdminEmail();
  if (!admin) redirect("/login");

  const service = createServiceClient();
  const { data: lists } = await service
    .from("curated_lists")
    .select("*, curated_list_items(rank, note, players(id, slug, full_name, grad_year))")
    .order("created_at", { ascending: false });
  const { data: players } = await service
    .from("players")
    .select("id, slug, full_name, grad_year, is_verified, is_published, subscription_status")
    .order("created_at", { ascending: false });
  const { data: admins } = await service.from("admins").select("email").order("email");

  return <AdminPanel initialLists={lists ?? []} players={players ?? []} admins={admins ?? []} />;
}
