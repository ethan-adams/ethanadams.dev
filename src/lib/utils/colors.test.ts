import { describe, it, expect } from 'vitest';
import { scoreToColor } from './colors';

describe('Color Utilities', () => {
  describe('scoreToColor - CK3-style bold colors', () => {
    it('should return purple for score 0 (worst)', () => {
      const color = scoreToColor(0);
      expect(color).toBe('rgb(120, 0, 120)');
    });

    it('should return dark orange for score 0.33 (low)', () => {
      const color = scoreToColor(0.33);
      expect(color).toBe('rgb(200, 72, 0)');
    });

    it('should return yellow-green for score 0.67 (mid)', () => {
      const color = scoreToColor(0.67);
      expect(color).toBe('rgb(195, 255, 30)');
    });

    it('should return cyan-green for score 1 (best)', () => {
      const color = scoreToColor(1);
      expect(color).toBe('rgb(0, 255, 200)');
    });

    it('should handle scores below 0 (clamp to 0)', () => {
      const color = scoreToColor(-0.5);
      expect(color).toBe('rgb(120, 0, 120)');
    });

    it('should handle scores above 1 (clamp to 1)', () => {
      const color = scoreToColor(1.5);
      expect(color).toBe('rgb(0, 255, 200)');
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

      expect(deepRed).not.toBe(orange);
      expect(orange).not.toBe(yellow);
      expect(yellow).not.toBe(green);
      expect(deepRed).not.toBe(green);
    });

    it('should stay inside the intended bold channel bounds', () => {
      const testScores = [0, 0.25, 0.5, 0.75, 1.0];

      testScores.forEach(score => {
        const color = scoreToColor(score);
        const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
        expect(match).toBeTruthy();

        if (match) {
          const [_, r, g, b] = match.map(Number);
          expect(r).toBeGreaterThanOrEqual(0);
          expect(g).toBeGreaterThanOrEqual(0);
          expect(b).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(255);
          expect(g).toBeLessThanOrEqual(255);
          expect(b).toBeLessThanOrEqual(255);
          expect(Math.max(r, g, b)).toBeGreaterThanOrEqual(120);
        }
      });
    });
  });
});
