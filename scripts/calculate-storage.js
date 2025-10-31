/**
 * Calculate exact storage requirements for county data
 */

// Total US counties
const TOTAL_COUNTIES = 3234;

// Initial dimensions
const INITIAL_DIMENSIONS = 4;

// Future expansion scenarios
const EXPANSION_SCENARIOS = [
  { dimensions: 4, name: 'Initial (land, sun, growing, fiber)' },
  { dimensions: 8, name: 'Phase 2 (+ elevation, water, temp, precip)' },
  { dimensions: 12, name: 'Phase 3 (+ demographics, economics)' },
  { dimensions: 20, name: 'Full expansion' },
];

function estimateDataSize(counties, dimensions) {
  // Example county data structure:
  // {
  //   fipsCode: "08077",  // 5 chars = 5 bytes
  //   values: {
  //     land_value: 5200,  // ~20 bytes (key + number)
  //     sunny_days: 245,
  //     ...
  //   }
  // }

  const fipsCodeBytes = 5; // "08077"
  const bytesPerDimensionValue = 20; // property name + number + overhead
  const structureOverheadBytes = 50; // JSON formatting, commas, braces

  const bytesPerCounty = fipsCodeBytes + (dimensions * bytesPerDimensionValue) + structureOverheadBytes;
  const totalBytes = counties * bytesPerCounty;

  return {
    bytesPerCounty,
    totalBytes,
    kilobytes: Math.round(totalBytes / 1024),
    megabytes: (totalBytes / 1024 / 1024).toFixed(2),
    gzippedKB: Math.round(totalBytes / 1024 * 0.3), // Typical gzip ratio ~70% compression
  };
}

console.log('═══════════════════════════════════════════════════════════');
console.log('COUNTY DATA STORAGE ESTIMATION');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Total US Counties: ${TOTAL_COUNTIES}\n`);

EXPANSION_SCENARIOS.forEach((scenario) => {
  const estimate = estimateDataSize(TOTAL_COUNTIES, scenario.dimensions);

  console.log(`${scenario.name} (${scenario.dimensions} dimensions):`);
  console.log(`  Bytes per county: ${estimate.bytesPerCounty}`);
  console.log(`  Total size: ${estimate.kilobytes} KB (${estimate.megabytes} MB)`);
  console.log(`  Gzipped: ~${estimate.gzippedKB} KB`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════');
console.log('RECOMMENDATION');
console.log('═══════════════════════════════════════════════════════════\n');

const initialEstimate = estimateDataSize(TOTAL_COUNTIES, INITIAL_DIMENSIONS);
const fullEstimate = estimateDataSize(TOTAL_COUNTIES, 20);

console.log('✅ LOCAL STORAGE IS PERFECTLY VIABLE');
console.log('');
console.log(`Initial deployment: ${initialEstimate.kilobytes} KB uncompressed, ~${initialEstimate.gzippedKB} KB gzipped`);
console.log(`Full expansion: ${fullEstimate.kilobytes} KB uncompressed, ~${fullEstimate.gzippedKB} KB gzipped`);
console.log('');
console.log('Even with 20 dimensions, the entire dataset is < 500 KB gzipped.');
console.log('This is smaller than most images on a typical website.');
console.log('');
console.log('STRATEGY:');
console.log('  1. Fetch all data once using API scripts');
console.log('  2. Store in src/lib/data/realCountyData.ts');
console.log('  3. Commit to git repository');
console.log('  4. Update annually (data changes slowly)');
console.log('  5. No runtime API calls needed');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
