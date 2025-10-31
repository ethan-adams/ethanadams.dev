<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import ControlPanel from './lib/components/ControlPanel.svelte';
  import { countyScores } from './lib/stores/dimensions';
  import { theme } from './lib/stores/theme';
  import { onMount } from 'svelte';

  let showDebug = $state(false);

  // Toggle debug with 'd' key
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'd') {
      showDebug = !showDebug;
    }
  }

  // Initialize theme on mount
  onMount(() => {
    document.documentElement.setAttribute('data-theme', $theme);
  });

  // Update theme attribute when theme changes
  $effect(() => {
    document.documentElement.setAttribute('data-theme', $theme);
  });
</script>

<svelte:window onkeypress={handleKeyPress} />

<main>
  <ControlPanel />
  <Map />

  {#if showDebug}
    <div class="debug-overlay">
      <h3>Debug Info (press 'd' to toggle)</h3>
      <p><strong>County Scores:</strong> {$countyScores.length} counties</p>
      <details>
        <summary>First 5 counties</summary>
        <pre>{JSON.stringify($countyScores.slice(0, 5), null, 2)}</pre>
      </details>
      <p><strong>Check browser console (F12) for map logs!</strong></p>
      <p style="color: #ff6b6b;">
        <strong>Not seeing colors?</strong><br>
        1. Open Console (F12)<br>
        2. Look for "UPDATING COLORS" message<br>
        3. Try typing: <code>map.setPaintProperty('county-fills', 'fill-color', '#FF0000')</code>
      </p>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .debug-overlay {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
    font-size: 14px;
  }

  .debug-overlay h3 {
    margin: 0 0 10px 0;
    color: #4fc3f7;
  }

  .debug-overlay code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }

  .debug-overlay pre {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 11px;
  }
</style>
