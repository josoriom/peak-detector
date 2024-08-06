import { NumberArray } from 'cheminfo-types';
import { xMedian, xStandardDeviation } from 'ml-spectra-processing';

export interface RemoveNoiseOptions {
  filterOptions?: { tolerance: number };
}

/**
 * Removes noise from an array of numbers by iteratively setting values below a calculated threshold to zero.
 * @param array - The array of numbers to process.
 * @returns A new array with noise values set to zero.
 */
export function removeNoise(
  array: NumberArray,
  options: RemoveNoiseOptions = {},
) {
  const { filterOptions = { tolerance: 200 } } = options;
  const result = array.slice();
  let counter = 0;
  do {
    counter = 0;
    const values = result.filter((item) => item !== 0);
    if (values.length === 0) break;
    const median = xMedian(values);
    const noiseValues = filterByValue(values, median, filterOptions);
    if (noiseValues.length <= 10) break;
    const sdNoise = xStandardDeviation(noiseValues);
    const threshold = xMedian(noiseValues) + sdNoise;
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== 0 && result[i] < threshold) {
        result[i] = 0;
        counter++;
      }
    }
  } while (counter > 0);
  return result;
}

/**
 * Filters an array of numbers, returning only those within a specified tolerance of a given value.
 *
 * @param array - The array of numbers to filter.
 * @param value - The target value to compare against.
 * @param [options] - Optional settings.
 * @param [options.tolerance=500] - The tolerance range within which numbers are considered a match.
 * @returns A new array containing the numbers from the input array that fall within the specified tolerance of the target value.
 */
function filterByValue(
  array: NumberArray,
  value: number,
  options: { tolerance?: number } = {},
) {
  const { tolerance } = options;
  const result = [];
  for (const item of array) {
    if (item > value - tolerance && item < value + tolerance) {
      result.push(item);
    }
  }
  return result;
}
