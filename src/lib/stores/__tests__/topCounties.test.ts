import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import { topCountiesCount } from '../topCounties';

// Mock countyScores store
const mockCountyScores = writable<any[]>([]);

// Mock the dimensions module
vi.mock('../dimensions', () => ({
  countyScores: mockCountyScores,
  dimensionRankOrder: writable([]),
  dimensionWeights: writable([]),
  setDimensionRankOrder: vi.fn(),
}));

// Import after mocking
const { topCounties } = await import('../topCounties');

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
      { fipsCode: '00001', score: 0.5 },
      { fipsCode: '00002', score: 0.9 },
      { fipsCode: '00003', score: 0.3 },
      { fipsCode: '00004', score: 0.7 },
    ];

    mockCountyScores.set(mockScores);
    topCountiesCount.set(3);

    const top = get(topCounties);
    expect(top).toEqual(['00002', '00004', '00001']);
  });
});
