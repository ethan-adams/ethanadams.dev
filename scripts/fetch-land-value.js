/**
 * Fetch land value data from USDA NASS Quick Stats API
 *
 * REQUIRES: USDA NASS API key
 * Get free key at: https://quickstats.nass.usda.gov/api
 *
 * Usage: USDA_API_KEY=your_key_here node scripts/fetch-land-value.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.USDA_API_KEY;
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/dimensionData/landValue.ts');

if (!API_KEY) {
  console.error('❌ Error: USDA_API_KEY environment variable not set');
  console.error('Get a free API key at: https://quickstats.nass.usda.gov/api');
  console.error('Then run: USDA_API_KEY=your_key node scripts/fetch-land-value.js');
  process.exit(1);
}

// USDA NASS Quick Stats API
const BASE_URL = 'https://quickstats.nass.usda.gov/api/api_GET/';

async function fetchLandValue() {
  console.log('📥 Fetching land value data from USDA NASS...\n');

  const params = new URLSearchParams({
    key: API_KEY,
    source_desc: 'CENSUS',
    sector_desc: 'ECONOMICS',
    commodity_desc: 'AG LAND',
    statisticcat_desc: 'ASSET VALUE',
    agg_level_desc: 'COUNTY',
    year: '2022', // Most recent census year
    format: 'JSON',
  });

  try {
    console.log('Querying USDA API...');
    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ Received ${data.data?.length || 0} records\n`);

    if (!data.data || data.data.length === 0) {
      console.warn('⚠️  No data returned. This could mean:');
      console.warn('  - Invalid API key');
      console.warn('  - Data not available for specified year');
      console.warn('  - Query parameters need adjustment');
      return;
    }

    // Process data into Map<fipsCode, value>
    const landValueMap = {};

    data.data.forEach(record => {
      const stateFips = record.state_fips_code?.padStart(2, '0');
      const countyFips = record.county_code?.padStart(3, '0');
      const fipsCode = stateFips + countyFips;

      const value = parseFloat(record.Value?.replace(/,/g, ''));

      if (fipsCode && !isNaN(value) && value > 0) {
        landValueMap[fipsCode] = value;
      }
    });

    console.log(`✓ Processed ${Object.keys(landValueMap).length} counties with land value data\n`);

    // Generate TypeScript file
    const tsContent = `/**
 * Land Value by County ($/acre)
 * Source: USDA NASS Quick Stats API
 * Generated: ${new Date().toISOString()}
 * Year: 2022
 *
 * Average value of agricultural land per acre.
 */

export const landValueData: Record<string, number> = ${JSON.stringify(landValueMap, null, 2)};

export const landValueStats = {
  counties: ${Object.keys(landValueMap).length},
  min: ${Math.min(...Object.values(landValueMap))},
  max: ${Math.max(...Object.values(landValueMap))},
  avg: ${Math.round(Object.values(landValueMap).reduce((a, b) => a + b, 0) / Object.keys(landValueMap).length)},
  year: 2022,
  generated: '${new Date().toISOString()}',
};
`;

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
    console.log(`✅ Written to: ${OUTPUT_FILE}`);

    // Show sample data
    console.log('\n📊 Sample land values:');
    Object.entries(landValueMap)
      .slice(0, 10)
      .forEach(([fips, value]) => {
        console.log(`  FIPS ${fips}: $${value.toLocaleString()}/acre`);
      });

    console.log(`\n✅ Land value data ready! (${Object.keys(landValueMap).length} counties)`);

  } catch (error) {
    console.error('❌ Error fetching land value:', error);
    process.exit(1);
  }
}

fetchLandValue();
