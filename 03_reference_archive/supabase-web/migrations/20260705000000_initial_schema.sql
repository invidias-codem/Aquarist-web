-- All enums created before table definitions

CREATE TYPE tank_type AS ENUM ('freshwater', 'marine', 'brackish');
CREATE TYPE livestock_status AS ENUM ('alive', 'deceased', 'rehomed');
CREATE TYPE parameter_type AS ENUM (
  'ph', 'ammonia', 'nitrite', 'nitrate', 'temperature',
  'salinity', 'alkalinity', 'calcium', 'magnesium', 'phosphate'
);
CREATE TYPE task_type AS ENUM (
  'water_change', 'filter_clean', 'glass_clean',
  'dose', 'feed', 'test_water', 'custom'
);
CREATE TYPE recurrence AS ENUM (
  'none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'
);
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged');
CREATE TYPE volume_unit AS ENUM ('gallons', 'liters');
CREATE TYPE linked_entity_type AS ENUM ('parameter_log', 'livestock');

-- Tables

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  temp_unit     text NOT NULL DEFAULT 'fahrenheit'
                  CHECK (temp_unit IN ('fahrenheit', 'celsius')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tanks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  tank_type       tank_type NOT NULL,
  volume          numeric(10, 2) NOT NULL CHECK (volume > 0),
  volume_unit     volume_unit NOT NULL,
  temp_target     numeric(5, 1),
  notes           text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tanks_user_id ON tanks (user_id) WHERE deleted_at IS NULL;

CREATE TABLE livestock (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id           uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  common_name       text NOT NULL CHECK (char_length(trim(common_name)) BETWEEN 1 AND 100),
  species_name      text CHECK (species_name IS NULL OR char_length(trim(species_name)) <= 200),
  quantity          integer NOT NULL CHECK (quantity >= 1),
  date_added        date NOT NULL,
  status            livestock_status NOT NULL DEFAULT 'alive',
  status_changed_at timestamptz,
  notes             text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_livestock_tank_id ON livestock (tank_id);

CREATE TABLE parameter_thresholds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id         uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  parameter_type  parameter_type NOT NULL,
  min_value       numeric(10, 4) NOT NULL,
  max_value       numeric(10, 4) NOT NULL,
  unit            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_threshold_tank_param UNIQUE (tank_id, parameter_type),
  CONSTRAINT chk_min_lt_max CHECK (min_value <= max_value)
);

CREATE INDEX idx_thresholds_tank_id ON parameter_thresholds (tank_id);

CREATE TABLE parameter_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id     uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  logged_at   timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_param_logs_tank_logged ON parameter_logs (tank_id, logged_at DESC);

CREATE TABLE parameter_readings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_log_id  uuid NOT NULL REFERENCES parameter_logs(id) ON DELETE CASCADE,
  parameter_type    parameter_type NOT NULL,
  value             numeric(10, 4) NOT NULL,
  unit              text NOT NULL,

  CONSTRAINT uq_reading_log_param UNIQUE (parameter_log_id, parameter_type)
);

CREATE INDEX idx_readings_log_id ON parameter_readings (parameter_log_id);

CREATE TABLE alerts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id               uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  parameter_reading_id  uuid NOT NULL REFERENCES parameter_readings(id) ON DELETE CASCADE,
  parameter_type        parameter_type NOT NULL,
  logged_value          numeric(10, 4) NOT NULL,
  threshold_min         numeric(10, 4) NOT NULL,
  threshold_max         numeric(10, 4) NOT NULL,
  status                alert_status NOT NULL DEFAULT 'active',
  created_at            timestamptz NOT NULL DEFAULT now(),
  acknowledged_at       timestamptz
);

CREATE INDEX idx_alerts_tank_status ON alerts (tank_id, status) WHERE status = 'active';

CREATE TABLE maintenance_tasks (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id                   uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  task_type                 task_type NOT NULL,
  title                     text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  recurrence                recurrence NOT NULL DEFAULT 'none',
  recurrence_interval_days  integer CHECK (
                              recurrence_interval_days IS NULL
                              OR recurrence_interval_days > 0
                            ),
  next_due                  date NOT NULL,
  notes                     text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  deleted_at                timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_tank_id ON maintenance_tasks (tank_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due ON maintenance_tasks (next_due) WHERE deleted_at IS NULL;

CREATE TABLE task_completions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_task_id   uuid NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  completed_at          timestamptz NOT NULL DEFAULT now(),
  notes                 text CHECK (notes IS NULL OR char_length(notes) <= 1000)
);

CREATE INDEX idx_completions_task_id ON task_completions (maintenance_task_id);

CREATE TABLE notes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id             uuid NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  linked_entity_type  linked_entity_type,
  linked_entity_id    uuid,
  content             text NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_tank_id ON notes (tank_id, created_at DESC);
CREATE INDEX idx_notes_linked ON notes (linked_entity_type, linked_entity_id)
  WHERE linked_entity_type IS NOT NULL;

-- Enable RLS on all application tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- profiles: user can only access own profile
CREATE POLICY profiles_own ON profiles
  FOR ALL USING (id = auth.uid());

-- tanks: user can only access own tanks
CREATE POLICY tanks_own ON tanks
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY livestock_own ON livestock
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = livestock.tank_id AND tanks.user_id = auth.uid())
  );

CREATE POLICY thresholds_own ON parameter_thresholds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = parameter_thresholds.tank_id AND tanks.user_id = auth.uid())
  );

CREATE POLICY param_logs_own ON parameter_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = parameter_logs.tank_id AND tanks.user_id = auth.uid())
  );

CREATE POLICY readings_own ON parameter_readings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM parameter_logs pl
      JOIN tanks t ON t.id = pl.tank_id
      WHERE pl.id = parameter_readings.parameter_log_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY alerts_own ON alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = alerts.tank_id AND tanks.user_id = auth.uid())
  );

CREATE POLICY tasks_own ON maintenance_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = maintenance_tasks.tank_id AND tanks.user_id = auth.uid())
  );

CREATE POLICY completions_own ON task_completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM maintenance_tasks mt
      JOIN tanks t ON t.id = mt.tank_id
      WHERE mt.id = task_completions.maintenance_task_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY notes_own ON notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tanks WHERE tanks.id = notes.tank_id AND tanks.user_id = auth.uid())
  );

-- Profile Auto-Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at Auto-Trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tanks_updated BEFORE UPDATE ON tanks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_livestock_updated BEFORE UPDATE ON livestock
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_thresholds_updated BEFORE UPDATE ON parameter_thresholds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable pg_cron and set up job
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('0 0 * * *', $$DELETE FROM tanks WHERE deleted_at < now() - interval '30 days'$$);
