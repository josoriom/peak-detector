import { DataXY, FromTo } from 'cheminfo-types';
import { RemoveNoiseOptions, removeNoise } from './utilities/removeNoise';
import { FindPeaksOptions, findPeaks } from './utilities/findPeaks';
import { GetBoundariesOptions, getBoundaries } from './utilities/getBoundaries';
import { xFindClosestIndex, xMaxIndex } from 'ml-spectra-processing';
import { Peak } from './types/Peak';

export * from './utilities/getBoundaries';
export * from './utilities/findPeaks';
export * from './utilities/removeNoise';

interface GetPeaksOptions {
  findPeaksOptions?: FindPeaksOptions;
  removeNoiseOptions?: RemoveNoiseOptions;
  getBoundariesOptions?: GetBoundariesOptions;
  filterSmallPeaksOptions?: FilterSmallPeaksOptions;
}

export function detectPeaks(data: DataXY, options: GetPeaksOptions = {}) {
  const {
    removeNoiseOptions,
    findPeaksOptions,
    getBoundariesOptions,
    filterSmallPeaksOptions,
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
  return result.filter((peak) =>
    filterSmallPeaks(peak, filterSmallPeaksOptions),
  );
}

interface FilterSmallPeaksOptions {
  widthThreshold?: number;
}

function filterSmallPeaks(peak, options: FilterSmallPeaksOptions = {}) {
  const { widthThreshold = 12 } = options;
  if (peak.toIndex - peak.fromIndex > widthThreshold) return true;
}

function getRetentionTime(data: DataXY, fromTo: FromTo) {
  const ySlice = data.y.slice(fromTo.from, fromTo.to);
  const xSlice = data.x.slice(fromTo.from, fromTo.to);
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
