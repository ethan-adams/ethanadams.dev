import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import type { DimensionWeight, CountyScore } from '../../types';

// Mock countyScores store
const { mockCountyScores, mockDimensionRankOrder, mockDimensionWeights } = vi.hoisted(() => {
  function createWritable<T>(initial: T) {
    let value = initial;
    const subscribers = new Set<(value: T) => void>();

    return {
      set(next: T) {
        value = next;
        subscribers.forEach((subscriber) => subscriber(value));
      },
      subscribe(subscriber: (value: T) => void) {
        subscriber(value);
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    };
  }

  return {
    mockCountyScores: createWritable<CountyScore[]>([]),
    mockDimensionRankOrder: createWritable<string[]>([]),
    mockDimensionWeights: createWritable<DimensionWeight[]>([]),
  };
});

// Mock the dimensions module
vi.mock('../dimensions', () => ({
  countyScores: mockCountyScores,
  dimensionRankOrder: mockDimensionRankOrder,
  dimensionWeights: mockDimensionWeights,
  setDimensionRankOrder: () => {},
}));

// Import after mocking
const { topCounties, topCountiesCount } = await import('../topCounties');

describe('topCounties store', () => {
  beforeEach(() => {
    // Reset to default
    topCountiesCount.set(10);
    mockCountyScores.set([]);
  });

  it('should return top 10 counties by default', () => {
    const mockScores = Array.from({ length: 100 }, (_, i) => ({
      fipsCode: `${i.toString().padStart(5, '0')}`,
      score: 1 - i / 100, // Descending scores
      normalizedValues: {},
    }));

    mockCountyScores.set(mockScores);

    const top = get(topCounties);
    expect(top).toHaveLength(10);
    expect(top[0]).toBe('00000');
  });

  it('should update when topCountiesCount changes', () => {
    const mockScores = Array.from({ length: 100 }, (_, i) => ({
      fipsCode: `${i.toString().padStart(5, '0')}`,
      score: 1 - i / 100, // Descending scores
      normalizedValues: {},
    }));

    mockCountyScores.set(mockScores);

    topCountiesCount.set(5);
    expect(get(topCounties)).toHaveLength(5);

    topCountiesCount.set(25);
    expect(get(topCounties)).toHaveLength(25);

    topCountiesCount.set(50);
    expect(get(topCounties)).toHaveLength(50);
  });

  it('should return empty array when no scores', () => {
    mockCountyScores.set([]);
    expect(get(topCounties)).toEqual([]);
  });

  it('should sort counties by score descending', () => {
    const mockScores = [
      { fipsCode: '00001', score: 0.5, normalizedValues: {} },
      { fipsCode: '00002', score: 0.9, normalizedValues: {} },
      { fipsCode: '00003', score: 0.3, normalizedValues: {} },
      { fipsCode: '00004', score: 0.7, normalizedValues: {} },
    ];

    mockCountyScores.set(mockScores);
    topCountiesCount.set(5);

    const top = get(topCounties);
    expect(top).toEqual(['00002', '00004', '00001', '00003']);
  });
});
