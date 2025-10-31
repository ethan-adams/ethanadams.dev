/**
 * Combine all dimension data into unified realCountyData.ts
 *
 * This script reads the base county database and all dimension data files,
 * then creates the final unified data structure.
 *
 * Usage: node scripts/combine-real-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DATA = path.join(__dirname, '../src/lib/data/countyDatabase.ts');
const DIMENSION_DATA_DIR = path.join(__dirname, '../src/lib/data/dimensionData');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/realCountyData.ts');

async function combineData() {
  console.log('🔄 Combining all data sources...\n');

  // Check if base data exists
  if (!fs.existsSync(BASE_DATA)) {
    console.error('❌ Base county database not found!');
    console.error('Run: node scripts/fetch-county-base.js first');
    process.exit(1);
  }

  // Import base county data
  console.log('📖 Reading base county database...');
  const baseModule = await import('../src/lib/data/countyDatabase.ts');
  const countyDatabase = baseModule.countyDatabase;
  console.log(`✓ Loaded ${countyDatabase.length} counties\n`);

  // Load dimension data files (if they exist)
  const dimensionData = {};

  console.log('📖 Reading dimension data...');

  const dimensionFiles = {
    land_value: 'landValue.ts',
    sunny_days: 'sunnyDays.ts',
    growing_season: 'growingSeason.ts',
    fiber_coverage: 'fiberCoverage.ts',
  };

  for (const [dimensionId, filename] of Object.entries(dimensionFiles)) {
    const filepath = path.join(DIMENSION_DATA_DIR, filename);

    if (fs.existsSync(filepath)) {
      try {
        const module = await import(filepath);
        const dataKey = Object.keys(module).find(k => k.endsWith('Data'));
        if (dataKey) {
          dimensionData[dimensionId] = module[dataKey];
          console.log(`  ✓ ${dimensionId}: ${Object.keys(module[dataKey]).length} counties`);
        }
      } catch (error) {
        console.warn(`  ⚠️  ${dimensionId}: Failed to load (${error.message})`);
      }
    } else {
      console.warn(`  ⚠️  ${dimensionId}: Not found (run fetch script)`);
    }
  }

  const availableDimensions = Object.keys(dimensionData);
  console.log(`\n✓ Found data for ${availableDimensions.length} dimensions\n`);

  // Combine into unified structure
  console.log('🔗 Combining data...');

  const realCountyData = countyDatabase.map(county => {
    const values = {};

    availableDimensions.forEach(dimensionId => {
      const value = dimensionData[dimensionId][county.fipsCode];
      if (value !== undefined && value !== null) {
        values[dimensionId] = value;
      }
    });

    return {
      fipsCode: county.fipsCode,
      values,
    };
  });

  // Filter to only counties with at least one dimension value
  const countiesWithData = realCountyData.filter(c => Object.keys(c.values).length > 0);

  console.log(`✓ Combined data for ${countiesWithData.length} counties\n`);

  // Calculate coverage stats
  const coverageStats = {};
  availableDimensions.forEach(dim => {
    coverageStats[dim] = countiesWithData.filter(c => c.values[dim] !== undefined).length;
  });

  console.log('📊 Data coverage by dimension:');
  Object.entries(coverageStats).forEach(([dim, count]) => {
    const percentage = ((count / countyDatabase.length) * 100).toFixed(1);
    console.log(`  ${dim}: ${count} counties (${percentage}%)`);
  });

  // Generate TypeScript file
  const tsContent = `/**
 * Real County Data
 * Combined from multiple public data sources
 * Generated: ${new Date().toISOString()}
 *
 * Counties: ${countiesWithData.length}
 * Dimensions: ${availableDimensions.join(', ')}
 */

import type { CountyData } from '../types/county';

export const realCountyData: CountyData[] = ${JSON.stringify(countiesWithData, null, 2)};

export const dataStats = {
  totalCounties: ${countiesWithData.length},
  dimensions: ${availableDimensions.length},
  dimensionNames: [${availableDimensions.map(d => `'${d}'`).join(', ')}],
  coverage: ${JSON.stringify(coverageStats, null, 2)},
  generated: '${new Date().toISOString()}',
};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log(`\n✅ Written to: ${OUTPUT_FILE}`);

  // Calculate file size
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`📦 File size: ${sizeKB} KB`);

  console.log('\n✅ Real county data ready!');
  console.log('\nNext steps:');
  console.log('  1. Update src/lib/stores/dimensions.ts to import realCountyData');
  console.log('  2. Replace mock data with real data');
  console.log('  3. Test the map with real data!');
}

combineData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
