import { serve } from '@supabase/functions-js/edge';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

serve(async (_req) => {
  const checks: Record<string, unknown> = {
    api: 'up',
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? ''
    );

    const { error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)
      .maybeSingle();

    checks.database = error ? `degraded: ${error.message}` : 'up';
  } catch (error) {
    checks.database = `degraded: ${error instanceof Error ? error.message : 'unknown'}`;
  }

  const healthy = !String(checks.database).startsWith('degraded');
  const body = {
    status: healthy ? 'ready' : 'degraded',
    service: 'aquarist-api',
    checks,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: healthy ? 200 : 503,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
});
