<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { countyScores } from '../stores/dimensions';
  import { scoreToColor } from '../utils/colors';

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map;
  let mapLoaded = false;

  // Real US counties GeoJSON URL
  const COUNTIES_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

  onMount(async () => {
    console.log('=== MAP MOUNTING ===');

    // Initialize map with NO BASEMAP - just colored counties on plain background
    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: [-105.5, 39.5], // Centered on Denver/Boulder area
      zoom: 7.5, // Zoomed in CLOSE to see individual Colorado counties
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Expose map globally for debugging
    (window as any).map = map;
    console.log('💡 Map exposed as window.map for debugging');

    // Subscribe to score changes
    const unsubscribe = countyScores.subscribe((scores) => {
      if (mapLoaded && scores.length > 0) {
        updateCountyColors(scores);
      }
    });

    // Load ALL US counties (no filtering - can zoom/pan anywhere)
    map.on('load', async () => {
      try {
        const response = await fetch(COUNTIES_URL);
        const allCountiesGeoJSON = await response.json();

        // Add ALL counties as source
        map.addSource('counties', {
          type: 'geojson',
          data: allCountiesGeoJSON,
        });

        // County fills (choropleth colors) - CK3 style: bold, opaque, distinct
        map.addLayer({
          id: 'county-fills',
          type: 'fill',
          source: 'counties',
          paint: {
            'fill-color': '#333333', // Default dark gray (will be replaced by updateCountyColors)
            'fill-opacity': 1.0,
          },
        });

        // County borders - THICK black lines like CK3
        map.addLayer({
          id: 'county-borders',
          type: 'line',
          source: 'counties',
          paint: {
            'line-color': '#000',
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 2,   // Thick even at low zoom
              7, 3,   // Very thick at mid zoom
              9, 4,   // Extra thick when zoomed in
            ],
            'line-opacity': 1, // Always fully visible
          },
        });

        // NOTE: County labels removed - they require glyphs (fonts) which breaks rendering
        // We can add them back later with proper font configuration

        mapLoaded = true;

        // Apply initial colors if scores are available
        if ($countyScores && $countyScores.length > 0) {
          updateCountyColors($countyScores);
        }
      } catch (error) {
        console.error('Failed to load counties:', error);
      }
    });

    return () => {
      unsubscribe();
      map.remove();
    };
  });

  // Reactively update colors when scores change
  $: if (mapLoaded && $countyScores) {
    updateCountyColors($countyScores);
  }

  function updateCountyColors(scores: any[]) {
    if (!map || !map.getLayer('county-fills') || !scores || scores.length === 0) {
      return;
    }

    // Build color expression using STATE + COUNTY properties to form FIPS code
    // Feature-level IDs cannot be accessed reliably in MapLibre expressions
    // So we concatenate STATE (e.g., "08") + COUNTY (e.g., "001") = "08001"
    const colorExpression: any = ['match', ['concat', ['get', 'STATE'], ['get', 'COUNTY']]];

    scores.forEach((score) => {
      const color = scoreToColor(score.score);
      colorExpression.push(score.fipsCode, color);
    });

    // Default color for counties without data - DARK GRAY so colored counties pop
    colorExpression.push('#333333');

    // Apply the color expression to the map
    map.setPaintProperty('county-fills', 'fill-color', colorExpression);
  }
</script>

<div class="map-wrapper">
  <div class="map-container" bind:this={mapContainer}></div>
</div>

<style>
  .map-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .map-container {
    width: 100%;
    height: 100%;
  }
</style>
