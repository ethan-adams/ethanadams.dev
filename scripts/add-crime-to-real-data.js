import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REAL_DATA_FILE = path.join(__dirname, '../src/lib/data/realCountyData.ts');
const CRIME_DATA_FILE = path.join(__dirname, '../src/lib/data/countyCrimeData.ts');

async function addCrimeData() {
  console.log('🔄 Adding crime rate data to realCountyData...\n');

  // Read existing real county data
  console.log('📖 Reading realCountyData...');
  const realDataModule = await import(REAL_DATA_FILE);
  const realCountyData = realDataModule.realCountyData;
  console.log(`✓ Loaded ${realCountyData.length} counties\n`);

  // Read crime data
  console.log('📖 Reading crime data...');
  const crimeModule = await import(CRIME_DATA_FILE);
  const countyCrimeData = crimeModule.countyCrimeData;
  console.log(`✓ Loaded ${countyCrimeData.length} crime records\n`);

  // Create crime lookup
  const crimeByFips = {};
  countyCrimeData.forEach(c => {
    crimeByFips[c.fipsCode] = c.crime_rate;
  });

  // Merge crime data
  console.log('🔗 Merging crime data...');
  let addedCount = 0;
  const updatedData = realCountyData.map(county => {
    const crimeRate = crimeByFips[county.fipsCode];
    if (crimeRate !== undefined) {
      addedCount++;
      return {
        ...county,
        values: {
          ...county.values,
          crime_rate: crimeRate
        }
      };
    }
    return county;
  });

  console.log(`✓ Added crime data to ${addedCount} counties\n`);

  // Generate updated TypeScript file
  const tsContent = `/**
 * Real County Data
 * Combined from multiple public data sources
 * Generated: ${new Date().toISOString()}
 *
 * Counties: ${updatedData.length}
 * Dimensions: land_value, sunny_days, growing_season, fiber_coverage, crime_rate
 */

import type { CountyData } from '../types/county';

export const realCountyData: CountyData[] = ${JSON.stringify(updatedData, null, 2)};

export const dataStats = {
  totalCounties: ${updatedData.length},
  dimensions: 5,
  dimensionNames: ['land_value', 'sunny_days', 'growing_season', 'fiber_coverage', 'crime_rate'],
  generated: '${new Date().toISOString()}',
};
`;

  fs.writeFileSync(REAL_DATA_FILE, tsContent, 'utf-8');
  console.log(`✅ Updated: ${REAL_DATA_FILE}`);

  const stats = fs.statSync(REAL_DATA_FILE);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`📦 File size: ${sizeKB} KB`);

  console.log('\n✅ Crime rate data successfully added!');
}

addCrimeData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
