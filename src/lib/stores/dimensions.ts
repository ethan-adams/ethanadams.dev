import { writable, derived } from 'svelte/store';
import type { DimensionWeight, CountyScore } from '../types';
import { dimensions } from '../data/dimensions';
import { expandedCountyData } from '../data/expandedCountyData';
import { calculateAllCountyScores } from '../utils/scoring';

/**
 * Store for dimension rank order (drag-and-drop list)
 * Higher rank = more important
 */
export const dimensionRankOrder = writable<string[]>(
  dimensions.map((d) => d.id) // Initial order
);

/**
 * Derived store: convert rank order to weights
 * Top rank gets highest weight, exponentially decreasing
 */
export const dimensionWeights = derived(
  dimensionRankOrder,
  ($rankOrder) => {
    const weights: DimensionWeight[] = [];
    const n = $rankOrder.length;

    // Convert rank to weight using exponential decay
    // Rank 1 (top) gets much more weight than rank 4 (bottom)
    $rankOrder.forEach((dimensionId, index) => {
      const rank = index + 1; // 1-indexed rank
      // Weight formula: 2^(n - rank) / sum
      // E.g., for 4 dimensions: [8, 4, 2, 1] → normalized to [0.53, 0.27, 0.13, 0.07]
      const rawWeight = Math.pow(2, n - rank);
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
    return calculateAllCountyScores(expandedCountyData, dimensions, $weights);
  }
);

/**
 * Update the rank order of dimensions
 */
export function setDimensionRankOrder(newOrder: string[]) {
  dimensionRankOrder.set(newOrder);
}
