<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import ControlPanel from './lib/components/ControlPanel.svelte';
  import MandarinPractice from './lib/components/MandarinPractice.svelte';
  import { countyScores } from './lib/stores/dimensions';
  import { theme } from './lib/stores/theme';
  import { onMount } from 'svelte';

  let showDebug = $state(false);
  let pathname = $state('/');

  // Toggle debug with 'd' key
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'd') {
      showDebug = !showDebug;
    }
  }

  // Initialize theme on mount
  onMount(() => {
    document.documentElement.setAttribute('data-theme', $theme);
    pathname = window.location.pathname;
  });

  // Update theme attribute when theme changes
  $effect(() => {
    document.documentElement.setAttribute('data-theme', $theme);
  });
</script>

<svelte:window onkeypress={handleKeyPress} onpopstate={() => (pathname = window.location.pathname)} />

<main class:project-page={pathname.startsWith('/mandarin')}>
  <nav class="project-nav" aria-label="Project navigation">
    <a class:active={pathname === '/'} href="/">Homesteader</a>
    <a class:active={pathname.startsWith('/mandarin')} href="/mandarin">Mandarin</a>
  </nav>

  {#if pathname.startsWith('/mandarin')}
    <MandarinPractice />
  {:else}
    <ControlPanel />
    <Map />
  {/if}

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

  .project-page {
    display: block;
    min-height: 100%;
    height: auto;
  }

  .project-nav {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    background: var(--overlay-bg);
    box-shadow: var(--shadow-md);
    z-index: 20;
  }

  .project-nav a {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 650;
    line-height: 1;
  }

  .project-nav a:hover,
  .project-nav a.active {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }

  .debug-overlay {
    position: fixed;
    top: 10px;
    right: 10px;
    background: var(--overlay-bg);
    color: var(--text-primary);
    padding: 20px;
    border-radius: 8px;
    border: 2px solid var(--border-primary);
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
    font-size: 14px;
    box-shadow: var(--shadow-md);
  }

  .debug-overlay h3 {
    margin: 0 0 10px 0;
    color: var(--accent-primary);
  }

  .debug-overlay code {
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }

  .debug-overlay pre {
    background: var(--bg-tertiary);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 11px;
  }
</style>
