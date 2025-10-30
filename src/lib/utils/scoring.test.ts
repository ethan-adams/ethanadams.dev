import { describe, it, expect } from 'vitest';
import { normalizeValue, calculateCountyScore } from './scoring';
import type { Dimension, CountyData, DimensionWeight } from '../types';

describe('Scoring Utilities', () => {
  describe('normalizeValue', () => {
    it('should normalize a value in the middle of range', () => {
      const dimension: Dimension = {
        id: 'test',
        name: 'Test',
        description: 'Test dimension',
        unit: 'units',
        min: 0,
        max: 100,
        higherIsBetter: true,
      };

      expect(normalizeValue(50, dimension)).toBe(0.5);
    });

    it('should normalize minimum value to 0', () => {
      const dimension: Dimension = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        unit: 'units',
        min: 0,
        max: 100,
        higherIsBetter: true,
      };

      expect(normalizeValue(0, dimension)).toBe(0);
    });

    it('should normalize maximum value to 1', () => {
      const dimension: Dimension = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        unit: 'units',
        min: 0,
        max: 100,
        higherIsBetter: true,
      };

      expect(normalizeValue(100, dimension)).toBe(1);
    });

    it('should invert values when higherIsBetter is false', () => {
      const dimension: Dimension = {
        id: 'cost',
        name: 'Cost',
        description: 'Lower is better',
        unit: '$',
        min: 0,
        max: 100,
        higherIsBetter: false, // Lower values are better
      };

      // Low value (10) should normalize to high score (0.9)
      expect(normalizeValue(10, dimension)).toBeCloseTo(0.9, 10);
      // High value (90) should normalize to low score (0.1)
      expect(normalizeValue(90, dimension)).toBeCloseTo(0.1, 10);
    });
  });

  describe('calculateCountyScore', () => {
    const testDimensions: Dimension[] = [
      {
        id: 'dim1',
        name: 'Dimension 1',
        description: 'Test dimension 1',
        unit: 'units',
        min: 0,
        max: 100,
        higherIsBetter: true,
      },
      {
        id: 'dim2',
        name: 'Dimension 2',
        description: 'Test dimension 2',
        unit: 'units',
        min: 0,
        max: 100,
        higherIsBetter: true,
      },
    ];

    const testCountyData: CountyData = {
      fipsCode: '12345',
      values: {
        dim1: 100, // Max value = normalized 1.0
        dim2: 0,   // Min value = normalized 0.0
      },
    };

    it('should calculate correct score with equal weights', () => {
      const weights: DimensionWeight[] = [
        { dimensionId: 'dim1', weight: 0.5 },
        { dimensionId: 'dim2', weight: 0.5 },
      ];

      const result = calculateCountyScore(testCountyData, testDimensions, weights);

      expect(result.fipsCode).toBe('12345');
      expect(result.score).toBe(0.5); // (1.0 * 0.5 + 0.0 * 0.5) / 1.0
    });

    it('should calculate correct score with unequal weights', () => {
      const weights: DimensionWeight[] = [
        { dimensionId: 'dim1', weight: 0.8 },
        { dimensionId: 'dim2', weight: 0.2 },
      ];

      const result = calculateCountyScore(testCountyData, testDimensions, weights);

      expect(result.score).toBe(0.8); // (1.0 * 0.8 + 0.0 * 0.2) / 1.0
    });

    it('should ignore dimensions with zero weight', () => {
      const weights: DimensionWeight[] = [
        { dimensionId: 'dim1', weight: 1.0 },
        { dimensionId: 'dim2', weight: 0.0 },
      ];

      const result = calculateCountyScore(testCountyData, testDimensions, weights);

      expect(result.score).toBe(1.0); // Only dim1 counts
    });

    it('should return 0 if all weights are zero', () => {
      const weights: DimensionWeight[] = [
        { dimensionId: 'dim1', weight: 0.0 },
        { dimensionId: 'dim2', weight: 0.0 },
      ];

      const result = calculateCountyScore(testCountyData, testDimensions, weights);

      expect(result.score).toBe(0);
    });
  });
});
