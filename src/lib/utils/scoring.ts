import type { Dimension, DimensionWeight, CountyData, CountyScore } from '../types';

/**
 * Normalize a value to 0-1 range based on dimension min/max
 * Handles both "higher is better" and "lower is better" dimensions
 */
export function normalizeValue(
  value: number,
  dimension: Dimension
): number {
  const range = dimension.max - dimension.min;
  if (range === 0) return 0.5; // Avoid division by zero

  let normalized = (value - dimension.min) / range;

  // If lower is better, invert the normalized value
  if (!dimension.higherIsBetter) {
    normalized = 1 - normalized;
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Calculate weighted score for a county
 * Returns a CountyScore with the overall score and normalized values for each dimension
 */
export function calculateCountyScore(
  countyData: CountyData,
  dimensions: Dimension[],
  weights: DimensionWeight[]
): CountyScore {
  const normalizedValues: Record<string, number> = {};

  // First pass: identify available dimensions and their weights
  const availableDimensions: { dimension: Dimension; weight: number; normalized: number }[] = [];

  for (const dimension of dimensions) {
    const weight = weights.find((w) => w.dimensionId === dimension.id)?.weight ?? 0;
    const rawValue = countyData.values[dimension.id];

    if (rawValue !== undefined && weight > 0) {
      const normalized = normalizeValue(rawValue, dimension);
      normalizedValues[dimension.id] = normalized;
      availableDimensions.push({ dimension, weight, normalized });
    }
  }

  // Calculate total weight of available dimensions
  const totalAvailableWeight = availableDimensions.reduce((sum, d) => sum + d.weight, 0);

  // Renormalize weights so they sum to 1.0 among available dimensions
  let weightedSum = 0;
  if (totalAvailableWeight > 0) {
    for (const { weight, normalized } of availableDimensions) {
      const renormalizedWeight = weight / totalAvailableWeight;
      weightedSum += normalized * renormalizedWeight;
    }
  }

  // Score is now the weighted average with renormalized weights
  const score = weightedSum;

  return {
    fipsCode: countyData.fipsCode,
    score,
    normalizedValues,
  };
}

/**
 * Calculate scores for multiple counties
 */
export function calculateAllCountyScores(
  countyDataList: CountyData[],
  dimensions: Dimension[],
  weights: DimensionWeight[]
): CountyScore[] {
  return countyDataList.map((countyData) =>
    calculateCountyScore(countyData, dimensions, weights)
  );
}
