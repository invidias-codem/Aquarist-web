import { describe, expect, it } from 'vitest';
import { ThresholdSource } from '../src/enums';
import { fahrenheitToCelsius, celsiusToFahrenheit } from '../src/units';

describe('enums', () => {
  it('has a temperature threshold source', () => {
    expect(ThresholdSource.SYSTEM_DEFAULT).toBe('system_default');
    expect(ThresholdSource.USER_OVERRIDE).toBe('user_override');
  });
});

describe('unit conversion', () => {
  it('converts fahrenheit to celsius with one decimal', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
    expect(fahrenheitToCelsius(78)).toBeCloseTo(25.6, 1);
    expect(fahrenheitToCelsius(75).toFixed(1)).toBe('23.9');
  });

  it('converts celsius to fahrenheit with one decimal', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(26)).toBeCloseTo(78.8, 1);
  });
});
