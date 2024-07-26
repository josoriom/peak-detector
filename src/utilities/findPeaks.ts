import { DataXY } from 'cheminfo-types';
import { sgg } from 'ml-savitzky-golay-generalized';

export interface FindPeaksOptions {
  /**
   * A small value to prevent division by zero when calculating slope.
   * @default 1e-5
   */
  epsilon?: number;
  /**
   * Options for Savitzky-Golay smoothing.
   */
  sggOptions?: {
    /**
     * The window size for the Savitzky-Golay filter.
     * @default 13
     */
    windowSize: number;
    /**
     * The order of the derivative to compute.
     * @default 1
     */
    derivative: number;
    /**
     * The order of the polynomial to use in the smoothing filter.
     * @default 3
     */
    polynomial: number;
  };
}

/**
 * Identifies peaks in a given set of XY data using Savitzky-Golay smoothing.
 *
 * @param data - The input data containing x and y arrays.
 * @param [options={}] - Optional settings for peak finding.
 * @returns An array of x values where peaks are identified.
 */
export function findPeaks(data: DataXY, options: FindPeaksOptions = {}) {
  const { x } = data;
  const {
    epsilon = 1e-5,
    sggOptions = { windowSize: 13, derivative: 1, polynomial: 3 },
  } = options;
  const peaks = [];
  let isRecording = false;
  const y = sgg(data.y, x, sggOptions);
  for (let i = 0; i < y.length - 1; i++) {
    const deltaX = x[i + 1] - x[i];
    const deltaY = y[i + 1] - y[i];
    const slope = deltaY / (deltaX + epsilon);
    if (slope > 0 && y[i] > 0) {
      isRecording = true;
    }
    if (isRecording && slope < 0 && y[i] < 0) {
      isRecording = false;
      peaks.push(x[i]);
    }
  }
  return peaks;
}
