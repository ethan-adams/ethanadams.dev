/**
 * Fetch base county list from Plotly GeoJSON
 *
 * We're already using this GeoJSON in the app for map rendering.
 * This extracts the county metadata (FIPS, name, state) from it.
 *
 * No API key required - same source as our map data.
 *
 * Usage: node scripts/fetch-county-base.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Same GeoJSON we use for the map!
const COUNTIES_GEOJSON_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/countyDatabase.ts');

async function fetchCountyBase() {
  console.log('📥 Fetching county database from Plotly GeoJSON...\n');

  try {
    const response = await fetch(COUNTIES_GEOJSON_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const geojson = await response.json();
    const features = geojson.features;

    console.log(`✓ Downloaded GeoJSON with ${features.length} counties\n`);

    // State abbreviation lookup
    const stateNames = {
      '01': { name: 'Alabama', abbrev: 'AL' },
      '02': { name: 'Alaska', abbrev: 'AK' },
      '04': { name: 'Arizona', abbrev: 'AZ' },
      '05': { name: 'Arkansas', abbrev: 'AR' },
      '06': { name: 'California', abbrev: 'CA' },
      '08': { name: 'Colorado', abbrev: 'CO' },
      '09': { name: 'Connecticut', abbrev: 'CT' },
      '10': { name: 'Delaware', abbrev: 'DE' },
      '11': { name: 'District of Columbia', abbrev: 'DC' },
      '12': { name: 'Florida', abbrev: 'FL' },
      '13': { name: 'Georgia', abbrev: 'GA' },
      '15': { name: 'Hawaii', abbrev: 'HI' },
      '16': { name: 'Idaho', abbrev: 'ID' },
      '17': { name: 'Illinois', abbrev: 'IL' },
      '18': { name: 'Indiana', abbrev: 'IN' },
      '19': { name: 'Iowa', abbrev: 'IA' },
      '20': { name: 'Kansas', abbrev: 'KS' },
      '21': { name: 'Kentucky', abbrev: 'KY' },
      '22': { name: 'Louisiana', abbrev: 'LA' },
      '23': { name: 'Maine', abbrev: 'ME' },
      '24': { name: 'Maryland', abbrev: 'MD' },
      '25': { name: 'Massachusetts', abbrev: 'MA' },
      '26': { name: 'Michigan', abbrev: 'MI' },
      '27': { name: 'Minnesota', abbrev: 'MN' },
      '28': { name: 'Mississippi', abbrev: 'MS' },
      '29': { name: 'Missouri', abbrev: 'MO' },
      '30': { name: 'Montana', abbrev: 'MT' },
      '31': { name: 'Nebraska', abbrev: 'NE' },
      '32': { name: 'Nevada', abbrev: 'NV' },
      '33': { name: 'New Hampshire', abbrev: 'NH' },
      '34': { name: 'New Jersey', abbrev: 'NJ' },
      '35': { name: 'New Mexico', abbrev: 'NM' },
      '36': { name: 'New York', abbrev: 'NY' },
      '37': { name: 'North Carolina', abbrev: 'NC' },
      '38': { name: 'North Dakota', abbrev: 'ND' },
      '39': { name: 'Ohio', abbrev: 'OH' },
      '40': { name: 'Oklahoma', abbrev: 'OK' },
      '41': { name: 'Oregon', abbrev: 'OR' },
      '42': { name: 'Pennsylvania', abbrev: 'PA' },
      '44': { name: 'Rhode Island', abbrev: 'RI' },
      '45': { name: 'South Carolina', abbrev: 'SC' },
      '46': { name: 'South Dakota', abbrev: 'SD' },
      '47': { name: 'Tennessee', abbrev: 'TN' },
      '48': { name: 'Texas', abbrev: 'TX' },
      '49': { name: 'Utah', abbrev: 'UT' },
      '50': { name: 'Vermont', abbrev: 'VT' },
      '51': { name: 'Virginia', abbrev: 'VA' },
      '53': { name: 'Washington', abbrev: 'WA' },
      '54': { name: 'West Virginia', abbrev: 'WV' },
      '55': { name: 'Wisconsin', abbrev: 'WI' },
      '56': { name: 'Wyoming', abbrev: 'WY' },
      '72': { name: 'Puerto Rico', abbrev: 'PR' },
    };

    // Parse each feature
    const counties = features.map(feature => {
      const fipsCode = feature.id;
      const props = feature.properties;
      const stateCode = props.STATE;
      const stateInfo = stateNames[stateCode] || { name: 'Unknown', abbrev: '??' };

      // Calculate centroid from geometry
      let lat = 0, lng = 0;
      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
        lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
      } else if (feature.geometry.type === 'MultiPolygon') {
        const allCoords = feature.geometry.coordinates.flat(2);
        lng = allCoords.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / (allCoords.length / 2);
        lat = allCoords.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) / (allCoords.length / 2);
      }

      return {
        fipsCode,
        name: props.NAME,
        state: stateInfo.name,
        stateAbbrev: stateInfo.abbrev,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        population: 0, // Will fetch separately if needed
      };
    });

    console.log(`✓ Parsed ${counties.length} counties\n`);

    // Generate TypeScript file
    const tsContent = `/**
 * Base county database
 * Source: Plotly GeoJSON Counties Dataset
 * Generated: ${new Date().toISOString()}
 *
 * All ${counties.length} US counties with FIPS codes, names, and approximate centroids.
 */

export interface CountyBase {
  fipsCode: string;
  name: string;
  state: string;
  stateAbbrev: string;
  lat: number;
  lng: number;
  population: number;
}

export const countyDatabase: CountyBase[] = ${JSON.stringify(counties, null, 2)};

// Quick lookup by FIPS code
export const countyByFips = new Map<string, CountyBase>(
  countyDatabase.map(c => [c.fipsCode, c])
);

// Statistics
export const countyStats = {
  total: ${counties.length},
  states: ${new Set(counties.map(c => c.stateAbbrev)).size},
  generated: '${new Date().toISOString()}',
};
`;

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
    console.log(`✅ Written to: ${OUTPUT_FILE}\n`);

    // Show some stats
    const byState = {};
    counties.forEach(c => {
      byState[c.stateAbbrev] = (byState[c.stateAbbrev] || 0) + 1;
    });

    console.log('📊 County counts by state (top 10):');
    Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count} counties`);
      });

    console.log('\n✅ Base county database ready!');
    console.log('   Size:', Math.round(tsContent.length / 1024), 'KB');
    console.log('\nNext step: Fetch dimension data (land value, climate, fiber)');

  } catch (error) {
    console.error('❌ Error fetching county base:', error);
    process.exit(1);
  }
}

fetchCountyBase();
