import type { County, CountyData } from '../types';

/**
 * Western Colorado mountain counties for testing
 * These are real counties with realistic (but simplified) data
 */
export const counties: County[] = [
  { fipsCode: '08037', name: 'Eagle', state: 'Colorado', stateAbbrev: 'CO' },
  { fipsCode: '08045', name: 'Garfield', state: 'Colorado', stateAbbrev: 'CO' },
  { fipsCode: '08097', name: 'Pitkin', state: 'Colorado', stateAbbrev: 'CO' },
  { fipsCode: '08117', name: 'Summit', state: 'Colorado', stateAbbrev: 'CO' },
  { fipsCode: '08049', name: 'Grand', state: 'Colorado', stateAbbrev: 'CO' },
  { fipsCode: '08077', name: 'Mesa', state: 'Colorado', stateAbbrev: 'CO' },
];

/**
 * Mock dimension values for Western CO counties
 * Values are realistic estimates for demonstration
 */
export const countyDataValues: CountyData[] = [
  {
    fipsCode: '08037', // Eagle County (Vail area - expensive, touristy)
    values: {
      land_value: 45000, // Very expensive
      sunny_days: 250,
      growing_season: 90, // Short season (high elevation)
      fiber_coverage: 75, // Good coverage (resort town)
    },
  },
  {
    fipsCode: '08045', // Garfield County (more affordable, rural)
    values: {
      land_value: 8000, // Affordable
      sunny_days: 245,
      growing_season: 130,
      fiber_coverage: 40, // Lower coverage (rural)
    },
  },
  {
    fipsCode: '08097', // Pitkin County (Aspen - VERY expensive)
    values: {
      land_value: 50000, // Most expensive
      sunny_days: 240,
      growing_season: 85,
      fiber_coverage: 80, // Good coverage
    },
  },
  {
    fipsCode: '08117', // Summit County (Breckenridge - expensive)
    values: {
      land_value: 40000,
      sunny_days: 260, // Very sunny
      growing_season: 75, // Very short (high elevation)
      fiber_coverage: 70,
    },
  },
  {
    fipsCode: '08049', // Grand County (more remote, moderate)
    values: {
      land_value: 12000,
      sunny_days: 235,
      growing_season: 100,
      fiber_coverage: 35, // Lower coverage
    },
  },
  {
    fipsCode: '08077', // Mesa County (Grand Junction - lower elevation, affordable)
    values: {
      land_value: 6000, // Most affordable
      sunny_days: 265, // Very sunny
      growing_season: 180, // Longer season (lower elevation)
      fiber_coverage: 60,
    },
  },
];

/**
 * Get county data by FIPS code
 */
export function getCountyData(fipsCode: string): CountyData | undefined {
  return countyDataValues.find((c) => c.fipsCode === fipsCode);
}

/**
 * Get county info by FIPS code
 */
export function getCounty(fipsCode: string): County | undefined {
  return counties.find((c) => c.fipsCode === fipsCode);
}
