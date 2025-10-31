<script lang="ts">
  export let name: string;
  export let size: number = 20;
  export let strokeWidth: number = 2;

  // Cuter, more fun icons while maintaining professional consistency
  const icons: Record<string, string> = {
    // Land Value - Coin stack with sparkles
    land_value: `<circle cx="12" cy="8" r="7"/>
                 <ellipse cx="12" cy="8" rx="7" ry="3"/>
                 <path d="M5 8v7c0 1.66 3.13 3 7 3s7-1.34 7-3V8"/>
                 <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"/>`,

    // Sunny Days - Happy sun with cute face
    sunny_days: `<circle cx="12" cy="12" r="5"/>
                 <line x1="12" y1="1" x2="12" y2="3"/>
                 <line x1="12" y1="21" x2="12" y2="23"/>
                 <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                 <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                 <line x1="1" y1="12" x2="3" y2="12"/>
                 <line x1="21" y1="12" x2="23" y2="12"/>
                 <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                 <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                 <circle cx="9" cy="11" r="0.5" fill="currentColor"/>
                 <circle cx="15" cy="11" r="0.5" fill="currentColor"/>
                 <path d="M9 14a3 3 0 0 0 6 0"/>`,

    // Growing Season - Cute sprout with leaves
    growing_season: `<path d="M12 22v-8"/>
                     <path d="M12 8s-3-3-6-3c0 0 0 6 6 9"/>
                     <path d="M12 8s3-3 6-3c0 0 0 6-6 9"/>
                     <circle cx="12" cy="21" r="2"/>`,

    // Fiber Coverage - WiFi waves with cute router
    fiber_coverage: `<rect x="9" y="15" width="6" height="7" rx="1"/>
                     <path d="M12 15v-3"/>
                     <circle cx="12" cy="10" r="1" fill="currentColor"/>
                     <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                     <path d="M1.42 9a16 16 0 0 1 21.16 0"/>`,

    // Crime Rate - Shield with checkmark (safety)
    crime_rate: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                 <polyline points="9 12 11 14 15 10"/>`,

    // Four Seasons - Snowflake with cute center
    four_seasons: `<circle cx="12" cy="12" r="2" fill="currentColor"/>
                   <line x1="12" y1="1" x2="12" y2="6"/>
                   <line x1="12" y1="18" x2="12" y2="23"/>
                   <line x1="4.93" y1="4.93" x2="8.46" y2="8.46"/>
                   <line x1="15.54" y1="15.54" x2="19.07" y2="19.07"/>
                   <line x1="1" y1="12" x2="6" y2="12"/>
                   <line x1="18" y1="12" x2="23" y2="12"/>
                   <line x1="4.93" y1="19.07" x2="8.46" y2="15.54"/>
                   <line x1="15.54" y1="8.46" x2="19.07" y2="4.93"/>`,

    // Scenery - Mountain with sun
    scenery: `<path d="M3 20h18"/>
              <path d="M6.5 20l5.5-11 4 7 4-9"/>
              <circle cx="18" cy="6" r="2"/>`,

    // Population Density - Cute group of people
    population_density: `<circle cx="9" cy="7" r="3"/>
                        <circle cx="17" cy="7" r="3"/>
                        <path d="M13 14H5a3 3 0 0 0-3 3v2h9"/>
                        <path d="M22 19v-2a3 3 0 0 0-3-3h-8"/>`,

    // Property Tax - Dollar with down arrows (lower is better)
    property_tax_rate: `<line x1="12" y1="2" x2="12" y2="22"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        <polyline points="8 2 4 2 4 6"/>
                        <polyline points="16 22 20 22 20 18"/>`,

    // Water Availability - Happy water drop
    water_availability: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                        <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
                        <circle cx="14" cy="14" r="0.5" fill="currentColor"/>
                        <path d="M10 17a2 2 0 0 0 4 0"/>`,

    // Hunting/Fishing - Cute fish
    hunting_fishing: `<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6z"/>
                     <circle cx="15" cy="12" r="2"/>
                     <path d="M2 12h2.5"/>
                     <path d="M22 12h-2"/>`,

    // Homesteading Freedom - House with heart/window
    homesteading_freedom: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                          <path d="M9 9h6v2H9z" fill="currentColor"/>`
  };

  const iconPath = icons[name] || icons.homesteading_freedom;
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {@html iconPath}
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
