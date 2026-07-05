import { serve } from '@supabase/functions-js/edge';

export const runtime = 'edge';

serve((_req) => {
  const body = {
    status: 'ok',
    service: 'aquarist-api',
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
});
