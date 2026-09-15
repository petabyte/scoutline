import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, slug, description } = await request.json();
  const service = createServiceClient();
  const { data, error } = await service
    .from("curated_lists")
    .insert({ title, slug, description, published: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ list: data });
}
