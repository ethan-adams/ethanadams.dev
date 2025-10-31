# Data Fetching Scripts

This directory contains scripts to fetch real county data from public APIs and combine it into a unified data structure.

## Overview

The data fetching process has 3 steps:

1. **Fetch base county list** - Get all US counties with FIPS codes
2. **Fetch dimension data** - Get data for each dimension (land value, sunny days, etc.)
3. **Combine data** - Merge everything into `realCountyData.ts`

## Prerequisites

### API Keys (Free)

You'll need to register for these free API keys:

1. **USDA NASS Quick Stats API**
   - Register: https://quickstats.nass.usda.gov/api
   - Instant approval, key sent immediately
   - Used for: Land value data

2. **NOAA NCEI Climate Data Online API**
   - Register: https://www.ncdc.noaa.gov/cdo-web/token
   - Key sent via email within 1-2 hours
   - Used for: Sunny days, growing season

### Environment Variables

Create a `.env` file in the project root:

```bash
USDA_API_KEY=your_usda_key_here
NOAA_API_KEY=your_noaa_key_here
```

Or export them in your shell:

```bash
export USDA_API_KEY=your_usda_key_here
export NOAA_API_KEY=your_noaa_key_here
```

## Usage

### Step 1: Fetch Base County List

This downloads the complete list of 3,234 US counties from SimpleMaps (no API key needed).

```bash
node scripts/fetch-county-base.js
```

**Output**: `src/lib/data/countyDatabase.ts`

**Contains**:
- FIPS codes
- County names and states
- Lat/lng coordinates
- Population data

### Step 2: Fetch Dimension Data

Run each dimension fetch script. You can run these in any order or skip dimensions you don't need yet.

#### Land Value

```bash
USDA_API_KEY=your_key node scripts/fetch-land-value.js
```

**Output**: `src/lib/data/dimensionData/landValue.ts`

#### Sunny Days (TODO)

```bash
NOAA_API_KEY=your_key node scripts/fetch-sunny-days.js
```

**Output**: `src/lib/data/dimensionData/sunnyDays.ts`

#### Growing Season (TODO)

```bash
NOAA_API_KEY=your_key node scripts/fetch-growing-season.js
```

**Output**: `src/lib/data/dimensionData/growingSeason.ts`

#### Fiber Coverage (TODO)

```bash
node scripts/fetch-fiber-coverage.js
```

**Output**: `src/lib/data/dimensionData/fiberCoverage.ts`

### Step 3: Combine All Data

After fetching all dimension data, combine everything:

```bash
node scripts/combine-real-data.js
```

**Output**: `src/lib/data/realCountyData.ts`

This creates the final unified data structure that the app uses.

## Quick Start (Parallel Fetching)

To fetch all data at once (requires all API keys):

```bash
# Fetch base data
node scripts/fetch-county-base.js

# Fetch all dimensions in parallel
USDA_API_KEY=your_usda_key node scripts/fetch-land-value.js &
NOAA_API_KEY=your_noaa_key node scripts/fetch-sunny-days.js &
NOAA_API_KEY=your_noaa_key node scripts/fetch-growing-season.js &
node scripts/fetch-fiber-coverage.js &
wait

# Combine
node scripts/combine-real-data.js
```

## Data Structure

### Base County Database

```typescript
interface CountyBase {
  fipsCode: string;      // "08077"
  name: string;          // "Mesa"
  state: string;         // "Colorado"
  stateAbbrev: string;   // "CO"
  lat: number;           // 39.0639
  lng: number;           // -108.5507
  population: number;    // 155703
}
```

### Dimension Data

Each dimension data file exports a simple mapping:

```typescript
const landValueData: Record<string, number> = {
  "08077": 5200,   // Mesa County: $5,200/acre
  "08097": 48000,  // Pitkin County: $48,000/acre
  // ...
};
```

### Combined Real Data

```typescript
interface CountyData {
  fipsCode: string;
  values: Record<string, number>;
}

const realCountyData: CountyData[] = [
  {
    fipsCode: "08077",
    values: {
      land_value: 5200,
      sunny_days: 245,
      growing_season: 180,
      fiber_coverage: 75
    }
  },
  // ... 3,234 counties
];
```

## Rate Limits

### USDA NASS
- 1 request per second
- 50,000 records per request
- Strategy: Fetch all counties in one request

### NOAA NCEI
- 1,000 requests per day
- 1,000 records per request
- Strategy: Batch by state, cache results

## Troubleshooting

### "API key not set"

Make sure you've set the environment variables:

```bash
export USDA_API_KEY=your_key
export NOAA_API_KEY=your_key
```

Or use `.env` file.

### "No data returned"

Possible causes:
- Invalid API key
- Data not available for specified year
- Query parameters need adjustment

Check the API documentation and try adjusting query parameters.

### "Module not found"

Make sure to run from the project root:

```bash
cd /path/to/ethanadams.dev
node scripts/fetch-county-base.js
```

## File Sizes

Expected output sizes:

- `countyDatabase.ts`: ~500 KB (all 3,234 counties)
- `landValue.ts`: ~100 KB (~2,000 agricultural counties)
- `sunnyDays.ts`: ~150 KB (most counties)
- `growingSeason.ts`: ~150 KB (most counties)
- `fiberCoverage.ts`: ~150 KB (all counties)
- **Total**: ~1 MB uncompressed, ~300 KB gzipped

## Update Schedule

County characteristics change slowly. Recommended update schedule:

- **Annually**: Land values (USDA Census every 5 years, but estimates updated annually)
- **Every 5 years**: Climate data (NOAA Climate Normals updated every 10 years)
- **Quarterly**: Fiber coverage (FCC updates quarterly)

For version 1, fetch once and commit to git. Update in v2 next year.

## Next Steps

After generating `realCountyData.ts`:

1. Update `src/lib/stores/dimensions.ts` to import real data
2. Replace mock `expandedCountyData` with `realCountyData`
3. Test the map
4. Commit the data files to git
5. Deploy!
