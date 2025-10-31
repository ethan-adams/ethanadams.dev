/**
 * Preset dimension configurations for common use cases
 * Quickly jump to optimized settings for specific goals
 */

export interface DimensionPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  dimensionOrder: string[]; // Ordered by priority (first = most important)
  biasCurve?: number; // Optional custom bias, defaults to 2.0
}

export const presets: DimensionPreset[] = [
  {
    id: 'homesteading',
    name: 'Best for Homesteading',
    icon: 'homesteading',
    description: 'Off-grid living with water, freedom, and low density',
    dimensionOrder: [
      'water_availability',
      'homesteading_freedom',
      'population_density', // Lower is better (privacy)
      'property_tax_rate', // Lower is better
      'land_value', // Lower is better
      'hunting_fishing',
      'growing_season',
      'scenery',
      'four_seasons',
      'crime_rate',
      'sunny_days',
      'fiber_coverage'
    ],
    biasCurve: 2.2 // Slightly higher emphasis on top priorities
  },
  {
    id: 'affordable',
    name: 'Most Affordable',
    icon: 'affordable',
    description: 'Lowest land costs and taxes for tight budgets',
    dimensionOrder: [
      'land_value', // Lower is better
      'property_tax_rate', // Lower is better
      'population_density', // Lower density = cheaper land
      'homesteading_freedom',
      'water_availability',
      'growing_season',
      'crime_rate',
      'hunting_fishing',
      'fiber_coverage',
      'sunny_days',
      'scenery',
      'four_seasons'
    ],
    biasCurve: 2.5 // Strong emphasis on affordability
  },
  {
    id: 'food_security',
    name: 'Food Independence',
    icon: 'food_security',
    description: 'Maximize food production and self-sufficiency',
    dimensionOrder: [
      'growing_season',
      'water_availability',
      'hunting_fishing',
      'homesteading_freedom',
      'land_value', // Lower is better (afford more land)
      'population_density',
      'property_tax_rate',
      'sunny_days',
      'crime_rate',
      'scenery',
      'four_seasons',
      'fiber_coverage'
    ],
    biasCurve: 2.0
  },
  {
    id: 'privacy',
    name: 'Maximum Privacy',
    icon: 'privacy',
    description: 'Remote, low-density areas with solitude',
    dimensionOrder: [
      'population_density', // Lower is better
      'homesteading_freedom',
      'land_value', // Lower is better
      'property_tax_rate', // Lower is better
      'water_availability',
      'scenery',
      'crime_rate',
      'hunting_fishing',
      'growing_season',
      'four_seasons',
      'sunny_days',
      'fiber_coverage' // Least important for privacy seekers
    ],
    biasCurve: 2.8 // Very strong emphasis on low density
  },
  {
    id: 'outdoor_lifestyle',
    name: 'Outdoor Lifestyle',
    icon: 'outdoor_lifestyle',
    description: 'Hunting, fishing, hiking, and natural beauty',
    dimensionOrder: [
      'scenery',
      'hunting_fishing',
      'four_seasons',
      'water_availability',
      'homesteading_freedom',
      'population_density',
      'growing_season',
      'property_tax_rate',
      'land_value',
      'crime_rate',
      'sunny_days',
      'fiber_coverage'
    ],
    biasCurve: 2.0
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: 'balanced',
    description: 'Even weight across all dimensions',
    dimensionOrder: [
      'land_value',
      'property_tax_rate',
      'water_availability',
      'homesteading_freedom',
      'population_density',
      'hunting_fishing',
      'growing_season',
      'crime_rate',
      'scenery',
      'four_seasons',
      'sunny_days',
      'fiber_coverage'
    ],
    biasCurve: 1.0 // Very even distribution
  }
];
