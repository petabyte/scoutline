import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLAYER_PRICE_ID } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: player } = await supabase
    .from("players")
    .select("stripe_customer_id, contact_email, full_name")
    .eq("id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "No player profile found." }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: player.stripe_customer_id || undefined,
    customer_email: player.stripe_customer_id ? undefined : player.contact_email || user.email,
    line_items: [{ price: PLAYER_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/join?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { player_id: user.id },
    },
    metadata: { player_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
