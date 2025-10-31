<script lang="ts">
  import { dimensions } from '../data/dimensions';
  import { dimensionRankOrder, dimensionWeights, biasCurve, setDimensionRankOrder } from '../stores/dimensions';
  import { theme } from '../stores/theme';
  import { topCountiesCount } from '../stores/topCounties';
  import { presets } from '../stores/presets';
  import type { DimensionPreset } from '../stores/presets';
  import DimensionIcons from './icons/DimensionIcons.svelte';
  import PresetIcons from './icons/PresetIcons.svelte';

  // Get ordered dimensions based on rank
  const orderedDimensions = $derived($dimensionRankOrder.map((id: string) => dimensions.find((d) => d.id === id)!));

  let draggedIndex = $state<number | null>(null);
  let showInfoPanel = $state(false);
  let hoveredDimension = $state<string | null>(null);
  let showPresets = $state(false);

  function applyPreset(preset: DimensionPreset) {
    setDimensionRankOrder(preset.dimensionOrder);
    if (preset.biasCurve) {
      biasCurve.set(preset.biasCurve);
    }
    showPresets = false;
  }

  function handleDragStart(event: DragEvent, index: number) {
    draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Reorder the array
    const newOrder = [...$dimensionRankOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setDimensionRankOrder(newOrder);
    draggedIndex = null;
  }

  function handleDragEnd() {
    draggedIndex = null;
  }

  function getWeightForDimension(dimensionId: string): number {
    return $dimensionWeights.find((w) => w.dimensionId === dimensionId)?.weight ?? 0;
  }
</script>

<div class="control-panel">
  <div class="panel-header">
    <h1 class="app-title">Homesteader</h1>

    <!-- 3 Button Bar -->
    <div class="button-bar">
      <button
        class="bar-button"
        class:active={showPresets}
        onclick={() => showPresets = !showPresets}
        title="Quick presets"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Presets
      </button>
      <button
        class="bar-button"
        class:active={showInfoPanel}
        onclick={() => showInfoPanel = !showInfoPanel}
        title="Data sources"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Sources
      </button>
      <button
        class="bar-button"
        onclick={() => theme.toggle()}
        title={$theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {#if $theme === 'light'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {/if}
        Theme
      </button>
    </div>

    <p class="subtitle">Drag dimensions to reorder priority</p>
  </div>

  <!-- Slide-out Presets Drawer -->
  {#if showPresets}
    <div class="drawer presets-drawer">
      <div class="presets-grid">
        {#each presets as preset}
          <button
            class="preset-card"
            onclick={() => applyPreset(preset)}
            title={preset.description}
          >
            <span class="preset-icon">
              <PresetIcons name={preset.icon} size={20} />
            </span>
            <span class="preset-name">{preset.name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Slide-out Info Drawer -->
  {#if showInfoPanel}
    <div class="drawer info-drawer">
      <h3>Data Sources</h3>
      <div class="info-content">
        {#each orderedDimensions as dimension}
          <div class="info-item">
            <div class="info-item-header">
              <strong>
                {#if dimension.icon}
                  <span class="dim-icon">
                    <DimensionIcons name={dimension.icon} size={16} />
                  </span>
                {/if}
                {dimension.name}
              </strong>
              {#if dimension.sourceUrl}
                <a href={dimension.sourceUrl} target="_blank" rel="noopener noreferrer" class="source-link" title="View data source">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              {/if}
            </div>
            <p>{dimension.description}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="rank-list">
    {#each orderedDimensions as dimension, index (dimension.id)}
      {@const weight = getWeightForDimension(dimension.id)}
      <div
        class="rank-item"
        class:dragging={draggedIndex === index}
        draggable="true"
        role="button"
        tabindex="0"
        ondragstart={(e) => handleDragStart(e, index)}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, index)}
        ondragend={handleDragEnd}
        onmouseenter={() => hoveredDimension = dimension.id}
        onmouseleave={() => hoveredDimension = null}
      >
        <div class="rank-badge">#{index + 1}</div>
        <div class="rank-content">
          <div class="rank-header">
            <span class="rank-name">
              {#if dimension.icon}
                <span class="dim-icon-inline">
                  <DimensionIcons name={dimension.icon} size={18} />
                </span>
              {/if}
              {dimension.name}
            </span>
            <span class="rank-weight">{(weight * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div class="drag-handle">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="4" r="1.2" fill="currentColor"/>
            <circle cx="10" cy="4" r="1.2" fill="currentColor"/>
            <circle cx="6" cy="8" r="1.2" fill="currentColor"/>
            <circle cx="10" cy="8" r="1.2" fill="currentColor"/>
            <circle cx="6" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="10" cy="12" r="1.2" fill="currentColor"/>
          </svg>
        </div>
        {#if hoveredDimension === dimension.id}
          <div class="quick-tooltip">
            {dimension.description}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Top Counties Highlight Control -->
  <div class="top-counties-control">
    <div class="control-header">
      <span class="control-title">Highlight Top Counties</span>
      <span class="control-value">{$topCountiesCount}</span>
    </div>
    <div class="count-options">
      {#each [5, 10, 25, 50] as count}
        <button
          class="count-option"
          class:active={$topCountiesCount === count}
          onclick={() => topCountiesCount.set(count)}
        >
          {count}
        </button>
      {/each}
    </div>
  </div>

  <!-- Bias Curve Control -->
  <div class="bias-control">
    <div class="control-header">
      <span
        class="control-title with-tooltip"
        title="Top priority: ~{(($dimensionWeights[0]?.weight ?? 0) * 100).toFixed(0)}% · Lowest: ~{(($dimensionWeights[$dimensionWeights.length - 1]?.weight ?? 0) * 100).toFixed(0)}%"
      >
        Priority Distribution
      </span>
      <span class="control-value">{$biasCurve.toFixed(1)}x</span>
    </div>
    <div class="slider-container">
      <span class="slider-icon" title="Even distribution">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 3h12"/>
          <path d="M12 3v18"/>
          <path d="M5 9l7-6 7 6"/>
          <path d="M5 9v6a2 2 0 0 0 2 2h3"/>
          <path d="M19 9v6a2 2 0 0 1-2 2h-3"/>
        </svg>
      </span>
      <input
        type="range"
        min="1.0"
        max="3.0"
        step="0.1"
        value={$biasCurve}
        oninput={(e) => biasCurve.set(parseFloat(e.currentTarget.value))}
        class="bias-slider"
      />
      <span class="slider-icon" title="Extreme bias">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </span>
    </div>
  </div>
</div>

<style>
  .control-panel {
    width: 380px;
    height: 100%;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-primary);
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .panel-header {
    flex-shrink: 0;
    position: relative;
  }

  .app-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    text-align: center;
    letter-spacing: -0.02em;
  }

  .button-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .bar-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.25rem;
    border: 2px solid var(--border-primary);
    background: var(--bg-primary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .bar-button:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  .bar-button.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
  }

  .bar-button svg {
    flex-shrink: 0;
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    text-align: center;
  }

  /* Unified Drawer Style */
  .drawer {
    background: var(--bg-tertiary);
    border: 2px solid var(--accent-primary);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .drawer h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem 0;
    text-align: center;
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.75rem 0.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-card:hover {
    border-color: var(--accent-primary);
    background: var(--bg-tertiary);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .preset-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .preset-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    line-height: 1.2;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .info-item {
    font-size: 0.85rem;
  }

  .info-item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .info-item strong {
    color: var(--text-primary);
  }

  .source-link {
    color: var(--accent-primary);
    display: inline-flex;
    align-items: center;
    transition: color 0.2s;
    flex-shrink: 0;
  }

  .source-link:hover {
    color: var(--accent-hover);
  }

  .info-item p {
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  .rank-list {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .rank-item {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-secondary);
    border-radius: 0;
    padding: 0.5rem 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: grab;
    transition: all 0.15s;
    position: relative;
  }

  .rank-item:last-child {
    border-bottom: none;
  }

  .rank-item:hover {
    background: var(--bg-secondary);
  }

  .rank-item:active {
    cursor: grabbing;
  }

  .rank-item.dragging {
    opacity: 0.4;
    background: var(--bg-tertiary);
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: var(--accent-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .rank-content {
    flex: 1;
    min-width: 0;
  }

  .rank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rank-name {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .dim-icon-inline {
    font-size: 1rem;
    line-height: 1;
  }

  .dim-icon {
    font-size: 0.95rem;
    margin-right: 0.25rem;
  }

  .rank-weight {
    font-size: 0.75rem;
    color: var(--accent-primary);
    font-weight: 600;
    white-space: nowrap;
  }

  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
    opacity: 0.4;
    transition: opacity 0.2s;
  }

  .rank-item:hover .drag-handle {
    opacity: 0.8;
  }

  .quick-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 0.5rem 0.625rem;
    border-radius: 4px;
    font-size: 0.75rem;
    line-height: 1.3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    pointer-events: none;
    white-space: normal;
  }

  .quick-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--text-primary);
  }

  .rank-item:active .drag-handle {
    cursor: grabbing;
  }

  .top-counties-control {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.75rem;
    flex-shrink: 0;
  }

  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .control-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .control-value {
    font-size: 0.85rem;
    color: var(--accent-gold);
    font-weight: 700;
  }

  .count-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .count-option {
    padding: 0.5rem;
    border: 2px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .count-option:hover {
    border-color: var(--border-active);
    background: var(--bg-primary);
  }

  .count-option.active {
    border-color: var(--accent-gold);
    background: var(--bg-tertiary);
    color: var(--accent-primary);
  }

  /* Bias Control */
  .bias-control {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.75rem;
    flex-shrink: 0;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .slider-icon {
    font-size: 1.25rem;
    line-height: 1;
    cursor: help;
    opacity: 0.7;
    transition: all 0.2s;
  }

  .slider-icon:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .bias-slider {
    flex: 1;
    height: 6px;
    appearance: none;
    background: var(--bg-tertiary);
    border-radius: 3px;
    outline: none;
    transition: background 0.2s;
  }

  .bias-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }

  .bias-slider::-webkit-slider-thumb:hover {
    background: var(--accent-hover);
    transform: scale(1.1);
  }

  .bias-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }

  .bias-slider::-moz-range-thumb:hover {
    background: var(--accent-hover);
    transform: scale(1.1);
  }

  /* Tooltip styling for weight info */
  .with-tooltip {
    cursor: help;
    text-decoration: underline dotted;
    text-decoration-color: var(--text-secondary);
    text-underline-offset: 3px;
  }
</style>
