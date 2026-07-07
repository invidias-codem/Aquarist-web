import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { fahrenheitToCelsius, celsiusToFahrenheit } from '../src/units';

describe('@aquarist/shared units', () => {
  it('freezes well-known round tripe', () => {
    const c = fahrenheitToCelsius(32);
    assert.strictEqual(c, 0);
    const f = celsiusToFahrenheit(0);
    assert.strictEqual(f, 32);
  });

  it('returns Number outputs with fixed rounding', () => {
    assert.strictEqual(typeof fahrenheitToCelsius(98.6), 'number');
    assert.strictEqual(typeof celsiusToFahrenheit(37), 'number');
  });
});
