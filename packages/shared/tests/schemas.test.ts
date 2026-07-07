import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { schemas } from '../src/schemas';

describe('@aquarist/shared schemas', () => {
  it('accepts valid TankClass values and rejects invalid', () => {
    const schema = schemas.TankClass;
    assert.strictEqual(schema.parse('freshwater'), 'freshwater');
    assert.throws(() => schema.parse('ocean'));
  });

  it('parses LoggerSettings successfully', () => {
    const schema = schemas.LoggerSettings;
    assert.deepStrictEqual(
      schema.parse({ maxLogReadings: 10, dedupWindowSeconds: 60, backdateDays: 365, maxBackdateDays: 365 }),
      { maxLogReadings: 10, dedupWindowSeconds: 60, backdateDays: 365, maxBackdateDays: 365 }
    );
  });

  it('parses ErrorResponse with optional errors omitted', () => {
    const schema = schemas.ErrorResponse;
    const payload = {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Unexpected failure',
    };
    assert.strictEqual(schema.parse(payload).status, 500);
    assert.strictEqual(schema.parse(payload).errors, undefined);
  });

  it('parses ErrorResponse with optional errors required due to explicit input', () => {
    const schema = schemas.ErrorResponse;
    const payload = {
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
      message: 'Not found',
      errors: [{ field: 'id', message: 'Missing' }],
    };
    assert.strictEqual(schema.parse(payload).status, 404);
    assert.strictEqual(schema.parse(payload).errors?.[0]?.field, 'id');
  });

  it('rejects missing message in ErrorResponse', () => {
    const schema = schemas.ErrorResponse;
    assert.throws(() => schema.parse({ status: 400, code: 'VALIDATION_ERROR' }));
  });

  it('rejects invalid status type in ErrorResponse', () => {
    const schema = schemas.ErrorResponse;
    assert.throws(() => schema.parse({ status: 'bad', code: 'VALIDATION_ERROR', message: 'x' }));
  });

  it('parses TankLimits and respects field caps', () => {
    const schema = schemas.TankLimits;
    assert.deepStrictEqual(
      schema.parse({ TANK_NAME: { min: 1, max: 100 }, TANK_NOTES: { max: 2000 }, SPECIES_COMMON_NAME: { min: 1, max: 100 }, SPECIES_SPECIES_NAME: { max: 200 }, LIVESTOCK_NOTES: { max: 1000 }, TASK_TITLE: { min: 1, max: 200 }, TASK_NOTES: { max: 1000 } }),
      { TANK_NAME: { min: 1, max: 100 }, TANK_NOTES: { max: 2000 }, SPECIES_COMMON_NAME: { min: 1, max: 100 }, SPECIES_SPECIES_NAME: { max: 200 }, LIVESTOCK_NOTES: { max: 1000 }, TASK_TITLE: { min: 1, max: 200 }, TASK_NOTES: { max: 1000 } }
    );
    assert.throws(() => schema.parse({ TANK_NAME: { min: 0 } }));
  });

  it('parses PhysicalRange and rejects bad unit types', () => {
    const schema = schemas.PhysicalRange;
    assert.deepStrictEqual(
      schema.parse({ min: 0, max: 10, unit: 'ppm' }),
      { min: 0, max: 10, unit: 'ppm' }
    );
    assert.throws(() => schema.parse({ min: 0, max: 10, unit: 7 }));
    assert.throws(() => schema.parse({ min: 0, max: 10 }));
  });

  it('rejects negative LoggerSettings values', () => {
    const schema = schemas.LoggerSettings;
    assert.throws(() => schema.parse({ maxLogReadings: -1, dedupWindowSeconds: 60, backdateDays: 1, maxBackdateDays: 1 }));
  });

  it('allows enum alias matching for ParameterCode', () => {
    const schema = schemas.ParameterCode;
    assert.strictEqual(schema.parse('salinity_sg'), 'salinity_sg');
  });

  it('rejects unknown alert/status enums', () => {
    assert.throws(() => schemas.AlertStatus.parse('spam'));
    assert.throws(() => schemas.AlertType.parse('meme'));
  });

  it('rejects unsupported compatibility rule types', () => {
    assert.throws(() => schemas.CompatibilityRuleType.parse('raw_fish_count'));
  });
});