import { DataXY } from 'cheminfo-types';
import { RemoveNoiseOptions, removeNoise } from './utilities/removeNoise';
import { FindPeaksOptions, findPeaks } from './utilities/findPeaks';
import { GetBoundariesOptions, getBoundaries } from './utilities/getBoundaries';

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
  const peaks = findPeaks({ x, y }, findPeaksOptions);
  const result = [];
  for (const peak of peaks) {
    const boundaries = getBoundaries({ x, y }, peak, getBoundariesOptions);
    result.push({
      from: boundaries.from.value,
      fromIndex: boundaries.from.index,
      to: boundaries.to.value,
      toIndex: boundaries.to.index,
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
  const { widthThreshold = 10 } = options;
  if (peak.toIndex - peak.fromIndex > widthThreshold) return true;
}
