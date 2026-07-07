import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  TankClass,
  Phase1Availability,
  ReviewStatus,
  CompatibilityResultClass,
  SupportLevel,
  AlertType,
  AlertStatus,
  TaskRecurrence,
  ParameterCode,
  CompatibilityRuleType,
  CompatibilitySeverity,
  MaintenanceTaskEventType,
  ThresholdSource,
} from '../src/enums';

describe('@aquarist/shared enums', () => {
  it('contains expected TankClass values', () => {
    assert.deepStrictEqual(Object.values(TankClass), [
      'freshwater',
      'planted_freshwater',
      'brackish',
      'saltwater',
      'reef',
    ]);
  });

  it('contains expected Phase1Availability values', () => {
    assert.ok(Phase1Availability.SUPPORTED === 'supported');
    assert.ok(Phase1Availability.EXCLUDED === 'excluded');
    assert.ok(Phase1Availability.SEARCHABLE_ONLY === 'searchable_only');
  });

  it('contains expected ReviewStatus values', () => {
    assert.deepStrictEqual(Object.values(ReviewStatus), [
      'unreviewed',
      'needs_review',
      'reviewed',
    ]);
  });

  it('contains expected CompatibilityResultClass values', () => {
    assert.ok(CompatibilityResultClass.NOT_COMPATIBLE === 'not_compatible');
    assert.ok(CompatibilityResultClass.COMPATIBLE_WITH_CAUTION === 'compatible_with_caution');
  });

  it('contains expected SupportLevel values', () => {
    assert.ok(SupportLevel.LIMITED === 'limited');
    assert.ok(SupportLevel.FULL === 'full');
  });

  it('contains expected AlertType values', () => {
    assert.deepStrictEqual(Object.values(AlertType), [
      'parameter_threshold',
      'task_due',
    ]);
  });

  it('contains expected AlertStatus values', () => {
    assert.ok(AlertStatus.ACKNOWLEDGED === 'acknowledged');
    assert.ok(AlertStatus.RESOLVED === 'resolved');
  });

  it('contains expected TaskRecurrence values', () => {
    assert.ok(TaskRecurrence.ONE_TIME === 'one_time');
    assert.ok(TaskRecurrence.EVERY_N_DAYS === 'every_n_days');
  });

  it('contains expected ParameterCode values', () => {
    assert.ok(ParameterCode.TEMPERATURE_C === 'temperature_c');
    assert.ok(ParameterCode.PHOSPHATE_PPM === 'phosphate_ppm');
  });

  it('contains expected CompatibilityRuleType values', () => {
    assert.ok(CompatibilityRuleType.TANK_CLASS === 'tank_class');
    assert.ok(CompatibilityRuleType.GROUP_SIZE === 'group_size');
  });

  it('contains expected CompatibilitySeverity values', () => {
    assert.ok(CompatibilitySeverity.BLOCKER === 'blocker');
    assert.ok(CompatibilitySeverity.UNKNOWN === 'unknown');
  });

  it('contains expected MaintenanceTaskEventType values', () => {
    assert.ok(MaintenanceTaskEventType.COMPLETED === 'completed');
    assert.ok(MaintenanceTaskEventType.RESCHEDULED === 'rescheduled');
  });

  it('contains expected ThresholdSource values', () => {
    assert.ok(ThresholdSource.SYSTEM_DEFAULT === 'system_default');
    assert.ok(ThresholdSource.USER_OVERRIDE === 'user_override');
  });
});
