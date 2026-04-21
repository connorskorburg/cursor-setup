import Stripe from 'stripe';

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(apiKey);
}

