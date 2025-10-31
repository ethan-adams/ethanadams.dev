/**
 * Generate realistic county data based on geographic and demographic patterns
 *
 * This creates plausible dimension values for all counties using:
 * - Geographic location (lat/lng)
 * - State characteristics
 * - Regional patterns
 *
 * For v1, this is faster than hitting multiple APIs with rate limits.
 * For v2, we can replace with real API data.
 *
 * Usage: node scripts/generate-realistic-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the county database we just created
const countyDbPath = path.join(__dirname, '../src/lib/data/countyDatabase.ts');
const countyDbContent = fs.readFileSync(countyDbPath, 'utf-8');

// Extract the JSON array (hacky but works for this script)
const jsonMatch = countyDbContent.match(/countyDatabase: CountyBase\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  console.error('❌ Could not parse county database');
  process.exit(1);
}

const counties = JSON.parse(jsonMatch[1]);
console.log(`✓ Loaded ${counties.length} counties\n`);

// Generate realistic dimension data
function generateDimensionData(counties) {
  console.log('🎲 Generating realistic dimension data...\n');

  const results = counties.map(county => {
    const { fipsCode, lat, lng, stateAbbrev } = county;

    // Land Value ($/acre) - based on region and urbanization
    // Coasts are expensive, plains are cheap, mountains moderate
    const coastalFactor = Math.max(0, 1 - Math.min(
      Math.abs(lng + 122), // West coast
      Math.abs(lng + 74),  // East coast
      Math.abs(lng + 95)   // Gulf coast
    ) / 20);

    const landValue = Math.round(
      5000 + // Base value
      coastalFactor * 40000 + // Coastal premium
      (Math.random() * 10000) - 5000 // Random variation
    );

    // Sunny Days (days/year) - based on latitude and longitude
    // Southwest is sunniest, Pacific Northwest is cloudiest
    const sunnyDays = Math.round(
      200 + // Base
      (35 - Math.abs(lat - 35)) * 2 + // Latitude factor (35°N is ideal)
      (lng < -100 ? 20 : 0) + // West of 100°W gets bonus
      (lng > -85 && lat > 38 ? -30 : 0) + // Great Lakes penalty
      (Math.random() * 40) - 20 // Random variation
    );

    // Growing Season (days) - based on latitude
    // South = longer, North = shorter
    const growingSeason = Math.round(
      280 - (Math.abs(lat - 25) * 3) + // Latitude is key
      (lng < -100 && lat > 35 ? -20 : 0) + // High plains penalty
      (Math.random() * 30) - 15 // Random variation
    );

    // Fiber Coverage (%) - based on state and urbanization proxy
    // Varies by state policy and population density
    const stateFiberBonus = {
      'UT': 20, 'WA': 15, 'CA': 15, 'CO': 10, 'VA': 10,
      'NC': 10, 'TN': 10, 'TX': 5, 'FL': 5
    };

    const fiberCoverage = Math.round(
      Math.min(100, Math.max(10,
        40 + // Base coverage
        (stateFiberBonus[stateAbbrev] || 0) + // State factor
        (Math.random() * 40) - 20 // Random variation
      ))
    );

    return {
      fipsCode,
      values: {
        land_value: Math.max(1000, Math.min(100000, landValue)),
        sunny_days: Math.max(100, Math.min(330, sunnyDays)),
        growing_season: Math.max(60, Math.min(365, growingSeason)),
        fiber_coverage: Math.max(5, Math.min(100, fiberCoverage))
      }
    };
  });

  return results;
}

// Generate the data
const countyData = generateDimensionData(counties);

// Generate TypeScript file
const tsContent = `/**
 * Real county data for all US counties
 * Generated: ${new Date().toISOString()}
 *
 * Contains ${countyData.length} counties with realistic dimension values.
 *
 * NOTE: This is v1 with algorithmically-generated plausible data.
 * v2 will use real API data from USDA, NOAA, and FCC.
 */

export interface CountyData {
  fipsCode: string;
  values: {
    land_value: number;      // $/acre
    sunny_days: number;      // days/year
    growing_season: number;  // days
    fiber_coverage: number;  // % coverage
  };
}

export const realCountyData: CountyData[] = ${JSON.stringify(countyData, null, 2)};

// Quick lookup by FIPS code
export const countyDataByFips = new Map<string, CountyData>(
  realCountyData.map(c => [c.fipsCode, c])
);

// Statistics
export const dataStats = {
  total: ${countyData.length},
  generated: '${new Date().toISOString()}',
  dimensions: ['land_value', 'sunny_days', 'growing_season', 'fiber_coverage'],
};
`;

const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/realCountyData.ts');
fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');

console.log(`✅ Generated realistic data for ${countyData.length} counties`);
console.log(`   Written to: ${OUTPUT_FILE}`);
console.log(`   Size: ${Math.round(tsContent.length / 1024)} KB\n`);

// Show some sample data
console.log('📊 Sample county data:');
const samples = [
  countyData.find(c => c.fipsCode === '08031'), // Denver
  countyData.find(c => c.fipsCode === '06037'), // Los Angeles
  countyData.find(c => c.fipsCode === '36061'), // New York
  countyData.find(c => c.fipsCode === '48201'), // Harris (Houston)
].filter(Boolean);

samples.forEach(county => {
  const countyInfo = counties.find(c => c.fipsCode === county.fipsCode);
  console.log(`\n  ${countyInfo.name}, ${countyInfo.stateAbbrev} (${county.fipsCode}):`);
  console.log(`    Land Value: $${county.values.land_value.toLocaleString()}/acre`);
  console.log(`    Sunny Days: ${county.values.sunny_days}/year`);
  console.log(`    Growing Season: ${county.values.growing_season} days`);
  console.log(`    Fiber Coverage: ${county.values.fiber_coverage}%`);
});

console.log('\n✅ Data generation complete!');
console.log('Next step: Integrate into app stores');
