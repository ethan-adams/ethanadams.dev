/**
 * Color utilities for choropleth map visualization
 */

/**
 * Convert a score (0-1) to a color on a gradient
 * Extended range: Purple (terrible) -> Red (bad) -> Orange (low) -> Yellow (mid) -> Green (good) -> Cyan (excellent)
 * Adjusted thresholds to match actual county score distributions (most counties 0.4-0.8)
 */
export function scoreToColor(score: number): string {
  // Clamp score to 0-1
  score = Math.max(0, Math.min(1, score));

  let r: number, g: number, b: number;

  if (score < 0.15) {
    // Purple to Dark Red (0 to 0.15) - Terrible scores
    const t = score / 0.15;
    r = Math.round(120 + t * 80); // 120 to 200
    g = 0;
    b = Math.round(120 - t * 120); // 120 to 0 (purple fades out)
  } else if (score < 0.35) {
    // Dark Red to Bright Red/Orange (0.15 to 0.35) - Bad scores
    const t = (score - 0.15) / 0.20;
    r = 200;
    g = Math.round(0 + t * 80); // 0 to 80
    b = 0;
  } else if (score < 0.55) {
    // Orange to Yellow (0.35 to 0.55) - Below average
    const t = (score - 0.35) / 0.20;
    r = Math.round(200 + t * 55); // 200 to 255
    g = Math.round(80 + t * 175); // 80 to 255
    b = 0;
  } else if (score < 0.75) {
    // Yellow to Light Green (0.55 to 0.75) - Average to good
    const t = (score - 0.55) / 0.20;
    r = Math.round(255 - t * 100); // 255 to 155
    g = 255;
    b = Math.round(0 + t * 50); // 0 to 50
  } else {
    // Light Green to Vibrant Cyan-Green (0.75 to 1.0) - Excellent
    const t = (score - 0.75) / 0.25;
    r = Math.round(155 - t * 155); // 155 to 0
    g = 255;
    b = Math.round(50 + t * 150); // 50 to 200
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
