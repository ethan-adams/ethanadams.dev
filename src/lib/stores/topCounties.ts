import { writable, derived } from 'svelte/store';
import { countyScores } from './dimensions';

// Number of top counties to highlight
export const topCountiesCount = writable<5 | 10 | 25 | 50>(10);

// Derived store that calculates the top N counties based on score
export const topCounties = derived(
  [countyScores, topCountiesCount],
  ([$countyScores, $topCountiesCount]) => {
    console.log('topCounties recalculating, count:', $topCountiesCount);

    if (!$countyScores || $countyScores.length === 0) {
      return [];
    }

    // Sort by score descending and take top N
    const sorted = [...$countyScores].sort((a, b) => b.score - a.score);
    const result = sorted.slice(0, $topCountiesCount).map(c => c.fipsCode);

    console.log('Top counties:', result.slice(0, 3), '... (showing', $topCountiesCount, 'total)');
    return result;
  }
);
