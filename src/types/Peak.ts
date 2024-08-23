export interface Peak {
  from: number;
  fromIndex: number;
  to: number;
  toIndex: number;
  retentionTime: number;
  integral: number;
  intensity: number;
  width: number;
  numberOfPoints: number;
  percentage?: number;
}
