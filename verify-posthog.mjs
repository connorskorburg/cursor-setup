import 'dotenv/config';
import { PostHog } from 'posthog-node';

const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
});

client.on('error', (err) => {
  console.log('✗ PostHog error:', err.message);
});

client.capture({
  distinctId: 'setup-verification',
  event: 'connection_verified',
});

await client.shutdown();
console.log('✓ PostHog connected — check Live Events in your dashboard');

