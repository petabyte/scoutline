import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

// Stripe requires the raw request body to verify the webhook signature,
// so this route must NOT run through any body-parsing middleware.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const playerId = session.metadata?.player_id ?? session.client_reference_id;
      if (playerId) {
        await supabase
          .from("players")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
            is_published: true,
          })
          .eq("id", playerId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const playerId = sub.metadata?.player_id;
      const status = sub.status; // active | past_due | canceled | unpaid | ...
      const isActive = status === "active" || status === "trialing";

      const update = {
        subscription_status: status,
        is_published: isActive,
      };

      if (playerId) {
        await supabase.from("players").update(update).eq("id", playerId);
      } else {
        // Fallback: match by customer ID if metadata wasn't set on this sub.
        await supabase
          .from("players")
          .update(update)
          .eq("stripe_customer_id", sub.customer as string);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
