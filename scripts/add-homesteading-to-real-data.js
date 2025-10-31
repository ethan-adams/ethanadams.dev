/**
 * Add homesteading dimensions to realCountyData.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the homesteading data
const homesteadingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'homesteading-dimensions.json'), 'utf-8'));
const homesteadingMap = new Map(homesteadingData.map(h => [h.fipsCode, h]));

// Read realCountyData.ts
const realCountyDataPath = path.join(__dirname, '../src/lib/data/realCountyData.ts');
let fileContent = fs.readFileSync(realCountyDataPath, 'utf-8');

console.log('🏡 Adding homesteading dimensions to realCountyData.ts...');

let updateCount = 0;

// Replace each county object to add all 5 homesteading dimensions
fileContent = fileContent.replace(
  /"fipsCode": "(\d{5})",[\s\S]*?"scenery": ([\d.]+|null)/g,
  (match, fipsCode) => {
    const data = homesteadingMap.get(fipsCode);
    if (data) {
      updateCount++;
      return match +
        `,\n    "population_density": ${data.population_density}` +
        `,\n    "property_tax_rate": ${data.property_tax_rate}` +
        `,\n    "water_availability": ${data.water_availability}` +
        `,\n    "hunting_fishing": ${data.hunting_fishing}` +
        `,\n    "homesteading_freedom": ${data.homesteading_freedom}`;
    } else {
      return match +
        `,\n    "population_density": null` +
        `,\n    "property_tax_rate": null` +
        `,\n    "water_availability": null` +
        `,\n    "hunting_fishing": null` +
        `,\n    "homesteading_freedom": null`;
    }
  }
);

// Update the interface
fileContent = fileContent.replace(
  /scenery: number \| null;/,
  `scenery: number | null;\n  population_density: number | null;\n  property_tax_rate: number | null;\n  water_availability: number | null;\n  hunting_fishing: number | null;\n  homesteading_freedom: number | null;`
);

// Write back
fs.writeFileSync(realCountyDataPath, fileContent, 'utf-8');

console.log(`✅ Added 5 homesteading dimensions to ${updateCount} counties`);

const stats = fs.statSync(realCountyDataPath);
console.log(`📦 New file size: ${Math.round(stats.size / 1024)} KB`);
