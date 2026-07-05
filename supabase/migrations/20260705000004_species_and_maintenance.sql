-- Species Dictionary Table
CREATE TABLE public.species_dictionary (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  common_name text NOT NULL,
  scientific_name text NOT NULL,
  tank_environment text NOT NULL,
  mismatch_risk text,
  mismatch_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE public.species_dictionary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read species dictionary"
  ON public.species_dictionary FOR SELECT
  USING (true);

-- Trigger for recurring task logic (Recalculate next_due based on today's completion)
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_interval integer;
BEGIN
  -- Get the interval
  SELECT recurrence_interval_days INTO v_interval 
  FROM public.maintenance_tasks 
  WHERE id = NEW.maintenance_task_id;

  -- Only recalculate if there is an interval
  IF v_interval IS NOT NULL AND v_interval > 0 THEN
    UPDATE public.maintenance_tasks
    SET 
      next_due = (NEW.completed_at + (v_interval * interval '1 day'))::date,
      updated_at = now()
    WHERE id = NEW.maintenance_task_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_completed ON public.task_completions;
CREATE TRIGGER on_task_completed
  AFTER INSERT ON public.task_completions
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- Grant API access
GRANT ALL ON TABLE public.species_dictionary TO authenticated, anon;
