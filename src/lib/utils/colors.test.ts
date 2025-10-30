import { describe, it, expect } from 'vitest';
import { scoreToColor } from './colors';

describe('Color Utilities', () => {
  describe('scoreToColor - CK3-style bold colors', () => {
    it('should return deep red for score 0 (worst)', () => {
      const color = scoreToColor(0);
      expect(color).toBe('rgb(200, 0, 0)'); // Deep red
    });

    it('should return bright orange for score 0.33 (low)', () => {
      const color = scoreToColor(0.33);
      expect(color).toBe('rgb(200, 100, 0)'); // Bright orange
    });

    it('should return golden yellow for score 0.67 (mid)', () => {
      const color = scoreToColor(0.67);
      expect(color).toBe('rgb(255, 255, 0)'); // Golden yellow
    });

    it('should return vibrant green for score 1 (best)', () => {
      const color = scoreToColor(1);
      expect(color).toBe('rgb(0, 255, 100)'); // Vibrant green
    });

    it('should handle scores below 0 (clamp to 0)', () => {
      const color = scoreToColor(-0.5);
      expect(color).toBe('rgb(200, 0, 0)'); // Should clamp to deep red
    });

    it('should handle scores above 1 (clamp to 1)', () => {
      const color = scoreToColor(1.5);
      expect(color).toBe('rgb(0, 255, 100)'); // Should clamp to vibrant green
    });

    it('should return valid RGB format for all scores', () => {
      const color = scoreToColor(0.75);
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should produce distinctly different colors across the spectrum', () => {
      const deepRed = scoreToColor(0.1);    // Should be reddish
      const orange = scoreToColor(0.4);      // Should be orange
      const yellow = scoreToColor(0.6);      // Should be yellowish
      const green = scoreToColor(0.9);       // Should be greenish

      // All colors should be different
      expect(deepRed).not.toBe(orange);
      expect(orange).not.toBe(yellow);
      expect(yellow).not.toBe(green);
      expect(deepRed).not.toBe(green);

      console.log('Color spectrum test:');
      console.log('  0.1 (red):', deepRed);
      console.log('  0.4 (orange):', orange);
      console.log('  0.6 (yellow):', yellow);
      console.log('  0.9 (green):', green);
    });

    it('should have high color contrast for visibility', () => {
      // Test that colors are bold and saturated (no pastels)
      const testScores = [0, 0.25, 0.5, 0.75, 1.0];

      testScores.forEach(score => {
        const color = scoreToColor(score);
        const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
        expect(match).toBeTruthy();

        if (match) {
          const [_, r, g, b] = match.map(Number);
          // At least one channel should be strong (>150) for bold colors
          const hasStrongChannel = r > 150 || g > 150 || b > 150;
          expect(hasStrongChannel).toBe(true);

          console.log(`Score ${score.toFixed(2)}: ${color}`);
        }
      });
    });
  });
});
