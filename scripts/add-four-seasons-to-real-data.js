import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REAL_DATA_FILE = path.join(__dirname, '../src/lib/data/realCountyData.ts');
const FOUR_SEASONS_FILE = path.join(__dirname, '../src/lib/data/dimensionData/fourSeasons.ts');

async function addFourSeasonsData() {
  console.log('❄️  Adding four seasons data to realCountyData...\n');

  // Read existing real county data
  console.log('📖 Reading realCountyData...');
  const realDataModule = await import(REAL_DATA_FILE);
  const realCountyData = realDataModule.realCountyData;
  console.log(`✓ Loaded ${realCountyData.length} counties\n`);

  // Read four seasons data
  console.log('📖 Reading four seasons data...');
  const fourSeasonsModule = await import(FOUR_SEASONS_FILE);
  const fourSeasonsData = fourSeasonsModule.fourSeasonsData;
  const fourSeasonsCount = Object.keys(fourSeasonsData).length;
  console.log(`✓ Loaded ${fourSeasonsCount} four seasons scores\n`);

  // Merge four seasons data
  console.log('🔗 Merging four seasons data...');
  let addedCount = 0;
  const updatedData = realCountyData.map(county => {
    const fourSeasons = fourSeasonsData[county.fipsCode];
    if (fourSeasons !== undefined) {
      addedCount++;
      return {
        ...county,
        values: {
          ...county.values,
          four_seasons: fourSeasons
        }
      };
    }
    return county;
  });

  console.log(`✓ Added four seasons data to ${addedCount} counties\n`);

  // Generate updated TypeScript file
  const tsContent = `/**
 * Real County Data
 * Combined from multiple public data sources
 * Generated: ${new Date().toISOString()}
 *
 * Counties: ${updatedData.length}
 * Dimensions: land_value, sunny_days, growing_season, fiber_coverage, crime_rate, four_seasons
 */

import type { CountyData } from '../types/county';

export const realCountyData: CountyData[] = ${JSON.stringify(updatedData, null, 2)};

export const dataStats = {
  totalCounties: ${updatedData.length},
  dimensions: 6,
  dimensionNames: ['land_value', 'sunny_days', 'growing_season', 'fiber_coverage', 'crime_rate', 'four_seasons'],
  generated: '${new Date().toISOString()}',
};
`;

  fs.writeFileSync(REAL_DATA_FILE, tsContent, 'utf-8');
  console.log(`✅ Updated: ${REAL_DATA_FILE}`);

  const stats = fs.statSync(REAL_DATA_FILE);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`📦 File size: ${sizeKB} KB`);

  console.log('\n✅ Four seasons data successfully added!');
}

addFourSeasonsData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
