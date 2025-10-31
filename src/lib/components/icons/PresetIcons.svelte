<script lang="ts">
  export let name: string;
  export let size: number = 20;
  export let strokeWidth: number = 2;

  // Cute preset icons matching the dimension icon style
  const icons: Record<string, string> = {
    // Homesteading - Barn with silo
    homesteading: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                   <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
                   <circle cx="8" cy="12" r="1" fill="currentColor"/>
                   <circle cx="16" cy="12" r="1" fill="currentColor"/>`,

    // Affordable - Piggy bank
    affordable: `<circle cx="12" cy="8" r="7"/>
                 <ellipse cx="12" cy="8" rx="7" ry="3"/>
                 <path d="M5 8v7c0 1.66 3.13 3 7 3s7-1.34 7-3V8"/>
                 <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"/>
                 <circle cx="15" cy="8" r="0.5" fill="currentColor"/>`,

    // Food Security - Wheat/grain with smile
    food_security: `<path d="M12 22v-8"/>
                    <path d="M12 8s-3-3-6-3c0 0 0 6 6 9"/>
                    <path d="M12 8s3-3 6-3c0 0 0 6-6 9"/>
                    <circle cx="12" cy="21" r="2"/>
                    <path d="M10 5a2 2 0 0 0 4 0"/>`,

    // Privacy - Tree with forest
    privacy: `<path d="M12 2v20"/>
              <path d="M17 6l-5 10-5-10z"/>
              <path d="M7 4l5 8 5-8"/>
              <circle cx="12" cy="2" r="1" fill="currentColor"/>`,

    // Outdoor Lifestyle - Mountains with happy path
    outdoor_lifestyle: `<path d="M3 20h18"/>
                       <path d="M6.5 20l5.5-11 4 7 4-9"/>
                       <circle cx="18" cy="6" r="2"/>
                       <path d="M4 16a2 2 0 0 1 4 0"/>`,

    // Balanced - Scale with smiley
    balanced: `<path d="M6 3h12"/>
            <path d="M12 3v18"/>
            <path d="M5 9l7-6 7 6"/>
            <path d="M5 9v6a2 2 0 0 0 2 2h3"/>
            <path d="M19 9v6a2 2 0 0 1-2 2h-3"/>
            <circle cx="9" cy="9" r="0.5" fill="currentColor"/>
            <circle cx="15" cy="9" r="0.5" fill="currentColor"/>`
  };

  const iconPath = icons[name] || icons.balanced;
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
