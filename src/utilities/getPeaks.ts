import airpls from 'ml-airpls';
import { gsd, broadenPeaks } from 'ml-gsd';
import {
  xFindClosestIndex,
  xMedianAbsoluteDeviation,
  xyIntegration,
} from 'ml-spectra-processing';

import { FromTo } from '../types/FromTo';
import { GetPeaksOptions } from '../types/GetPeaksOptions';

import { DataXY } from 'cheminfo-types';
import { ChromPeak } from '../types/ChromPeak';

export function getPeaks(
  dataXY: DataXY,
  options: GetPeaksOptions = {},
): ChromPeak[] {
  const {
    broadenPeaksOptions = { factor: 7, overlap: false },
    gsdOptions = {
      noiseLevel: 0,
      realTopDetection: false,
      smoothY: false,
      sgOptions: { windowSize: 17, polynomial: 3 },
    },
  } = options;
  let peakList = gsd(dataXY, gsdOptions);
  peakList.sort((a, b) => a.x - b.x);
  const broadenPeaksList = broadenPeaks(peakList, broadenPeaksOptions);
  const result: ChromPeak[] = broadenPeaksList.map(function (peak) {
    const fromIndex = xFindClosestIndex(dataXY.x, peak.from.x);
    const toIndex = xFindClosestIndex(dataXY.x, peak.to.x);
    return {
      from: peak.from.x,
      to: peak.to.x,
      fromIndex,
      toIndex,
      width: peak.width,
      retentionTime: peak.x,
      intensity: peak.y,
      integral: getAuc(dataXY, { from: fromIndex, to: toIndex }),
    };
  });
  return result;
}

function getAuc(eic: DataXY, fromTo: FromTo) {
  const { from, to } = fromTo;
  let auc = 0;
  for (let i = from; i < to; i++) {
    auc += eic.y[i];
  }
  return auc;
}
