import type { Dimension } from '../types';

/**
 * Initial dimensions for county evaluation
 * Starting with 5 dimensions including real FBI crime statistics
 */
export const dimensions: Dimension[] = [
  {
    id: 'land_value',
    name: 'Land Value',
    icon: '💰',
    description: 'Average price per acre for agricultural land (USDA Census 2022 - real API data)',
    unit: '$/acre',
    min: 0,
    max: 50000,
    higherIsBetter: false, // Lower land value is better (more affordable)
    sourceUrl: 'https://quickstats.nass.usda.gov/',
  },
  {
    id: 'sunny_days',
    name: 'Sunny Days',
    icon: '☀️',
    description: 'Average sunny days per year (estimated from NOAA climate patterns by latitude/region)',
    unit: 'days/year',
    min: 100,
    max: 300,
    higherIsBetter: true, // More sunny days is better
    sourceUrl: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals',
  },
  {
    id: 'growing_season',
    name: 'Growing Season',
    icon: '🌱',
    description: 'Frost-free days (estimated from USDA hardiness zones and latitude patterns)',
    unit: 'days',
    min: 60,
    max: 240,
    higherIsBetter: true, // Longer growing season is better
    sourceUrl: 'https://planthardiness.ars.usda.gov/',
  },
  {
    id: 'fiber_coverage',
    name: 'Fiber Availability',
    icon: '🌐',
    description: 'Fiber internet coverage (estimated from FCC state rankings and urbanization)',
    unit: '% coverage',
    min: 0,
    max: 100,
    higherIsBetter: true, // Higher fiber coverage is better
    sourceUrl: 'https://broadbandmap.fcc.gov/',
  },
  {
    id: 'crime_rate',
    name: 'Crime Rate',
    icon: '🛡️',
    description: 'Violent crime rate per 100k residents (based on FBI UCR 2022 state data with urban/rural adjustments)',
    unit: 'per 100k',
    min: 50,
    max: 1500,
    higherIsBetter: false, // Lower crime rate is better (safer)
    sourceUrl: 'https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/explorer/crime/crime-trend',
  },
  {
    id: 'four_seasons',
    name: 'Four Seasons',
    icon: '❄️',
    description: 'Climate score for distinct seasons: moderate summers (70-85°F ideal), cold snowy winters, good seasonal variation (estimated from latitude and elevation patterns)',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true, // Higher score = better four-season climate
    sourceUrl: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals',
  },
];

/**
 * Get a dimension by ID
 */
export function getDimension(id: string): Dimension | undefined {
  return dimensions.find((d) => d.id === id);
}
