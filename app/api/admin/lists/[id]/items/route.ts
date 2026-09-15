import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { player_slug, rank, note } = await request.json();
  const service = createServiceClient();

  const { data: player, error: playerError } = await service
    .from("players")
    .select("id")
    .eq("slug", player_slug)
    .single();
  if (playerError || !player) {
    return NextResponse.json({ error: "No player with that slug." }, { status: 404 });
  }

  const { error } = await service
    .from("curated_list_items")
    .upsert({ list_id: params.id, player_id: player.id, rank, note }, { onConflict: "list_id,player_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { player_id } = await request.json();
  const service = createServiceClient();
  const { error } = await service
    .from("curated_list_items")
    .delete()
    .eq("list_id", params.id)
    .eq("player_id", player_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
