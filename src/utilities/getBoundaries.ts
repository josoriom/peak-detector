import { DataXY } from 'cheminfo-types';
import { sgg } from 'ml-savitzky-golay-generalized';
import { xFindClosestIndex } from 'ml-spectra-processing';

export interface GetBoundariesOptions {
  boundariesOptions?: { epsilon: number };
  SGGOptions?: { windowSize: number; derivative: number; polynomial: number };
}

/**
 * Finds the boundaries of a peak in an XY data set.
 *
 * @param data - The input data containing x and y arrays.
 * @param peakPosition - The x value around which to find the peak boundaries.
 * @param options - Optional settings for boundary finding.
 * @returns An object containing the 'from' and 'to' boundary points, each with an index and value. If no boundary is found, the index and value will be null.
 */
export function getBoundaries(
  data: DataXY,
  peakPosition: number,
  options: GetBoundariesOptions = {},
) {
  const {
    boundariesOptions = { epsilon: 1e-5 },
    SGGOptions = { windowSize: 13, derivative: 0, polynomial: 3 },
  } = options;
  const { x, y } = data;
  const index = xFindClosestIndex(x, peakPosition);
  const smoothY = sgg(y, x, SGGOptions);
  return {
    from: getBoundary({ x, y: smoothY }, index, 'left', boundariesOptions),
    to: getBoundary({ x, y: smoothY }, index, 'right', boundariesOptions),
  };
}

/**
 * Determines the boundary index and value in a specified direction from a given index in an XY data set.
 * @param data - The input data containing x and y arrays.
 * @param index - The starting index from which to search for the boundary.
 * @param direction - The direction in which to search for the boundary ('right' for increasing index, 'left' for decreasing index).
 * @param options- Optional settings.
 * @returns An object containing the boundary index and its corresponding x value. If no boundary is found, both properties are null.
 */
function getBoundary(
  data: DataXY,
  index: number,
  direction: 'right' | 'left',
  options: {
    /**
     * A small value to prevent division by zero when calculating the slope.
     */
    epsilon?: number;
  } = {},
) {
  const { epsilon } = options;
  const { x, y } = data;
  let position = direction === 'right' ? index + 1 : index - 1;
  const increment = direction === 'right' ? 1 : -1;
  while (position >= 0 && position < x.length - 1) {
    const slope =
      (y[position + increment] - y[position]) /
      (x[position + increment] - x[position] + epsilon);
    if (
      (direction === 'right' && slope >= 0) ||
      (direction === 'left' && slope <= 0)
    ) {
      return { index: position, value: x[position] };
    }
    position += increment;
  }
  return { index: null, value: null };
}
