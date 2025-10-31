/**
 * Fetch REAL county population data from US Census Bureau API
 * This is the foundation for population density calculations
 *
 * API: https://www.census.gov/data/developers/data-sets.html
 * Using 2020 Decennial Census data (most recent complete dataset)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CENSUS_API_KEY = process.env.CENSUS_API_KEY || 'YOUR_KEY_HERE';
const BASE_URL = 'https://api.census.gov/data/2020/dec/pl';

async function fetchCountyPopulation() {
  console.log('📊 Fetching REAL population data from US Census Bureau...');

  // Census API for all counties: P1_001N is total population
  // We need to fetch state by state because API has limits
  const states = [
    '01', '02', '04', '05', '06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
    '36', '37', '38', '39', '40', '41', '42', '44', '45', '46', '47', '48', '49', '50', '51', '53',
    '54', '55', '56', '72' // 72 is Puerto Rico
  ];

  const allCountyData = [];

  for (const stateFips of states) {
    try {
      const url = `${BASE_URL}?get=P1_001N,NAME&for=county:*&in=state:${stateFips}&key=${CENSUS_API_KEY}`;
      console.log(`Fetching state ${stateFips}...`);

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch state ${stateFips}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      // First row is headers: ["P1_001N", "NAME", "state", "county"]
      // Subsequent rows are data
      for (let i = 1; i < data.length; i++) {
        const [population, name, state, county] = data[i];
        const fipsCode = state + county;
        allCountyData.push({
          fipsCode,
          population: parseInt(population, 10),
          name
        });
      }

      // Rate limit: be respectful to Census API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error fetching state ${stateFips}:`, error.message);
    }
  }

  console.log(`\n✅ Fetched ${allCountyData.length} counties from Census Bureau`);

  // Save to file
  const outputPath = path.join(__dirname, 'census-population.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCountyData, null, 2));
  console.log(`💾 Saved to ${outputPath}`);

  // Show some stats
  const sorted = [...allCountyData].sort((a, b) => b.population - a.population);
  console.log('\n📈 Top 10 most populous counties:');
  sorted.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}: ${c.population.toLocaleString()}`);
  });

  console.log('\n📉 Bottom 10 least populous counties:');
  sorted.slice(-10).reverse().forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}: ${c.population.toLocaleString()}`);
  });
}

// Check if API key is set
if (CENSUS_API_KEY === 'YOUR_KEY_HERE') {
  console.log('⚠️  WARNING: No Census API key set!');
  console.log('Get a free key at: https://api.census.gov/data/key_signup.html');
  console.log('Then run: CENSUS_API_KEY=your_key node scripts/fetch-census-population.js');
  console.log('\nAttempting to fetch without key (may be rate-limited)...\n');
}

fetchCountyPopulation().catch(console.error);
