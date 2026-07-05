export function fahrenheitToCelsius(fahrenheit: number): number {
  return Number(((fahrenheit - 32) * (5 / 9)).toFixed(1));
}

export function celsiusToFahrenheit(celsius: number): number {
  return Number((celsius * (9 / 5) + 32).toFixed(1));
}
