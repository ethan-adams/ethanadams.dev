/**
 * GeoJSON for Western Colorado counties
 *
 * For now, this is a placeholder. We'll fetch real GeoJSON from a free source.
 * Source: US Census Bureau TIGER/Line Shapefiles (converted to GeoJSON)
 *
 * Alternative free sources:
 * - https://eric.clst.org/tech/usgeojson/ (simplified county boundaries)
 * - https://public.opendatasoft.com/
 */

export const COUNTY_GEOJSON_URL = 'https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_20m.json';

// This URL provides all US counties at 20m resolution (simplified for web display)
// We'll filter to our Western CO counties in the Map component
