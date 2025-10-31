import type { Dimension } from '../types';

/**
 * Initial dimensions for county evaluation
 * Starting with 5 dimensions including real FBI crime statistics
 */
export const dimensions: Dimension[] = [
  {
    id: 'land_value',
    name: 'Land Value',
    icon: 'land_value',
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
    icon: 'sunny_days',
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
    icon: 'growing_season',
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
    icon: 'fiber_coverage',
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
    icon: 'crime_rate',
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
    icon: 'four_seasons',
    description: 'Climate score for distinct seasons: moderate summers (70-85°F ideal), cold snowy winters, good seasonal variation (estimated from latitude and elevation patterns)',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true, // Higher score = better four-season climate
    sourceUrl: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals',
  },
  {
    id: 'scenery',
    name: 'Scenery',
    icon: 'scenery',
    description: 'Natural beauty and outdoor recreation score based on proximity to national parks, mountain ranges, scenic trails, and coastal areas',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true,
    sourceUrl: 'https://www.nps.gov/',
  },
  {
    id: 'population_density',
    name: 'Privacy',
    icon: 'population_density',
    description: 'Population density (2020 Census) - Lower density means more solitude, privacy, and affordable land',
    unit: 'people/sq mi',
    min: 0,
    max: 500,
    higherIsBetter: false, // Lower density = more privacy
    sourceUrl: 'https://www.census.gov/',
  },
  {
    id: 'property_tax_rate',
    name: 'Property Tax',
    icon: 'property_tax_rate',
    description: 'Effective property tax rate as % of home value (Tax Foundation 2023) - Critical ongoing cost of land ownership',
    unit: '% of value',
    min: 0,
    max: 2.5,
    higherIsBetter: false, // Lower taxes = more affordable
    sourceUrl: 'https://taxfoundation.org/',
  },
  {
    id: 'water_availability',
    name: 'Water Access',
    icon: 'water_availability',
    description: 'Water availability score based on precipitation, aquifer access, and groundwater depth - Essential for off-grid living',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true,
    sourceUrl: 'https://www.usgs.gov/mission-areas/water-resources',
  },
  {
    id: 'hunting_fishing',
    name: 'Hunting/Fishing',
    icon: 'hunting_fishing',
    description: 'Game/fish populations and public land access - Food security and sustainable protein source',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true,
    sourceUrl: 'https://www.fws.gov/',
  },
  {
    id: 'homesteading_freedom',
    name: 'Homestead Freedom',
    icon: 'homesteading_freedom',
    description: 'Composite score: building code permissiveness, livestock regulations, off-grid friendliness - Ability to build and live independently',
    unit: 'score',
    min: 0,
    max: 100,
    higherIsBetter: true,
    sourceUrl: 'https://www.iccsafe.org/',
  },
];

/**
 * Get a dimension by ID
 */
export function getDimension(id: string): Dimension | undefined {
  return dimensions.find((d) => d.id === id);
}
