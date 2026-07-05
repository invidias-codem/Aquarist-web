import { serve } from '@supabase/functions-js/edge';
import { createClient } from '@supabase/supabase-js';
import { TankClass, AlertStatus } from '@aquarist/shared';

export const runtime = 'edge';

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const tankId = url.pathname.split('/').filter(Boolean).pop();

  if (!tankId) {
    return new Response(JSON.stringify({ message: 'tank_id is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_ANON_KEY ?? ''
  );

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ message: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { data: tank, error: tankError } = await supabase
    .from('tanks')
    .select('id, name, tank_class, volume_liters, user_id')
    .eq('id', tankId)
    .maybeSingle();

  if (tankError || !tank) {
    return new Response(JSON.stringify({ message: 'Tank not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (tank.user_id !== user.id) {
    return new Response(JSON.stringify({ message: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { data: livestock, error: livestockError } = await supabase
    .from('livestock_entries')
    .select('id, species_id, quantity, status')
    .eq('tank_id', tankId)
    .eq('status', 'active');

  if (livestockError) {
    return new Response(JSON.stringify({ message: 'Failed to load livestock' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { data: openAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select('id, type, status')
    .eq('tank_id', tankId)
    .eq('status', AlertStatus.OPEN);

  if (alertsError) {
    return new Response(JSON.stringify({ message: 'Failed to load alerts' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      tank: {
        id: tank.id,
        name: tank.name,
        tank_class: tank.tank_class as TankClass,
        volume_liters: tank.volume_liters,
      },
      livestock: livestock ?? [],
      open_alerts: openAlerts ?? [],
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    }
  );
});
