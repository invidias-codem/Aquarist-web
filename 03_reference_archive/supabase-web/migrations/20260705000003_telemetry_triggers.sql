-- Auto-populate default thresholds when a tank is created
CREATE OR REPLACE FUNCTION public.handle_new_tank()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.tank_type = 'freshwater' THEN
    INSERT INTO public.parameter_thresholds (tank_id, parameter_type, min_value, max_value, unit) VALUES
      (NEW.id, 'ph', 6.5, 7.5, 'pH'),
      (NEW.id, 'ammonia', 0.0, 0.25, 'ppm'),
      (NEW.id, 'nitrite', 0.0, 0.0, 'ppm'),
      (NEW.id, 'nitrate', 0.0, 40.0, 'ppm'),
      (NEW.id, 'temperature', 74.0, 80.0, 'F');
  ELSIF NEW.tank_type = 'marine' THEN
    INSERT INTO public.parameter_thresholds (tank_id, parameter_type, min_value, max_value, unit) VALUES
      (NEW.id, 'ph', 8.1, 8.4, 'pH'),
      (NEW.id, 'ammonia', 0.0, 0.1, 'ppm'),
      (NEW.id, 'nitrite', 0.0, 0.0, 'ppm'),
      (NEW.id, 'nitrate', 0.0, 10.0, 'ppm'),
      (NEW.id, 'temperature', 75.0, 80.0, 'F'),
      (NEW.id, 'salinity', 1.023, 1.026, 'sg'),
      (NEW.id, 'alkalinity', 8.0, 12.0, 'dKH'),
      (NEW.id, 'calcium', 380, 450, 'ppm'),
      (NEW.id, 'magnesium', 1250, 1350, 'ppm');
  ELSIF NEW.tank_type = 'brackish' THEN
    INSERT INTO public.parameter_thresholds (tank_id, parameter_type, min_value, max_value, unit) VALUES
      (NEW.id, 'ph', 7.5, 8.4, 'pH'),
      (NEW.id, 'ammonia', 0.0, 0.1, 'ppm'),
      (NEW.id, 'nitrite', 0.0, 0.0, 'ppm'),
      (NEW.id, 'nitrate', 0.0, 20.0, 'ppm'),
      (NEW.id, 'temperature', 75.0, 80.0, 'F'),
      (NEW.id, 'salinity', 1.005, 1.015, 'sg');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_tank_created
  AFTER INSERT ON public.tanks
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tank();


-- Evaluate readings and insert alerts if bounds are breached
CREATE OR REPLACE FUNCTION public.check_parameter_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  threshold_rec record;
  tank_id_val uuid;
BEGIN
  -- Get the tank_id from the parameter_log
  SELECT tank_id INTO tank_id_val FROM public.parameter_logs WHERE id = NEW.parameter_log_id;
  
  -- Look up the threshold for this tank and parameter type
  SELECT * INTO threshold_rec 
  FROM public.parameter_thresholds 
  WHERE tank_id = tank_id_val AND parameter_type = NEW.parameter_type;
  
  -- If a threshold exists, check bounds
  IF FOUND THEN
    IF NEW.value < threshold_rec.min_value OR NEW.value > threshold_rec.max_value THEN
      INSERT INTO public.alerts (tank_id, parameter_reading_id, parameter_type, logged_value, threshold_min, threshold_max, status)
      VALUES (tank_id_val, NEW.id, NEW.parameter_type, NEW.value, threshold_rec.min_value, threshold_rec.max_value, 'active');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_parameter_logged
  AFTER INSERT ON public.parameter_readings
  FOR EACH ROW EXECUTE FUNCTION public.check_parameter_alert();
