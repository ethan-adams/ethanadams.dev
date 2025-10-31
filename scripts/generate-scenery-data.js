/**
 * Generate scenery scores for all US counties based on:
 * - Proximity to national parks and monuments
 * - Proximity to mountain ranges and elevation
 * - Proximity to highly-rated scenic trails
 * - Coastal/water features
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load county data from TypeScript module
const countyModule = await import('../src/lib/data/countyDatabase.ts');
const countyData = countyModule.countyDatabase;

// Major scenic features with coordinates and influence radius (in degrees)
const scenicFeatures = {
  nationalParks: [
    // Western Parks (highest scenic value)
    { name: 'Yellowstone', lat: 44.6, lng: -110.5, radius: 2.0, value: 100 },
    { name: 'Yosemite', lat: 37.8651, lng: -119.5383, radius: 1.5, value: 100 },
    { name: 'Grand Canyon', lat: 36.1069, lng: -112.1129, radius: 2.0, value: 100 },
    { name: 'Zion', lat: 37.2982, lng: -113.0263, radius: 1.0, value: 95 },
    { name: 'Grand Teton', lat: 43.7904, lng: -110.6818, radius: 1.5, value: 100 },
    { name: 'Glacier', lat: 48.7596, lng: -113.787, radius: 2.0, value: 100 },
    { name: 'Rocky Mountain', lat: 40.3428, lng: -105.6836, radius: 1.5, value: 95 },
    { name: 'Sequoia', lat: 36.4864, lng: -118.5658, radius: 1.2, value: 90 },
    { name: 'Olympic', lat: 47.8021, lng: -123.6044, radius: 1.5, value: 90 },
    { name: 'Mount Rainier', lat: 46.8523, lng: -121.7603, radius: 1.5, value: 95 },
    { name: 'Crater Lake', lat: 42.8684, lng: -122.1685, radius: 1.0, value: 90 },
    { name: 'Arches', lat: 38.7331, lng: -109.5925, radius: 0.8, value: 85 },
    { name: 'Canyonlands', lat: 38.2, lng: -109.93, radius: 1.5, value: 85 },
    { name: 'Bryce Canyon', lat: 37.5930, lng: -112.1871, radius: 0.8, value: 85 },
    { name: 'Capitol Reef', lat: 38.2, lng: -111.17, radius: 1.0, value: 80 },

    // Eastern & Other Parks
    { name: 'Acadia', lat: 44.35, lng: -68.21, radius: 0.8, value: 85 },
    { name: 'Great Smoky Mountains', lat: 35.6532, lng: -83.5070, radius: 1.5, value: 85 },
    { name: 'Shenandoah', lat: 38.2928, lng: -78.6795, radius: 1.2, value: 75 },
    { name: 'Big Bend', lat: 29.1275, lng: -103.2428, radius: 1.5, value: 80 },
  ],

  mountainRanges: [
    // Rockies
    { name: 'Colorado Rockies', lat: 39.5, lng: -106.0, radius: 3.0, value: 90 },
    { name: 'Wyoming Rockies', lat: 43.0, lng: -109.5, radius: 2.5, value: 85 },
    { name: 'Montana Rockies', lat: 47.0, lng: -113.0, radius: 2.5, value: 85 },
    { name: 'Idaho Sawtooth', lat: 44.0, lng: -114.9, radius: 1.5, value: 85 },

    // Sierra Nevada
    { name: 'Sierra Nevada', lat: 37.5, lng: -119.0, radius: 2.5, value: 90 },

    // Cascades
    { name: 'Cascades WA', lat: 47.5, lng: -121.0, radius: 2.0, value: 85 },
    { name: 'Cascades OR', lat: 44.0, lng: -122.0, radius: 2.0, value: 80 },

    // Appalachians
    { name: 'White Mountains', lat: 44.27, lng: -71.3, radius: 1.0, value: 70 },
    { name: 'Green Mountains', lat: 43.5, lng: -72.8, radius: 1.0, value: 70 },
    { name: 'Adirondacks', lat: 44.0, lng: -74.0, radius: 1.5, value: 70 },
    { name: 'Blue Ridge', lat: 36.0, lng: -82.0, radius: 2.0, value: 65 },
  ],

  coastalAreas: [
    // Pacific Coast (most scenic)
    { name: 'Big Sur', lat: 36.2704, lng: -121.8076, radius: 0.8, value: 95 },
    { name: 'Oregon Coast', lat: 44.5, lng: -124.0, radius: 2.0, value: 85 },
    { name: 'Olympic Peninsula Coast', lat: 47.9, lng: -124.6, radius: 1.0, value: 85 },
    { name: 'San Juan Islands', lat: 48.5, lng: -123.0, radius: 0.8, value: 80 },

    // Other coasts
    { name: 'Maine Coast', lat: 44.0, lng: -68.5, radius: 1.5, value: 75 },
    { name: 'Outer Banks', lat: 35.5, lng: -75.5, radius: 1.0, value: 60 },
    { name: 'Florida Keys', lat: 24.7, lng: -81.0, radius: 1.5, value: 65 },
  ]
};

// Calculate distance between two lat/lng points
function distance(lat1, lng1, lat2, lng2) {
  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Calculate scenery score for a county
function calculateSceneryScore(lat, lng, stateName, countyName) {
  let maxScore = 0;

  // Check proximity to all scenic features
  const allFeatures = [
    ...scenicFeatures.nationalParks,
    ...scenicFeatures.mountainRanges,
    ...scenicFeatures.coastalAreas
  ];

  for (const feature of allFeatures) {
    const dist = distance(lat, lng, feature.lat, feature.lng);

    if (dist < feature.radius) {
      // Score decreases linearly with distance
      const proximityFactor = 1 - (dist / feature.radius);
      const score = feature.value * proximityFactor;
      maxScore = Math.max(maxScore, score);
    }
  }

  // Elevation bonus for mountain states (even if not near major ranges)
  const mountainStates = ['Colorado', 'Wyoming', 'Montana', 'Idaho', 'Utah',
                          'Nevada', 'New Mexico', 'Arizona', 'California',
                          'Oregon', 'Washington', 'Alaska'];
  if (mountainStates.includes(stateName) && maxScore < 50) {
    maxScore = Math.max(maxScore, 40);
  }

  // Bonus for specific highly scenic counties known for trails
  const scenicCountyBonus = {
    // Colorado Front Range
    'Boulder County, CO': 20,
    'Larimer County, CO': 20,
    'Jefferson County, CO': 15,
    'Clear Creek County, CO': 25,
    'Summit County, CO': 25,
    'Eagle County, CO': 20,
    'Pitkin County, CO': 20,
    'San Miguel County, CO': 25,

    // Utah's Mighty 5 region
    'Grand County, UT': 20,
    'San Juan County, UT': 20,
    'Garfield County, UT': 25,
    'Kane County, UT': 20,
    'Wayne County, UT': 20,

    // California scenic areas
    'Marin County, CA': 15,
    'Monterey County, CA': 20,
    'Inyo County, CA': 20,
    'Tuolumne County, CA': 20,
    'Mariposa County, CA': 25,

    // Pacific Northwest
    'Whatcom County, WA': 15,
    'Skagit County, WA': 15,
    'Clallam County, WA': 20,
    'Hood River County, OR': 15,
    'Deschutes County, OR': 15,

    // Vermont/New Hampshire
    'Chittenden County, VT': 10,
    'Addison County, VT': 12,
    'Grafton County, NH': 12,
    'Coos County, NH': 15,

    // New York
    'Essex County, NY': 15,
  };

  const countyKey = `${countyName}, ${stateName}`;
  if (scenicCountyBonus[countyKey]) {
    maxScore += scenicCountyBonus[countyKey];
  }

  return Math.min(100, Math.round(maxScore));
}

// Generate scores for all counties
console.log('🏔️ Generating scenery scores for', countyData.length, 'counties...');

const sceneryScores = countyData.map(county => {
  const score = calculateSceneryScore(
    county.lat,
    county.lng,
    county.state,
    county.name
  );

  return {
    fipsCode: county.fipsCode,
    scenery: score
  };
});

// Sort to see top counties
const topCounties = [...sceneryScores]
  .sort((a, b) => b.scenery - a.scenery)
  .slice(0, 20);

console.log('\n🏆 Top 20 most scenic counties:');
topCounties.forEach((county, i) => {
  const info = countyData.find(c => c.fipsCode === county.fipsCode);
  console.log(`${i + 1}. ${info.name}, ${info.stateAbbrev} - Score: ${county.scenery}`);
});

// Save to file
const outputPath = path.join(__dirname, 'scenery-scores.json');
fs.writeFileSync(outputPath, JSON.stringify(sceneryScores, null, 2));

console.log(`\n✅ Saved scenery scores to ${outputPath}`);
console.log(`📊 Average score: ${Math.round(sceneryScores.reduce((sum, c) => sum + c.scenery, 0) / sceneryScores.length)}`);
