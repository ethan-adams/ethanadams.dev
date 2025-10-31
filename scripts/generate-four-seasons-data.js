import { countyDatabase } from '../src/lib/data/countyDatabase.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calculate Four Seasons Score based on geography
 *
 * Ideal regions:
 * - Latitude 38-45°N (temperate zone with distinct seasons)
 * - Not too far south (avoids hot humid summers)
 * - Not coastal California/PNW (avoids mild winters)
 * - Mountainous areas get bonus (elevation = snow)
 *
 * Scoring factors:
 * - Latitude sweet spot: 38-45°N = 100 points, decay outside
 * - Longitude: Eastern US and mountain west score higher
 * - Avoid deep south, avoid coastal mild climates
 */
function calculateFourSeasonsScore(lat, lng, stateName) {
  let score = 0;

  // Latitude scoring (38-45°N is ideal four-season zone)
  const latScore = Math.max(0, 100 - Math.abs(41.5 - lat) * 8);
  score += latScore * 0.5; // 50% weight

  // Longitudinal zones
  let zoneScore = 50; // Default

  // Mountain states (good four seasons, snowy winters)
  if (lng > -111 && lng < -102 && lat > 37 && lat < 49) {
    zoneScore = 90; // Colorado, Wyoming, Montana
  }
  // Upper Midwest (classic four seasons)
  else if (lng > -97 && lng < -80 && lat > 40 && lat < 49) {
    zoneScore = 85; // Minnesota, Wisconsin, Michigan, New York
  }
  // Northeast (good four seasons)
  else if (lng > -80 && lng < -66 && lat > 38 && lat < 47) {
    zoneScore = 80; // New England, upstate NY
  }
  // Appalachian region
  else if (lng > -84 && lng < -75 && lat > 35 && lat < 42) {
    zoneScore = 75; // Pennsylvania, West Virginia, Virginia mountains
  }
  // Pacific Northwest (mild, less distinct)
  else if (lng < -120 && lat > 42) {
    zoneScore = 40; // Oregon, Washington - mild winters
  }
  // California (mostly mild)
  else if (lng < -114 && lat < 42) {
    zoneScore = 30; // California - year-round mild
  }
  // Deep South (hot, humid, little winter)
  else if (lat < 35 && lng > -95) {
    zoneScore = 20; // Georgia, Alabama, Mississippi - hot humid
  }
  // Southwest desert (extreme heat, little winter)
  else if (lng > -115 && lng < -102 && lat < 40) {
    zoneScore = 25; // Arizona, New Mexico - desert heat
  }
  // Great Plains (good seasons but extreme)
  else if (lng > -104 && lng < -94 && lat > 35 && lat < 49) {
    zoneScore = 70; // Kansas, Nebraska, Dakotas
  }

  score += zoneScore * 0.5; // 50% weight

  // State-level adjustments for known good four-season states
  const fourSeasonStates = {
    'Colorado': 15,
    'Vermont': 12,
    'New Hampshire': 12,
    'Maine': 10,
    'Montana': 10,
    'Wyoming': 12,
    'Minnesota': 10,
    'Wisconsin': 10,
    'Michigan': 8,
    'New York': 8,
    'Pennsylvania': 8,
    'Massachusetts': 7,
    'Idaho': 8,
  };

  if (fourSeasonStates[stateName]) {
    score += fourSeasonStates[stateName];
  }

  // Penalty for extreme south (too hot, no winter)
  if (lat < 32) {
    score -= 20;
  }

  // Penalty for extreme heat regions
  if (lng > -104 && lng < -94 && lat < 37) { // Southern plains/Texas
    score -= 15;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

console.log('🌨️ Generating Four Seasons Climate Scores...\n');

const fourSeasonsData = countyDatabase.map(county => {
  const score = calculateFourSeasonsScore(county.lat, county.lng, county.state);
  return {
    fipsCode: county.fipsCode,
    fourSeasons: score
  };
});

// Stats
const scores = fourSeasonsData.map(d => d.fourSeasons);
const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
const max = Math.max(...scores);
const min = Math.min(...scores);

console.log(`📊 Statistics:`);
console.log(`  Total counties: ${fourSeasonsData.length}`);
console.log(`  Average score: ${avg.toFixed(1)}`);
console.log(`  Max score: ${max}`);
console.log(`  Min score: ${min}`);

// Find best counties
const topCounties = fourSeasonsData
  .map(d => ({
    ...d,
    countyInfo: countyDatabase.find(c => c.fipsCode === d.fipsCode)
  }))
  .sort((a, b) => b.fourSeasons - a.fourSeasons)
  .slice(0, 10);

console.log(`\n🏆 Top 10 Four-Season Counties:`);
topCounties.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.countyInfo.name}, ${c.countyInfo.stateAbbrev} - Score: ${c.fourSeasons}`);
});

// Write to file
const outputPath = path.join(__dirname, '../src/lib/data/dimensionData/fourSeasons.ts');
const fileContent = `/**
 * Four Seasons Climate Scores
 * Generated: ${new Date().toISOString()}
 *
 * Scores based on geographic patterns favoring:
 * - Latitude 38-45°N (temperate zone)
 * - Mountain regions (Colorado, Wyoming, Montana)
 * - Upper Midwest and Northeast
 * - Avoiding extreme heat and mild coastal climates
 */

export const fourSeasonsData: Record<string, number> = {
${fourSeasonsData.map(d => `  '${d.fipsCode}': ${d.fourSeasons},`).join('\n')}
};
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`\n✅ Written to ${outputPath}`);
