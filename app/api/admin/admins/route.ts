import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from("admins").insert({ email });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await requireAdminEmail();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await request.json();
  if (email === admin) return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from("admins").delete().eq("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
