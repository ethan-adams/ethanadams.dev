/**
 * Expanded county data for Western US (30 counties across CO, WY, MT)
 * Using realistic geographic-based estimates until we integrate real APIs
 *
 * Data approximations based on:
 * - Land value: Population density and urban proximity
 * - Sunny days: Latitude and longitude (western states get more sun)
 * - Growing season: Latitude (southern = longer season)
 * - Fiber coverage: Population (cities have better coverage)
 */

import type { CountyData } from '../types';

export const expandedCountyData: CountyData[] = [
  // COLORADO - 15 major counties
  { fipsCode: '08001', values: { land_value: 25000, sunny_days: 245, growing_season: 155, fiber_coverage: 75 } }, // Adams
  { fipsCode: '08005', values: { land_value: 28000, sunny_days: 245, growing_season: 155, fiber_coverage: 80 } }, // Arapahoe
  { fipsCode: '08013', values: { land_value: 35000, sunny_days: 240, growing_season: 145, fiber_coverage: 85 } }, // Boulder
  { fipsCode: '08031', values: { land_value: 42000, sunny_days: 245, growing_season: 150, fiber_coverage: 90 } }, // Denver
  { fipsCode: '08035', values: { land_value: 32000, sunny_days: 250, growing_season: 150, fiber_coverage: 80 } }, // Douglas
  { fipsCode: '08037', values: { land_value: 45000, sunny_days: 250, growing_season: 90, fiber_coverage: 75 } }, // Eagle (Vail)
  { fipsCode: '08041', values: { land_value: 18000, sunny_days: 255, growing_season: 160, fiber_coverage: 70 } }, // El Paso (Colorado Springs)
  { fipsCode: '08045', values: { land_value: 8000, sunny_days: 245, growing_season: 130, fiber_coverage: 40 } }, // Garfield
  { fipsCode: '08049', values: { land_value: 12000, sunny_days: 235, growing_season: 100, fiber_coverage: 35 } }, // Grand
  { fipsCode: '08059', values: { land_value: 30000, sunny_days: 240, growing_season: 150, fiber_coverage: 82 } }, // Jefferson
  { fipsCode: '08069', values: { land_value: 22000, sunny_days: 235, growing_season: 140, fiber_coverage: 78 } }, // Larimer (Fort Collins)
  { fipsCode: '08077', values: { land_value: 6000, sunny_days: 265, growing_season: 180, fiber_coverage: 60 } }, // Mesa (Grand Junction)
  { fipsCode: '08097', values: { land_value: 50000, sunny_days: 240, growing_season: 85, fiber_coverage: 80 } }, // Pitkin (Aspen)
  { fipsCode: '08117', values: { land_value: 40000, sunny_days: 260, growing_season: 75, fiber_coverage: 70 } }, // Summit (Breckenridge)
  { fipsCode: '08123', values: { land_value: 9000, sunny_days: 245, growing_season: 145, fiber_coverage: 65 } }, // Weld (Greeley)

  // WYOMING - 3 major counties
  { fipsCode: '56001', values: { land_value: 5000, sunny_days: 230, growing_season: 110, fiber_coverage: 55 } }, // Albany (Laramie)
  { fipsCode: '56021', values: { land_value: 7000, sunny_days: 235, growing_season: 115, fiber_coverage: 60 } }, // Laramie (Cheyenne)
  { fipsCode: '56025', values: { land_value: 4500, sunny_days: 225, growing_season: 105, fiber_coverage: 50 } }, // Natrona (Casper)

  // MONTANA - 5 major counties
  { fipsCode: '30013', values: { land_value: 3500, sunny_days: 200, growing_season: 115, fiber_coverage: 58 } }, // Cascade (Great Falls)
  { fipsCode: '30029', values: { land_value: 8000, sunny_days: 190, growing_season: 110, fiber_coverage: 65 } }, // Flathead (Kalispell)
  { fipsCode: '30049', values: { land_value: 6500, sunny_days: 195, growing_season: 115, fiber_coverage: 62 } }, // Lewis and Clark (Helena)
  { fipsCode: '30063', values: { land_value: 9000, sunny_days: 185, growing_season: 120, fiber_coverage: 70 } }, // Missoula
  { fipsCode: '30111', values: { land_value: 5500, sunny_days: 205, growing_season: 125, fiber_coverage: 68 } }, // Yellowstone (Billings)

  // IDAHO - 3 major counties
  { fipsCode: '16001', values: { land_value: 12000, sunny_days: 210, growing_season: 140, fiber_coverage: 72 } }, // Ada (Boise)
  { fipsCode: '16027', values: { land_value: 6000, sunny_days: 205, growing_season: 130, fiber_coverage: 48 } }, // Canyon (Nampa)
  { fipsCode: '16055', values: { land_value: 8500, sunny_days: 200, growing_season: 125, fiber_coverage: 58 } }, // Kootenai (Coeur d'Alene)

  // UTAH - 4 major counties
  { fipsCode: '49035', values: { land_value: 18000, sunny_days: 255, growing_season: 165, fiber_coverage: 80 } }, // Salt Lake
  { fipsCode: '49049', values: { land_value: 14000, sunny_days: 260, growing_season: 170, fiber_coverage: 75 } }, // Utah (Provo)
  { fipsCode: '49011', values: { land_value: 11000, sunny_days: 250, growing_season: 155, fiber_coverage: 68 } }, // Davis (Farmington)
  { fipsCode: '49057', values: { land_value: 5000, sunny_days: 270, growing_season: 180, fiber_coverage: 50 } }, // Weber (Ogden)
];
