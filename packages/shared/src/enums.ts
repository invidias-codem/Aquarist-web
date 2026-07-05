export const TankClass = {
  FRESHWEATHER: 'freshwater',
  PLANTED_FRESHWATER: 'planted_freshwater',
  BRACKISH: 'brackish',
  SALTWATER: 'saltwater',
  REEF: 'reef',
} as const;
export type TankClass = typeof TankClass[keyof typeof TankClass];

export const Phase1Availability = {
  SUPPORTED: 'supported',
  SEARCHABLE_ONLY: 'searchable_only',
  EXCLUDED: 'excluded',
} as const;
export type Phase1Availability = typeof Phase1Availability[keyof typeof Phase1Availability];

export const ReviewStatus = {
  UNREVIEWED: 'unreviewed',
  NEEDS_REVIEW: 'needs_review',
  REVIEWED: 'reviewed',
} as const;
export type ReviewStatus = typeof ReviewStatus[keyof typeof ReviewStatus];

export const CompatibilityResultClass = {
  COMPATIBLE: 'compatible',
  COMPATIBLE_WITH_CAUTION: 'compatible_with_caution',
  NOT_COMPATIBLE: 'not_compatible',
  UNKNOWN: 'unknown',
} as const;
export type CompatibilityResultClass = typeof CompatibilityResultClass[keyof typeof CompatibilityResultClass];

export const SupportLevel = {
  FULL: 'full',
  LIMITED: 'limited',
} as const;
export type SupportLevel = typeof SupportLevel[keyof typeof SupportLevel];

export const AlertType = {
  PARAMETER_THRESHOLD: 'parameter_threshold',
  TASK_DUE: 'task_due',
} as const;
export type AlertType = typeof AlertType[keyof typeof AlertType];

export const AlertStatus = {
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
} as const;
export type AlertStatus = typeof AlertStatus[keyof typeof AlertStatus];

export const TaskRecurrence = {
  ONE_TIME: 'one_time',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  EVERY_N_DAYS: 'every_n_days',
} as const;
export type TaskRecurrence = typeof TaskRecurrence[keyof typeof TaskRecurrence];

export const ParameterCode = {
  TEMPERATURE_C: 'temperature_c',
  PH: 'ph',
  AMMONIA_PPM: 'ammonia_ppm',
  NITRITE_PPM: 'nitrite_ppm',
  NITRATE_PPM: 'nitrate_ppm',
  SALINITY_SG: 'salinity_sg',
  GH_DGH: 'gh_dgh',
  KH_DKH: 'kh_dkh',
  ALKALINITY_DKH: 'alkalinity_dkh',
  CALCIUM_PPM: 'calcium_ppm',
  MAGNESIUM_PPM: 'magnesium_ppm',
  PHOSPHATE_PPM: 'phosphate_ppm',
} as const;
export type ParameterCode = typeof ParameterCode[keyof typeof ParameterCode];

export const CompatibilityRuleType = {
  TANK_CLASS: 'tank_class',
  TANK_VOLUME: 'tank_volume',
  PARAMETER_RANGE: 'parameter_range',
  SPECIES_PAIR: 'species_pair',
  GROUP_SIZE: 'group_size',
} as const;
export type CompatibilityRuleType = typeof CompatibilityRuleType[keyof typeof CompatibilityRuleType];

export const CompatibilitySeverity = {
  BLOCKER: 'blocker',
  CAUTION: 'caution',
  UNKNOWN: 'unknown',
} as const;
export type CompatibilitySeverity = typeof CompatibilitySeverity[keyof typeof CompatibilitySeverity];

export const MaintenanceTaskEventType = {
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  RESCHEDULED: 'rescheduled',
} as const;
export type MaintenanceTaskEventType = typeof MaintenanceTaskEventType[keyof typeof MaintenanceTaskEventType];

export const ThresholdSource = {
  SYSTEM_DEFAULT: 'system_default',
  USER_OVERRIDE: 'user_override',
} as const;
export type ThresholdSource = typeof ThresholdSource[keyof typeof ThresholdSource];
