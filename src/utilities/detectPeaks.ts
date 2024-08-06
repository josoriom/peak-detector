import { DataXY, FromTo } from 'cheminfo-types';
import { xFindClosestIndex, xMaxIndex } from 'ml-spectra-processing';

import { Peak } from '../types/Peak';

import { FindPeaksOptions, findPeaks } from './findPeaks';
import { GetBoundariesOptions, getBoundaries } from './getBoundaries';
import { RemoveNoiseOptions, removeNoise } from './removeNoise';

export interface DetectPeaksOptions {
  findPeaksOptions?: FindPeaksOptions;
  removeNoiseOptions?: RemoveNoiseOptions;
  getBoundariesOptions?: GetBoundariesOptions;
  filterPeaksOptions?: FilterPeaksOptions;
}

export function detectPeaks(data: DataXY, options: DetectPeaksOptions = {}) {
  const {
    removeNoiseOptions,
    findPeaksOptions,
    getBoundariesOptions,
    filterPeaksOptions,
  } = options;
  const { x } = data;
  const y = removeNoise(data.y, removeNoiseOptions);
  const datum = { x, y };
  const peaks = findPeaks(datum, findPeaksOptions);
  const result: Peak[] = [];
  for (const peak of peaks) {
    const boundaries = getBoundaries(datum, peak, getBoundariesOptions);
    result.push({
      from: boundaries.from.value,
      fromIndex: boundaries.from.index,
      to: boundaries.to.value,
      toIndex: boundaries.to.index,
      retentionTime: getRetentionTime(datum, {
        from: boundaries.from.index,
        to: boundaries.to.index,
      }),
      integral: getAuc(datum, {
        from: boundaries.from.value,
        to: boundaries.to.value,
      }),
    });
  }
  return filterPeaks(result, filterPeaksOptions);
}

interface FilterPeaksOptions {
  integralThreshold?: number;
  widthThreshold?: number;
}

function filterPeaks(peaks: Peak[], options: FilterPeaksOptions = {}) {
  const { integralThreshold = 0.005, widthThreshold = 15 } = options;
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

function getRetentionTime(data: DataXY, fromTo: FromTo) {
  const ySlice = data.y.slice(fromTo.from, fromTo.to);
  const xSlice = data.x.slice(fromTo.from, fromTo.to);
  if (ySlice.length === 0) {
    return 0;
  }
  const index = xMaxIndex(ySlice);
  return xSlice[index];
}

function getAuc(eic: DataXY, fromTo: FromTo) {
  const { from, to } = fromTo;
  const fromIndex = xFindClosestIndex(eic.x, from);
  const toIndex = xFindClosestIndex(eic.x, to);

  let auc = 0;
  for (let i = fromIndex; i < toIndex; i++) {
    auc += eic.y[i];
  }
  return auc;
}
