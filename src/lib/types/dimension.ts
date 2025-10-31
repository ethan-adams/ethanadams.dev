/**
 * Represents a single dimension that can be weighted for county scoring
 */
export interface Dimension {
  id: string;
  name: string;
  icon?: string; // Emoji icon for visual identification
  description: string;
  unit: string;
  min: number; // Min value in dataset
  max: number; // Max value in dataset
  higherIsBetter: boolean; // true = higher values are better, false = lower is better
  sourceUrl?: string; // Optional URL to data source
}

/**
 * User's weight for a dimension (0-1, where 0 = ignore, 1 = max importance)
 */
export interface DimensionWeight {
  dimensionId: string;
  weight: number; // 0 to 1
}
