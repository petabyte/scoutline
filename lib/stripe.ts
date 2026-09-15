import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// The single subscription price players pay to keep their profile live.
// Set this to a Stripe Price ID (starts with "price_") from your dashboard.
export const PLAYER_PRICE_ID = process.env.STRIPE_PLAYER_PRICE_ID!;
