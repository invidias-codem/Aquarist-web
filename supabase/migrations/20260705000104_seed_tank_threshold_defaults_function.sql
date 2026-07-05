create or replace function public.default_tank_thresholds(p_tank_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.tank_thresholds (tank_id, parameter_code, target_value, target_unit, min_value, max_value, critical_low, critical_high, source)
  values
    (p_tank_id, 'temperature', 78.0, 'fahrenheit', 76.0, 82.0, 72.0, 86.0, 'default'),
    (p_tank_id, 'ph', 7.8, 'ph', 7.6, 8.0, 7.4, 8.4, 'default'),
    (p_tank_id, 'ammonia', 0.0, 'ppm', 0.0, 0.25, 0.5, 1.0, 'default');
end;
$$;

comment on function public.default_tank_thresholds is 'Seeds default threshold rows for a newly created tank.';
