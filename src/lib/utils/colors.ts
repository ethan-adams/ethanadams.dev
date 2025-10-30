/**
 * Color utilities for choropleth map visualization
 */

/**
 * Convert a score (0-1) to a color on a gradient
 * CK3-STYLE: BOLD, SATURATED, DISTINCT colors
 * Deep Red (bad/0) -> Bright Orange (low/0.33) -> Golden Yellow (mid/0.67) -> Vibrant Green (good/1)
 */
export function scoreToColor(score: number): string {
  // Clamp score to 0-1
  score = Math.max(0, Math.min(1, score));

  let r: number, g: number, b: number;

  if (score < 0.33) {
    // Deep Red to Bright Orange (0 to 0.33)
    const t = score / 0.33; // 0 to 1
    r = 200; // Keep strong red
    g = Math.round(0 + t * 100); // 0 to 100
    b = 0;
  } else if (score < 0.67) {
    // Bright Orange to Golden Yellow (0.33 to 0.67)
    const t = (score - 0.33) / 0.34; // 0 to 1
    r = Math.round(200 + t * 55); // 200 to 255
    g = Math.round(100 + t * 155); // 100 to 255
    b = 0;
  } else {
    // Golden Yellow to Vibrant Green (0.67 to 1)
    const t = (score - 0.67) / 0.33; // 0 to 1
    r = Math.round(255 - t * 255); // 255 to 0
    g = 255; // Keep max green
    b = Math.round(0 + t * 100); // 0 to 100
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get a hex color string from RGB values
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Generate a color scale for MapLibre (array of [score, color] pairs)
 */
export function generateColorScale(steps: number = 10): [number, string][] {
  const scale: [number, string][] = [];

  for (let i = 0; i <= steps; i++) {
    const score = i / steps;
    scale.push([score, scoreToColor(score)]);
  }

  return scale;
}
