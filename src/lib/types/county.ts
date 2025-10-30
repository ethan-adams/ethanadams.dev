/**
 * County geographic and administrative data
 */
export interface County {
  fipsCode: string; // 5-digit FIPS code (unique identifier)
  name: string; // e.g., "Eagle County"
  state: string; // e.g., "Colorado"
  stateAbbrev: string; // e.g., "CO"
}

/**
 * Values for all dimensions for a single county
 */
export interface CountyData {
  fipsCode: string;
  values: Record<string, number>; // dimensionId -> raw value
}

/**
 * Computed score for a county based on weighted dimensions
 */
export interface CountyScore {
  fipsCode: string;
  score: number; // 0-1, normalized weighted average
  normalizedValues: Record<string, number>; // dimensionId -> normalized value (0-1)
}
