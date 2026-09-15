import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe, PLAYER_PRICE_ID } from "@/lib/stripe";

function slugify(name: string, gradYear: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${gradYear}-${suffix}`;
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { full_name, email, password, grad_year, position } = body;

  if (!full_name || !email || !password || !grad_year || !position) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const service = createServiceClient();

  // Create the auth user via admin API (no session required).
  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Could not create account." }, { status: 400 });
  }

  const userId = authData.user.id;
  const slug = slugify(full_name, grad_year);

  // Insert the player row using service client (bypasses RLS).
  const { error: insertError } = await service.from("players").insert({
    id: userId,
    slug,
    full_name,
    grad_year: Number(grad_year),
    position,
    contact_email: email,
    is_published: false,
    subscription_status: "inactive",
  });

  if (insertError) {
    // Roll back the auth user so the email isn't stuck.
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  // Create Stripe checkout session.
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: PLAYER_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/join?checkout=cancelled`,
      client_reference_id: userId,
      subscription_data: {
        metadata: { player_id: userId },
      },
      metadata: { player_id: userId },
      ...({ managed_payments: { enabled: false } } as any),
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: err.message ?? "Could not start checkout." }, { status: 500 });
  }
}
