export function mean(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }

  if (numbers.length === 1) {
    return numbers[0];
  }

  let sum = 0;
  for (const value of numbers) {
    sum += value;
  }

  return sum / numbers.length;
}
