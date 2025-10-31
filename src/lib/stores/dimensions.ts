import { writable, derived } from 'svelte/store';
import type { DimensionWeight, CountyScore } from '../types';
import { dimensions } from '../data/dimensions';
import { realCountyData } from '../data/realCountyData';
import { calculateAllCountyScores } from '../utils/scoring';

/**
 * Store for dimension rank order (drag-and-drop list)
 * Higher rank = more important
 */
export const dimensionRankOrder = writable<string[]>(
  dimensions.map((d) => d.id) // Initial order
);

/**
 * Bias curve exponent (1.0 = more even, 3.0 = more extreme)
 * Controls how much the top dimensions dominate the scoring
 */
export const biasCurve = writable<number>(2.0);

/**
 * Derived store: convert rank order to weights
 * Top rank gets highest weight, exponentially decreasing
 */
export const dimensionWeights = derived(
  [dimensionRankOrder, biasCurve],
  ([$rankOrder, $biasCurve]) => {
    const weights: DimensionWeight[] = [];
    const n = $rankOrder.length;

    // Convert rank to weight using exponential decay
    // Rank 1 (top) gets much more weight than rank 4 (bottom)
    $rankOrder.forEach((dimensionId, index) => {
      const rank = index + 1; // 1-indexed rank
      // Weight formula: base^(n - rank) where base is controlled by biasCurve
      // Lower biasCurve = more even distribution (closer to 1)
      // Higher biasCurve = more extreme splits (top dimensions dominate)
      const rawWeight = Math.pow($biasCurve, n - rank);
      weights.push({ dimensionId, weight: rawWeight });
    });

    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    weights.forEach((w) => {
      w.weight = w.weight / totalWeight;
    });

    return weights;
  }
);

/**
 * Derived store: calculate county scores based on current weights
 */
export const countyScores = derived(
  dimensionWeights,
  ($weights) => {
    return calculateAllCountyScores(realCountyData, dimensions, $weights);
  }
);

/**
 * Update the rank order of dimensions
 */
export function setDimensionRankOrder(newOrder: string[]) {
  dimensionRankOrder.set(newOrder);
}
