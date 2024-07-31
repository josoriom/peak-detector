export interface Peak {
  from: number;
  fromIndex: number;
  to: number;
  toIndex: number;
  retentionTime: number;
  integral: number;
  percentage?: number;
}
