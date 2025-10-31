<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { countyScores } from '../stores/dimensions';
  import { theme } from '../stores/theme';
  import { topCounties, topCountiesCount } from '../stores/topCounties';
  import { scoreToColor } from '../utils/colors';
  import { realCountyData } from '../data/realCountyData';
  import { dimensions } from '../data/dimensions';
  import { countyDatabase } from '../data/countyDatabase';

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map;
  let mapLoaded = false;
  let currentMapStyle = $state<string | null>(null); // Track which theme is currently applied to map
  let hoveredCountyId: string | null = null;
  let tooltip = $state<{ x: number; y: number; data: any } | null>(null);
  let searchQuery = $state('');
  let searchResults = $state<any[]>([]);
  let showSearchResults = $state(false);

  // Real US counties GeoJSON URL
  const COUNTIES_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

  // Search functionality
  $effect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      searchResults = realCountyData
        .filter(county =>
          county.name.toLowerCase().includes(query) ||
          county.state.toLowerCase().includes(query)
        )
        .slice(0, 10);
      showSearchResults = true;
    } else {
      searchResults = [];
      showSearchResults = false;
    }
  });

  function selectCounty(county: any) {
    if (map) {
      map.flyTo({
        center: [county.lng, county.lat],
        zoom: 8,
        duration: 1500
      });
      searchQuery = '';
      showSearchResults = false;
    }
  }

  onMount(async () => {
    console.log('=== MAP MOUNTING ===');

    // Initialize map with theme-appropriate basemap
    const getMapStyle = () => {
      return $theme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    };

    map = new maplibregl.Map({
      container: mapContainer,
      style: getMapStyle(),
      center: [-98.5, 39.5], // Centered on US
      zoom: 3.5, // Zoomed out to see whole country including AK/HI
      minZoom: 3.0, // Prevent zooming out past US extent
      maxZoom: 12, // Prevent excessive zoom in
      maxBounds: [
        [-180, 15], // Southwest coordinates (includes all of Alaska)
        [-50, 72]   // Northeast coordinates
      ]
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

        // County fills (choropleth colors) - Subtle overlay to see base map
        map.addLayer({
          id: 'county-fills',
          type: 'fill',
          source: 'counties',
          paint: {
            'fill-color': '#333333', // Default dark gray (will be replaced by updateCountyColors)
            'fill-opacity': 0.5, // Semi-transparent to see base map
          },
        });

        // County borders - Thin subtle lines
        map.addLayer({
          id: 'county-borders',
          type: 'line',
          source: 'counties',
          paint: {
            'line-color': '#333333', // Dark gray instead of black
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 0.5,  // Very thin at low zoom
              7, 1,    // Thin at mid zoom
              9, 1.5,  // Slightly thicker when zoomed in
            ],
            'line-opacity': 0.4, // Semi-transparent
          },
        });

        // Top counties highlight - BRIGHT, OBVIOUS fill
        map.addLayer({
          id: 'top-counties-highlight',
          type: 'fill',
          source: 'counties',
          paint: {
            'fill-color': '#FFD700', // Bright gold
            'fill-opacity': 0, // Will be set to 0.7 for highlighted counties
          },
        });

        // Top counties border - THICK, VISIBLE outline
        map.addLayer({
          id: 'top-counties-border',
          type: 'line',
          source: 'counties',
          paint: {
            'line-color': '#B8860B', // Darker gold (dark goldenrod) for contrast
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 3,     // Thick even at country view
              5, 5,     // Very thick at mid zoom
              7, 8,     // Extremely thick when zoomed in
            ],
            'line-opacity': 0, // Will be set to 1 for highlighted counties
          },
        });

        // County name labels - fade in at mid zoom, fade out at extreme zooms
        // CK3-inspired bold all-caps style with modern font
        try {
          map.addLayer({
            id: 'county-labels',
            type: 'symbol',
            source: 'counties',
            layout: {
              'text-field': ['upcase', ['get', 'NAME']],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 11,
                7, 13,
                9, 15
              ],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-anchor': 'center',
              'text-max-width': 8,
              'text-letter-spacing': 0.05,
            },
            paint: {
              'text-color': $theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
              'text-halo-color': $theme === 'dark' ? '#1a1a1a' : '#ffffff',
              'text-halo-width': 2.5,
              'text-halo-blur': 0.5,
              'text-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 0,      // Hidden when zoomed out
                5.5, 1,    // Fade in
                7, 1,      // Fully visible at mid-zoom
                9, 0.5,    // Start fading out when very zoomed in
                10, 0      // Hidden when very zoomed in
              ]
            }
          });
        } catch (error) {
          console.warn('Could not add county labels (font not available):', error);
        }

        // Hover interactions
        map.on('mousemove', 'county-fills', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const fipsCode = (feature.properties.STATE || '') + (feature.properties.COUNTY || '');

            if (hoveredCountyId !== fipsCode) {
              hoveredCountyId = fipsCode;

              // Find county data
              const countyData = realCountyData.find(c => c.fipsCode === fipsCode);
              const scoreData = $countyScores.find(s => s.fipsCode === fipsCode);
              const countyInfo = countyDatabase.find(c => c.fipsCode === fipsCode);

              if (countyData && feature.properties && countyInfo) {
                tooltip = {
                  x: e.point.x,
                  y: e.point.y,
                  data: {
                    name: countyInfo.name,
                    state: countyInfo.state,
                    stateAbbrev: countyInfo.stateAbbrev,
                    fipsCode: fipsCode,
                    score: scoreData?.score || 0,
                    dimensions: countyData.values
                  }
                };
              }
            }
          }
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'county-fills', () => {
          hoveredCountyId = null;
          tooltip = null;
          map.getCanvas().style.cursor = '';
        });

        mapLoaded = true;
        currentMapStyle = $theme; // Set initial theme
        console.log('✅ Map loaded with theme:', $theme);

        // Apply initial colors if scores are available
        if ($countyScores && $countyScores.length > 0) {
          updateCountyColors($countyScores);
        }

        // Apply initial top counties highlight
        if ($topCounties && $topCounties.length > 0) {
          updateTopCountiesHighlight($topCounties);
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
  $effect(() => {
    if (mapLoaded && $countyScores) {
      updateCountyColors($countyScores);
    }
  });

  // Reactively update top counties highlight
  $effect(() => {
    if (mapLoaded && $topCounties) {
      updateTopCountiesHighlight($topCounties);
    }
  });

  // Update map style when theme changes
  $effect(() => {
    console.log('🎨 Theme effect triggered:', {
      theme: $theme,
      currentMapStyle,
      mapLoaded,
      hasMap: !!map,
      willSwitch: map && mapLoaded && $theme !== currentMapStyle
    });

    if (map && mapLoaded && $theme !== currentMapStyle) {
      const newStyle = $theme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      console.log(`🔄 Switching map style to ${$theme} mode from ${currentMapStyle}`);
      console.log(`📍 Preserving position:`, { center: currentCenter, zoom: currentZoom });
      map.setStyle(newStyle);

      // Re-add county layers after style loads
      map.once('styledata', async () => {
        try {
          const response = await fetch(COUNTIES_URL);
          const allCountiesGeoJSON = await response.json();

          if (!map.getSource('counties')) {
            map.addSource('counties', {
              type: 'geojson',
              data: allCountiesGeoJSON,
            });
          }

          if (!map.getLayer('county-fills')) {
            map.addLayer({
              id: 'county-fills',
              type: 'fill',
              source: 'counties',
              paint: {
                'fill-color': '#333333',
                'fill-opacity': 0.5,
              },
            });
          }

          if (!map.getLayer('county-borders')) {
            map.addLayer({
              id: 'county-borders',
              type: 'line',
              source: 'counties',
              paint: {
                'line-color': '#333333',
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  5, 0.5,
                  7, 1,
                  9, 1.5,
                ],
                'line-opacity': 0.4,
              },
            });
          }

          if (!map.getLayer('top-counties-highlight')) {
            map.addLayer({
              id: 'top-counties-highlight',
              type: 'fill',
              source: 'counties',
              paint: {
                'fill-color': '#FFD700',
                'fill-opacity': 0,
              },
            });
          }

          if (!map.getLayer('top-counties-border')) {
            map.addLayer({
              id: 'top-counties-border',
              type: 'line',
              source: 'counties',
              paint: {
                'line-color': '#B8860B',
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  3, 3,
                  5, 5,
                  7, 8,
                ],
                'line-opacity': 0,
              },
            });
          }

          try {
            if (!map.getLayer('county-labels')) {
              map.addLayer({
                id: 'county-labels',
                type: 'symbol',
                source: 'counties',
                layout: {
                  'text-field': ['upcase', ['get', 'NAME']],
                  'text-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    5, 11,
                    7, 13,
                    9, 15
                  ],
                  'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                  'text-letter-spacing': 0.05,
                },
                paint: {
                  'text-color': $theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                  'text-halo-color': $theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  'text-halo-width': 2.5,
                  'text-halo-blur': 0.5,
                  'text-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    5, 0,
                    6, 1,
                    8, 1,
                    10, 0
                  ],
                },
              });
            }
          } catch (e) {
            console.log('County labels not available');
          }

          // Update colors and highlights
          if ($countyScores) {
            updateCountyColors($countyScores);
          }
          if ($topCounties) {
            updateTopCountiesHighlight($topCounties);
          }

          // Add hover interactions
          map.on('mousemove', 'county-fills', (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const fipsCode = (feature.properties.STATE || '') + (feature.properties.COUNTY || '');
              const countyData = realCountyData.find(c => c.fipsCode === fipsCode);
              const scoreData = $countyScores.find(s => s.fipsCode === fipsCode);
              const countyInfo = countyDatabase.find(c => c.fipsCode === fipsCode);

              if (countyData && scoreData && feature.properties && countyInfo) {
                tooltip = {
                  x: e.point.x,
                  y: e.point.y,
                  data: {
                    name: countyInfo.name,
                    state: countyInfo.state,
                    stateAbbrev: countyInfo.stateAbbrev,
                    fipsCode: fipsCode,
                    score: scoreData.score,
                    dimensions: countyData.values
                  }
                };
              }
            }
          });

          map.on('mouseleave', 'county-fills', () => {
            tooltip = null;
          });

          map.getCanvas().style.cursor = 'default';
          map.on('mouseenter', 'county-fills', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'county-fills', () => {
            map.getCanvas().style.cursor = 'default';
          });

          map.setCenter(currentCenter);
          map.setZoom(currentZoom);

          // Update currentMapStyle after successful style change
          currentMapStyle = $theme;
          console.log(`Map style changed successfully to ${$theme}`);
        } catch (error) {
          console.error('Failed to reload counties after style change:', error);
        }
      });
    }
  });

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

  function updateTopCountiesHighlight(topFipsCodes: string[]) {
    console.log('⭐ Updating top counties highlight:', topFipsCodes.length, 'counties');

    if (!map || !map.getLayer('top-counties-highlight')) {
      console.warn('⚠️ Cannot update highlights - map or layer not ready');
      return;
    }

    // Use brighter/more visible colors in dark mode
    const fillColor = $theme === 'dark' ? '#FFD700' : '#FFD700'; // Bright gold in both
    const borderColor = $theme === 'dark' ? '#FFA500' : '#B8860B'; // Brighter in dark mode

    // Update colors for current theme
    map.setPaintProperty('top-counties-highlight', 'fill-color', fillColor);
    map.setPaintProperty('top-counties-border', 'line-color', borderColor);

    // Build fill opacity expression - VERY VISIBLE in both themes
    const fillExpression: any = ['match', ['concat', ['get', 'STATE'], ['get', 'COUNTY']]];
    topFipsCodes.forEach((fipsCode) => {
      fillExpression.push(fipsCode, $theme === 'dark' ? 0.6 : 0.7); // Slightly less in dark to avoid overwhelming
    });
    fillExpression.push(0); // Default: not highlighted

    // Build border opacity expression - FULL 1.0 for top counties
    const borderExpression: any = ['match', ['concat', ['get', 'STATE'], ['get', 'COUNTY']]];
    topFipsCodes.forEach((fipsCode) => {
      borderExpression.push(fipsCode, 1); // FULLY VISIBLE border
    });
    borderExpression.push(0); // Default: not highlighted

    // Apply expressions
    map.setPaintProperty('top-counties-highlight', 'fill-opacity', fillExpression);
    map.setPaintProperty('top-counties-border', 'line-opacity', borderExpression);

    console.log('✅ Highlight updated successfully with theme:', $theme);
  }
</script>

<div class="map-wrapper">
  <!-- Search Bar -->
  <div class="search-bar">
    <input
      type="text"
      value={searchQuery}
      oninput={(e) => searchQuery = e.currentTarget.value}
      placeholder="Search for a county..."
      class="search-input"
    />
    {#if showSearchResults && searchResults.length > 0}
      <div class="search-results">
        {#each searchResults as county}
          <button
            class="search-result-item"
            onclick={() => selectCounty(county)}
          >
            <strong>{county.name}</strong>, {county.stateAbbrev}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Legend -->
  <div class="legend">
    <div class="legend-title">County Fit Score</div>
    <div class="legend-scale">
      <div class="legend-item">
        <div class="legend-color" style="background: #ff4444;"></div>
        <span>Poor Fit</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #ff8844;"></div>
        <span>Below Average</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #ffdd44;"></div>
        <span>Average</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #88dd44;"></div>
        <span>Above Average</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #44dd44;"></div>
        <span>Great Fit</span>
      </div>
    </div>
  </div>

  <!-- Hover Tooltip - Modern, Compact Design -->
  {#if tooltip}
    {@const isTopCounty = $topCounties.includes(tooltip.data.fipsCode)}
    {@const rank = isTopCounty ? $countyScores.findIndex(c => c.fipsCode === tooltip.data.fipsCode) + 1 : null}
    {@const bestDimensions = dimensions.filter(dim => {
      const thisValue = tooltip.data.dimensions[dim.id];
      if (thisValue === undefined) return false;
      const allValues = $countyScores.map(c => {
        const cd = realCountyData.find(d => d.fipsCode === c.fipsCode);
        return cd?.values[dim.id] || 0;
      });
      const bestValue = dim.higherIsBetter ? Math.max(...allValues) : Math.min(...allValues);
      return thisValue === bestValue;
    })}
    <div
      class="tooltip"
      style="left: {tooltip.x + 15}px; top: {tooltip.y + 15}px;"
    >
      <!-- County Name with Badges -->
      <div class="tooltip-title">
        <div class="county-name">
          <span class="name">{tooltip.data.name}</span>
          <span class="state">{tooltip.data.stateAbbrev}</span>
        </div>
        {#if rank === 1}
          <div class="badge gold">🏆 #1</div>
        {:else if rank && rank <= 3}
          <div class="badge silver">#{rank}</div>
        {:else if rank}
          <div class="badge">#{rank}</div>
        {/if}
      </div>

      <!-- Score -->
      <div class="score-bar">
        <div class="score-label">
          <span>Fit Score</span>
          <span class="score-value">{(tooltip.data.score * 100).toFixed(0)}%</span>
        </div>
        <div class="score-track">
          <div class="score-fill" style="width: {tooltip.data.score * 100}%"></div>
        </div>
      </div>

      <!-- Best At -->
      {#if bestDimensions.length > 0}
        <div class="best-badges">
          {#each bestDimensions as dim}
            <span class="best-badge">{dim.icon} Best</span>
          {/each}
        </div>
      {/if}

      <!-- Compact Dimensions Grid -->
      <div class="dims-grid">
        {#each dimensions as dim}
          {@const value = tooltip.data.dimensions[dim.id]}
          {#if value !== undefined}
            <div class="dim-item" title={dim.name}>
              <span class="dim-icon">{dim.icon}</span>
              <span class="dim-label">{dim.name.split(' ')[0]}</span>
              <span class="dim-val">{value.toFixed(0)}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

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

  /* Search Bar */
  .search-bar {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: var(--shadow-md);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--border-active);
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    max-height: 300px;
    overflow-y: auto;
  }

  .search-result-item {
    width: 100%;
    padding: 10px 16px;
    text-align: left;
    border: none;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
  }

  .search-result-item:hover {
    background: var(--bg-secondary);
  }

  /* Legend */
  .legend {
    position: absolute;
    bottom: 30px;
    right: 20px;
    background: var(--overlay-bg);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-primary);
    z-index: 10;
    min-width: 180px;
    backdrop-filter: blur(10px);
  }

  .legend-title {
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--text-primary);
  }

  .legend-scale {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .legend-color {
    width: 24px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid var(--border-secondary);
  }

  /* Tooltip - Modern, Sleek Design */
  .tooltip {
    position: absolute;
    background: var(--overlay-bg);
    border: 1px solid var(--border-primary);
    padding: 14px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
    z-index: 100;
    pointer-events: none;
    min-width: 200px;
    max-width: 240px;
    font-size: 13px;
    animation: tooltipIn 0.15s ease-out;
  }

  @keyframes tooltipIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Title Section */
  .tooltip-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 8px;
  }

  .county-name {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .county-name .name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .county-name .state {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    opacity: 0.8;
  }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    background: var(--accent-primary);
    color: var(--bg-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .badge.gold {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #1a1a1a;
  }

  .badge.silver {
    background: linear-gradient(135deg, #C0C0C0 0%, #909090 100%);
    color: #1a1a1a;
  }

  /* Score Bar */
  .score-bar {
    margin-bottom: 10px;
  }

  .score-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .score-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--accent-primary);
  }

  .score-track {
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary), #66bb6a);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  /* Best At Badges */
  .best-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
  }

  .best-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    background: var(--accent-gold);
    color: #1a1a1a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  /* Compact Dimensions Grid */
  .dims-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(45px, 1fr));
    gap: 6px;
  }

  .dim-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 8px 4px 6px 4px;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: help;
  }

  .dim-item:hover {
    background: var(--bg-tertiary);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .dim-icon {
    font-size: 18px;
    line-height: 1;
    margin-bottom: 2px;
  }

  .dim-label {
    font-size: 8px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    text-align: center;
    line-height: 1;
  }

  .dim-val {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
  }
</style>
