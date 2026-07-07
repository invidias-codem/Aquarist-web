import { z } from 'zod';

import { TankClass } from './enums';
import { ParameterCode } from './enums';
import { AlertStatus, AlertType, TaskRecurrence, CompatibilitySeverity, CompatibilityRuleType, MaintenanceTaskEventType } from './enums';
import { ErrorCode } from './errors';

export const TankClassSchema = z.nativeEnum(TankClass);

export const Phase1AvailabilitySchema = z.nativeEnum({
  SUPPORTED: 'supported',
  SEARCHABLE_ONLY: 'searchable_only',
  EXCLUDED: 'excluded',
} as const);

export const ReviewStatusSchema = z.nativeEnum({
  UNREVIEWED: 'unreviewed',
  NEEDS_REVIEW: 'needs_review',
  REVIEWED: 'reviewed',
} as const);

export const CompatibilityResultClassSchema = z.nativeEnum({
  COMPATIBLE: 'compatible',
  COMPATIBLE_WITH_CAUTION: 'compatible_with_caution',
  NOT_COMPATIBLE: 'not_compatible',
  UNKNOWN: 'unknown',
} as const);

export const SupportLevelSchema = z.nativeEnum({
  FULL: 'full',
  LIMITED: 'limited',
} as const);

export const ParameterCodeSchema = z.nativeEnum(ParameterCode);

export const AlertStatusSchema = z.nativeEnum(AlertStatus);

export const AlertTypeSchema = z.nativeEnum(AlertType);

export const TaskRecurrenceSchema = z.nativeEnum(TaskRecurrence);

export const CompatibilityRuleTypeSchema = z.nativeEnum(CompatibilityRuleType);

export const CompatibilitySeveritySchema = z.nativeEnum(CompatibilitySeverity);

export const MaintenanceTaskEventTypeSchema = z.nativeEnum(MaintenanceTaskEventType);

export const PhysicalRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  unit: z.string().nullable(),
});

export const ThresholdRangeSchema = z.object({
  min_value: z.number(),
  max_value: z.number(),
  unit: z.string(),
});

export const TankLimitsSchema = z.object({
  TANK_NAME: z.object({ min: z.number().int(), max: z.number().int() }),
  TANK_NOTES: z.object({ max: z.number().int() }),
  SPECIES_COMMON_NAME: z.object({ min: z.number().int(), max: z.number().int() }),
  SPECIES_SPECIES_NAME: z.object({ max: z.number().int() }),
  LIVESTOCK_NOTES: z.object({ max: z.number().int() }),
  TASK_TITLE: z.object({ min: z.number().int(), max: z.number().int() }),
  TASK_NOTES: z.object({ max: z.number().int() }),
});

export const ErrorResponseSchema = z.object({
  status: z.number().int(),
  code: z.nativeEnum(ErrorCode),
  message: z.string().min(1),
  errors: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
});

export const LoggerSettingsSchema = z.object({
  maxLogReadings: z.number().int().positive(),
  dedupWindowSeconds: z.number().int().nonnegative(),
  backdateDays: z.number().int().nonnegative(),
  maxBackdateDays: z.number().int().nonnegative(),
});

export const TemperatureUnitSchema = z.enum(['celsius', 'fahrenheit']);

export const schemas = {
  TankClass: TankClassSchema,
  Phase1Availability: Phase1AvailabilitySchema,
  ReviewStatus: ReviewStatusSchema,
  CompatibilityResultClass: CompatibilityResultClassSchema,
  SupportLevel: SupportLevelSchema,
  ParameterCode: ParameterCodeSchema,
  AlertStatus: AlertStatusSchema,
  AlertType: AlertTypeSchema,
  TaskRecurrence: TaskRecurrenceSchema,
  CompatibilityRuleType: CompatibilityRuleTypeSchema,
  CompatibilitySeverity: CompatibilitySeveritySchema,
  MaintenanceTaskEventType: MaintenanceTaskEventTypeSchema,
  PhysicalRange: PhysicalRangeSchema,
  ThresholdRange: ThresholdRangeSchema,
  TankLimits: TankLimitsSchema,
  ErrorResponse: ErrorResponseSchema,
  LoggerSettings: LoggerSettingsSchema,
  TemperatureUnit: TemperatureUnitSchema,
} as const;

export type AquaristSchemaName = keyof typeof schemas;
