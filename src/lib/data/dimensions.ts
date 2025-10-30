import type { Dimension } from '../types';

/**
 * Initial dimensions for county evaluation
 * Starting with 4 low-cost, easy-to-obtain data dimensions
 */
export const dimensions: Dimension[] = [
  {
    id: 'land_value',
    name: 'Land Value',
    description: 'Average price per acre for undeveloped land',
    unit: '$/acre',
    min: 0,
    max: 50000,
    higherIsBetter: false, // Lower land value is better (more affordable)
  },
  {
    id: 'sunny_days',
    name: 'Sunny Days',
    description: 'Average number of sunny days per year',
    unit: 'days/year',
    min: 100,
    max: 300,
    higherIsBetter: true, // More sunny days is better
  },
  {
    id: 'growing_season',
    name: 'Growing Season',
    description: 'Length of frost-free growing season',
    unit: 'days',
    min: 60,
    max: 240,
    higherIsBetter: true, // Longer growing season is better
  },
  {
    id: 'fiber_coverage',
    name: 'Fiber Availability',
    description: 'Percentage of county with fiber internet access',
    unit: '% coverage',
    min: 0,
    max: 100,
    higherIsBetter: true, // Higher fiber coverage is better
  },
];

/**
 * Get a dimension by ID
 */
export function getDimension(id: string): Dimension | undefined {
  return dimensions.find((d) => d.id === id);
}
