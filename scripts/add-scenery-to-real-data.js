/**
 * Add scenery scores to realCountyData.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the scenery scores
const sceneryScoresPath = path.join(__dirname, 'scenery-scores.json');
const sceneryScores = JSON.parse(fs.readFileSync(sceneryScoresPath, 'utf-8'));

// Create a Map for fast lookups
const sceneryMap = new Map(sceneryScores.map(s => [s.fipsCode, s.scenery]));

// Read the realCountyData.ts file
const realCountyDataPath = path.join(__dirname, '../src/lib/data/realCountyData.ts');
let fileContent = fs.readFileSync(realCountyDataPath, 'utf-8');

console.log('🏔️ Adding scenery scores to realCountyData.ts...');

// Count how many we'll update
let updateCount = 0;
let missingCount = 0;

// Replace each county object to add scenery
fileContent = fileContent.replace(
  /"fipsCode": "(\d{5})",[\s\S]*?"four_seasons": ([\d.]+|null)/g,
  (match, fipsCode, fourSeasons) => {
    const scenery = sceneryMap.get(fipsCode);
    if (scenery !== undefined) {
      updateCount++;
      return match + `,\n    "scenery": ${scenery}`;
    } else {
      missingCount++;
      return match + `,\n    "scenery": null`;
    }
  }
);

// Update the interface to include scenery
fileContent = fileContent.replace(
  /four_seasons: number \| null;/,
  `four_seasons: number | null;\n  scenery: number | null;`
);

// Write back to file
fs.writeFileSync(realCountyDataPath, fileContent, 'utf-8');

console.log(`✅ Added scenery to ${updateCount} counties`);
if (missingCount > 0) {
  console.log(`⚠️  ${missingCount} counties had missing scenery data`);
}

// Get file size
const stats = fs.statSync(realCountyDataPath);
console.log(`📦 New file size: ${Math.round(stats.size / 1024)} KB`);
