/**
 * Simplified GeoJSON for 6 Western Colorado counties
 * Using approximate bounding boxes for testing
 *
 * In production, replace with actual county boundary polygons
 */
export const westCoCountiesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { fipsCode: '08037', name: 'Eagle County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-107.5, 39.3],
          [-106.3, 39.3],
          [-106.3, 39.9],
          [-107.5, 39.9],
          [-107.5, 39.3],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { fipsCode: '08045', name: 'Garfield County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-108.5, 39.2],
          [-107.3, 39.2],
          [-107.3, 39.9],
          [-108.5, 39.9],
          [-108.5, 39.2],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { fipsCode: '08097', name: 'Pitkin County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-107.2, 38.9],
          [-106.5, 38.9],
          [-106.5, 39.4],
          [-107.2, 39.4],
          [-107.2, 38.9],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { fipsCode: '08117', name: 'Summit County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-106.5, 39.4],
          [-105.8, 39.4],
          [-105.8, 39.8],
          [-106.5, 39.8],
          [-106.5, 39.4],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { fipsCode: '08049', name: 'Grand County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-106.5, 39.8],
          [-105.7, 39.8],
          [-105.7, 40.3],
          [-106.5, 40.3],
          [-106.5, 39.8],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { fipsCode: '08077', name: 'Mesa County' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-109.0, 38.5],
          [-108.0, 38.5],
          [-108.0, 39.4],
          [-109.0, 39.4],
          [-109.0, 38.5],
        ]],
      },
    },
  ],
};
