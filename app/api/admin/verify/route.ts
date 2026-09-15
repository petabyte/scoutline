import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { player_id, is_verified } = await request.json();
  const service = createServiceClient();
  const { error } = await service.from("players").update({ is_verified }).eq("id", player_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
