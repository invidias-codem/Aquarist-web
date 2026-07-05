import { TankClass } from './enums';

export const FIELD_LIMITS = {
  TANK_NAME: { min: 1, max: 100 },
  TANK_NOTES: { max: 2000 },
  SPECIES_COMMON_NAME: { min: 1, max: 100 },
  SPECIES_SPECIES_NAME: { max: 200 },
  LIVESTOCK_NOTES: { max: 1000 },
  TASK_TITLE: { min: 1, max: 200 },
  TASK_NOTES: { max: 1000 },
  MAINTENANCE_PARAMETER_CODE_NULLABLE: true,
} as const;

export const TANK_LIMIT_PER_USER = 10;
export const MAX_LOG_READINGS = 10;
export const LOG_DEDUP_WINDOW_SECONDS = 60;
export const LOG_BACKDATE_DAYS = 365;
export const MAX_BACKDATE_DAYS = 365;

export const TEMP_MIN_F = 32;
export const TEMP_MAX_F = 120;
export const VOLUME_MAX = 99999.99;
export const VOLUME_DECIMALS = 2;

export interface TemporaryFieldDefinition {
  min?: number;
  max?: number;
}

export const PHYSICAL_RANGES: Record<string, { min: number; max: number; unit: string | null }> = {
  temperature_c: { min: 0, max: 50, unit: '°C' },
  ph: { min: 0, max: 14, unit: null },
  ammonia_ppm: { min: 0, max: 20, unit: 'ppm' },
  nitrite_ppm: { min: 0, max: 20, unit: 'ppm' },
  nitrate_ppm: { min: 0, max: 500, unit: 'ppm' },
  salinity_sg: { min: 0, max: 50, unit: 'ppt' },
  gh_dgh: { min: 0, max: 30, unit: 'dGH' },
  kh_dkh: { min: 0, max: 30, unit: 'dKH' },
  alkalinity_dkh: { min: 0, max: 30, unit: 'dKH' },
  calcium_ppm: { min: 0, max: 1000, unit: 'ppm' },
  magnesium_ppm: { min: 0, max: 3000, unit: 'ppm' },
  phosphate_ppm: { min: 0, max: 20, unit: 'ppm' },
};

export interface ThresholdRange {
  min_value: number;
  max_value: number;
  unit: string;
}

export const THRESHOLD_DEFAULTS: Record<TankClass, Partial<Record<string, ThresholdRange>>> = {
  freshwater: {
    ph: { min_value: 6.5, max_value: 7.5, unit: '' },
    ammonia_ppm: { min_value: 0, max_value: 0.25, unit: 'ppm' },
    nitrite_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrate_ppm: { min_value: 0, max_value: 40, unit: 'ppm' },
    temperature_c: { min_value: 10, max_value: 26.7, unit: '°C' },
    phosphate_ppm: { min_value: 0, max_value: 1, unit: 'ppm' },
  },
  planted_freshwater: {
    ph: { min_value: 6.2, max_value: 7.2, unit: '' },
    ammonia_ppm: { min_value: 0, max_value: 0.25, unit: 'ppm' },
    nitrite_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrate_ppm: { min_value: 0, max_value: 30, unit: 'ppm' },
    temperature_c: { min_value: 22, max_value: 28, unit: '°C' },
    phosphate_ppm: { min_value: 0, max_value: 1, unit: 'ppm' },
  },
  brackish: {
    ph: { min_value: 7.6, max_value: 8.4, unit: '' },
    ammonia_ppm: { min_value: 0, max_value: 0.1, unit: 'ppm' },
    nitrite_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrate_ppm: { min_value: 0, max_value: 20, unit: 'ppm' },
    temperature_c: { min_value: 21.1, max_value: 29.4, unit: '°C' },
    salinity_sg: { min_value: 1.005, max_value: 1.015, unit: 'sg' },
    phosphate_ppm: { min_value: 0, max_value: 1, unit: 'ppm' },
  },
  saltwater: {
    ph: { min_value: 8.1, max_value: 8.4, unit: '' },
    ammonia_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrite_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrate_ppm: { min_value: 0, max_value: 10, unit: 'ppm' },
    temperature_c: { min_value: 23.9, max_value: 26.7, unit: '°C' },
    salinity_sg: { min_value: 1.023, max_value: 1.026, unit: 'sg' },
    alkalinity_dkh: { min_value: 8, max_value: 12, unit: 'dKH' },
    calcium_ppm: { min_value: 380, max_value: 450, unit: 'ppm' },
    magnesium_ppm: { min_value: 1250, max_value: 1350, unit: 'ppm' },
    phosphate_ppm: { min_value: 0, max_value: 0.03, unit: 'ppm' },
  },
  reef: {
    ph: { min_value: 8.1, max_value: 8.4, unit: '' },
    ammonia_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrite_ppm: { min_value: 0, max_value: 0, unit: 'ppm' },
    nitrate_ppm: { min_value: 0, max_value: 10, unit: 'ppm' },
    temperature_c: { min_value: 23.9, max_value: 26.7, unit: '°C' },
    salinity_sg: { min_value: 1.023, max_value: 1.026, unit: 'sg' },
    alkalinity_dkh: { min_value: 8, max_value: 12, unit: 'dKH' },
    calcium_ppm: { min_value: 380, max_value: 450, unit: 'ppm' },
    magnesium_ppm: { min_value: 1250, max_value: 1350, unit: 'ppm' },
    phosphate_ppm: { min_value: 0, max_value: 0.03, unit: 'ppm' },
  },
};

export const DEFAULT_LOCALE = 'en';
export const DEFAULT_TEMP_UNIT = 'fahrenheit';
