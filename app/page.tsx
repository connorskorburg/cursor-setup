import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

/** Run checks on each request so prod uses current env (not build-time prerender). */
export const dynamic = 'force-dynamic';

async function checkSupabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.from('_status_check').select('*').limit(1);
    const ok = !error || error.message.includes('schema cache') || error.code === '42P01';
    return { name: 'Supabase', ok };
  } catch {
    return { name: 'Supabase', ok: false };
  }
}

async function checkOpenAI() {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    return { name: 'OpenAI', ok: res.ok };
  } catch {
    return { name: 'OpenAI', ok: false };
  }
}

async function checkStripe() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    await stripe.paymentMethods.list({ limit: 1 });
    return { name: 'Stripe', ok: true };
  } catch {
    return { name: 'Stripe', ok: false };
  }
}

async function checkPostHog() {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    const res = await fetch(`${host}/decide/?v=3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, distinct_id: 'status-check' }),
    });
    return { name: 'PostHog', ok: res.ok };
  } catch {
    return { name: 'PostHog', ok: false };
  }
}

export default async function Home() {
  const results = await Promise.all([
    checkSupabase(),
    checkOpenAI(),
    checkStripe(),
    checkPostHog(),
  ]);

  return (
    <main style={{ fontFamily: 'monospace', padding: '48px', maxWidth: '480px', margin: '0 auto', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '32px', color: '#111111' }}>
        Stack Status
      </h1>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map(({ name, ok }) => (
          <li key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
            <span style={{ color: ok ? '#22c55e' : '#ef4444', fontSize: '20px' }}>
              {ok ? '✓' : '✗'}
            </span>
            <span style={{ color: '#111111' }}>{name}</span>
            <span style={{ color: ok ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
              {ok ? 'connected' : 'not connected'}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
