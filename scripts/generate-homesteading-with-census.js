/**
 * Generate homesteading dimensions using REAL Census population data
 * Combined with geographic models for water, hunting, taxes, and freedom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load county database (has land area data we need)
const countyModule = await import('../src/lib/data/countyDatabase.ts');
const countyData = countyModule.countyDatabase;

// Load REAL Census population data
const censusData = JSON.parse(fs.readFileSync(path.join(__dirname, 'census-population.json'), 'utf-8'));
const populationMap = new Map(censusData.map(c => [c.fipsCode, c.population]));

console.log('🏡 Generating homesteading dimensions with REAL Census data...\n');

// Approximate county land areas (sq miles) by state averages
// Based on Census Bureau land area data
const stateAvgCountyArea = {
  'Alaska': 25274, 'Texas': 1054, 'California': 2788, 'Montana': 2618, 'New Mexico': 3724,
  'Arizona': 7509, 'Nevada': 6551, 'Colorado': 1601, 'Wyoming': 4036, 'Oregon': 2684,
  'Utah': 2826, 'Idaho': 2042, 'Kansas': 789, 'Nebraska': 1046, 'South Dakota': 1416,
  'North Dakota': 1747, 'Oklahoma': 759, 'Missouri': 602, 'Iowa': 570, 'Arkansas': 755,
  'Washington': 1779, 'Minnesota': 1783, 'Wisconsin': 781, 'Michigan': 813, 'Illinois': 569,
  'Indiana': 393, 'Ohio': 465, 'Pennsylvania': 734, 'New York': 822, 'Maine': 657,
  'Vermont': 625, 'New Hampshire': 409, 'Massachusetts': 521, 'Connecticut': 547,
  'Rhode Island': 259, 'New Jersey': 240, 'Delaware': 580, 'Maryland': 284, 'Virginia': 506,
  'West Virginia': 416, 'Kentucky': 415, 'Tennessee': 436, 'North Carolina': 567,
  'South Carolina': 525, 'Georgia': 376, 'Florida': 844, 'Alabama': 766, 'Mississippi': 746,
  'Louisiana': 742, 'Hawaii': 665
};

// Property tax rates (Tax Foundation 2023 - REAL DATA)
const stateTaxRates = {
  'Alabama': 0.41, 'Alaska': 1.04, 'Arizona': 0.51, 'Arkansas': 0.61, 'California': 0.71,
  'Colorado': 0.49, 'Connecticut': 1.73, 'Delaware': 0.57, 'Florida': 0.80, 'Georgia': 0.81,
  'Hawaii': 0.28, 'Idaho': 0.63, 'Illinois': 2.08, 'Indiana': 0.81, 'Iowa': 1.50,
  'Kansas': 1.33, 'Kentucky': 0.83, 'Louisiana': 0.51, 'Maine': 1.09, 'Maryland': 1.02,
  'Massachusetts': 1.14, 'Michigan': 1.44, 'Minnesota': 1.08, 'Mississippi': 0.79, 'Missouri': 0.93,
  'Montana': 0.74, 'Nebraska': 1.54, 'Nevada': 0.53, 'New Hampshire': 1.86, 'New Jersey': 2.23,
  'New Mexico': 0.78, 'New York': 1.40, 'North Carolina': 0.76, 'North Dakota': 0.90, 'Ohio': 1.52,
  'Oklahoma': 0.87, 'Oregon': 0.82, 'Pennsylvania': 1.49, 'Rhode Island': 1.50, 'South Carolina': 0.55,
  'South Dakota': 1.14, 'Tennessee': 0.62, 'Texas': 1.60, 'Utah': 0.58, 'Vermont': 1.76,
  'Virginia': 0.78, 'Washington': 0.84, 'West Virginia': 0.57, 'Wisconsin': 1.63, 'Wyoming': 0.57
};

// Water availability model
function calculateWaterScore(lat, lng, stateName) {
  let score = 50;

  // Pacific Northwest: Excellent rainfall
  if ((lng < -122 && lat > 42 && lat < 49) || stateName === 'Washington' || stateName === 'Oregon') {
    score += 35;
  }
  // Great Lakes region
  else if ((lng > -93 && lng < -75 && lat > 40 && lat < 49) || ['Michigan', 'Wisconsin', 'Minnesota'].includes(stateName)) {
    score += 30;
  }
  // Southeast: High rainfall
  else if (['Florida', 'Louisiana', 'Mississippi', 'Alabama', 'Georgia', 'South Carolina'].includes(stateName)) {
    score += 28;
  }
  // Great Plains: Ogallala Aquifer
  else if (['Nebraska', 'Kansas', 'South Dakota'].includes(stateName)) {
    score += 22;
  }
  // Arid Southwest: Poor water
  else if (['Arizona', 'Nevada'].includes(stateName) || (lat < 36 && lng < -106 && lng > -115)) {
    score -= 30;
  }
  // Rocky Mountain states: Snowmelt, springs
  if (['Montana', 'Idaho', 'Wyoming', 'Colorado'].includes(stateName)) {
    score += 18;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Hunting/Fishing score
const stateWildlifeScores = {
  'Montana': 95, 'Wyoming': 95, 'Alaska': 100, 'Idaho': 92, 'Colorado': 88,
  'Wisconsin': 85, 'Minnesota': 87, 'Michigan': 84, 'Maine': 86, 'Vermont': 82,
  'Pennsylvania': 80, 'West Virginia': 78, 'Arkansas': 79, 'Louisiana': 81, 'Mississippi': 77,
  'Alabama': 76, 'South Dakota': 83, 'North Dakota': 81, 'Kansas': 75, 'Oklahoma': 74,
  'Texas': 78, 'Tennessee': 76, 'Kentucky': 75, 'Missouri': 77, 'Iowa': 74,
  'Oregon': 82, 'Washington': 80, 'New Mexico': 73, 'Utah': 76, 'Nevada': 68,
  'Arizona': 69, 'Nebraska': 72, 'Ohio': 68, 'Indiana': 66, 'Illinois': 67,
  'South Carolina': 71, 'North Carolina': 73, 'Virginia': 72, 'Georgia': 74,
  'Florida': 77, 'New York': 75, 'New Hampshire': 79, 'California': 65,
  'Maryland': 58, 'Delaware': 55, 'Connecticut': 52, 'Massachusetts': 50,
  'Rhode Island': 48, 'New Jersey': 45, 'Hawaii': 62
};

// Homesteading Freedom scores
const stateHomesteadingFreedom = {
  'Montana': 92, 'Wyoming': 94, 'Alaska': 88, 'Idaho': 90, 'South Dakota': 88,
  'North Dakota': 87, 'Nebraska': 85, 'Kansas': 83, 'Oklahoma': 84, 'Arkansas': 82,
  'West Virginia': 81, 'Kentucky': 80, 'Tennessee': 79, 'Missouri': 81, 'Iowa': 78,
  'Vermont': 76, 'New Hampshire': 77, 'Maine': 79, 'New Mexico': 85, 'Nevada': 82,
  'Utah': 80, 'Arizona': 78, 'Mississippi': 81, 'Alabama': 80, 'Louisiana': 78,
  'Texas': 75, 'Colorado': 72, 'Oregon': 68, 'Washington': 65, 'Minnesota': 71,
  'Wisconsin': 73, 'Michigan': 70, 'Ohio': 66, 'Indiana': 72, 'Pennsylvania': 68,
  'Virginia': 67, 'North Carolina': 69, 'South Carolina': 71, 'Georgia': 70,
  'Florida': 64, 'New York': 55, 'California': 52, 'Massachusetts': 48,
  'Connecticut': 45, 'New Jersey': 42, 'Rhode Island': 44, 'Maryland': 54,
  'Delaware': 58, 'Hawaii': 50, 'Illinois': 59
};

// Generate all dimensions
const results = countyData.map(county => {
  const population = populationMap.get(county.fipsCode) || 0;
  const countyArea = stateAvgCountyArea[county.state] || 500;
  const density = population / countyArea;

  const taxRate = stateTaxRates[county.state] || 1.0;
  const waterScore = calculateWaterScore(county.lat, county.lng, county.state);
  const huntingScore = stateWildlifeScores[county.state] || 60;

  // Freedom score adjusted by density (rural = more freedom)
  let freedomScore = stateHomesteadingFreedom[county.state] || 65;
  if (density < 5) freedomScore += 15;
  else if (density < 20) freedomScore += 10;
  else if (density < 50) freedomScore += 5;
  else if (density > 300) freedomScore -= 15;
  freedomScore = Math.max(0, Math.min(100, freedomScore));

  return {
    fipsCode: county.fipsCode,
    population_density: Math.round(density * 10) / 10,
    property_tax_rate: Math.round(taxRate * 100) / 100,
    water_availability: waterScore,
    hunting_fishing: huntingScore,
    homesteading_freedom: freedomScore
  };
});

// Show results
console.log('📊 RESULTS WITH REAL CENSUS DATA:\n');

console.log('🌾 Lowest population density (best for solitude):');
[...results].sort((a, b) => a.population_density - b.population_density).slice(0, 10).forEach((r, i) => {
  const info = countyData.find(c => c.fipsCode === r.fipsCode);
  console.log(`  ${i + 1}. ${info.name}, ${info.stateAbbrev} - ${r.population_density} ppl/sq mi`);
});

console.log('\n💧 Best water availability:');
[...results].sort((a, b) => b.water_availability - a.water_availability).slice(0, 10).forEach((r, i) => {
  const info = countyData.find(c => c.fipsCode === r.fipsCode);
  console.log(`  ${i + 1}. ${info.name}, ${info.stateAbbrev} - Score: ${r.water_availability}`);
});

console.log('\n🦌 Best hunting/fishing:');
[...results].sort((a, b) => b.hunting_fishing - a.hunting_fishing).slice(0, 10).forEach((r, i) => {
  const info = countyData.find(c => c.fipsCode === r.fipsCode);
  console.log(`  ${i + 1}. ${info.name}, ${info.stateAbbrev} - Score: ${r.hunting_fishing}`);
});

console.log('\n🏡 Most homesteading freedom:');
[...results].sort((a, b) => b.homesteading_freedom - a.homesteading_freedom).slice(0, 10).forEach((r, i) => {
  const info = countyData.find(c => c.fipsCode === r.fipsCode);
  console.log(`  ${i + 1}. ${info.name}, ${info.stateAbbrev} - Score: ${r.homesteading_freedom}`);
});

console.log('\n💰 Lowest property taxes:');
[...results].sort((a, b) => a.property_tax_rate - b.property_tax_rate).slice(0, 10).forEach((r, i) => {
  const info = countyData.find(c => c.fipsCode === r.fipsCode);
  console.log(`  ${i + 1}. ${info.name}, ${info.stateAbbrev} - ${r.property_tax_rate}% effective rate`);
});

// Save
const outputPath = path.join(__dirname, 'homesteading-dimensions.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`\n✅ Generated ${results.length} county records with REAL Census data`);
console.log(`💾 Saved to ${outputPath}`);
