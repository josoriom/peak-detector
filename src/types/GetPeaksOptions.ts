export interface GetPeaksOptions {
  heightFilter?: number;
  broadenPeaksOptions?: { factor: number; overlap: boolean };
  gsdOptions?: {
    noiseLevel: number;
    realTopDetection: boolean;
    smoothY: boolean;
    sgOptions: { windowSize: number; polynomial: number };
  };
  threshold?: number;
}
