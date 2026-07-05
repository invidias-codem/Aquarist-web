import { serve } from '@supabase/functions-js/edge';

export const runtime = 'edge';

serve((_req) => new Response('Aquarist API placeholder', { status: 200 }));
