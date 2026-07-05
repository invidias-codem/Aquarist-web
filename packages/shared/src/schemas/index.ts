import { z } from 'zod';
import { TankClass } from './enums';
import { ParameterCode } from './enums';

export const TankClassSchema = z.nativeEnum(TankClass);

export const ParameterCodeSchema = z.nativeEnum(ParameterCode);

const MeasurementSchema = z.object({
  parameter_code: ParameterCodeSchema,
  value: z.number(),
  unit: z.string().optional(),
});

export const ParameterLogCreateSchema = z.object({
  tank_id: z.string().uuid(),
  observed_at: z.string().optional(),
  measurements: z.array(MeasurementSchema).min(1).max(10),
});

export const MaintenanceTaskCreateSchema = z.object({
  tank_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  due_at: z.string().optional(),
  recurrence: z.string().optional(),
  interval_days: z.number().int().positive().optional(),
  parameter_code: z.string().optional(),
});
