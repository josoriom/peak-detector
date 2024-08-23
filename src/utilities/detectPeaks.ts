import { DataXY } from 'cheminfo-types';

import { Peak } from '../types/Peak';

import { GetBoundariesOptions, getBoundaries } from './getBoundaries';
import { GetPeaksOptions } from '../types/GetPeaksOptions';
import { getPeaks } from './getPeaks';

export interface DetectPeaksOptions {
  getPeaksOptions?: GetPeaksOptions;
  getBoundariesOptions?: GetBoundariesOptions;
  filterPeaksOptions?: FilterPeaksOptions;
}

export function detectPeaks(data: DataXY, options: DetectPeaksOptions = {}) {
  const { getPeaksOptions, getBoundariesOptions, filterPeaksOptions } = options;
  const peaks = getPeaks(data, getPeaksOptions);
  const result: Peak[] = [];
  for (const peak of peaks) {
    const boundaries = getBoundaries(
      data,
      peak.retentionTime,
      getBoundariesOptions,
    );
    const fromIndex = boundaries.from.index;
    const toIndex = boundaries.to.index;
    result.push({
      from: boundaries.from.value,
      fromIndex,
      to: boundaries.to.value,
      toIndex,
      retentionTime: peak.retentionTime,
      integral: peak.integral,
      intensity: peak.intensity,
      width: peak.width,
      numberOfPoints: toIndex - fromIndex,
    });
  }
  return filterPeaks(result, filterPeaksOptions);
}

interface FilterPeaksOptions {
  integralThreshold?: number;
  widthThreshold?: number;
}

function filterPeaks(peaks: Peak[], options: FilterPeaksOptions = {}) {
  const { integralThreshold = 0.004, widthThreshold = 10 } = options;
  let sumOfIntegrals = 0;
  if (integralThreshold !== undefined) {
    for (const peak of peaks) {
      sumOfIntegrals += peak.integral;
    }
  }

  const result: Peak[] = [];
  for (const peak of peaks) {
    let passesFilter = true;
    if (integralThreshold !== undefined) {
      const ratio = peak.integral / sumOfIntegrals;
      if (ratio < integralThreshold) {
        passesFilter = false;
      } else {
        peak.percentage = ratio;
      }
    }
    if (passesFilter && widthThreshold !== undefined) {
      if (peak.toIndex - peak.fromIndex <= widthThreshold) {
        passesFilter = false;
      }
    }

    if (passesFilter) {
      result.push(peak);
    }
  }

  return result;
}
