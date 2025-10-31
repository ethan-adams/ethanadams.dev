<script lang="ts">
  import { dimensions } from '../data/dimensions';
  import { dimensionRankOrder, dimensionWeights, biasCurve, setDimensionRankOrder } from '../stores/dimensions';
  import { theme } from '../stores/theme';
  import { topCountiesCount } from '../stores/topCounties';

  // Get ordered dimensions based on rank
  const orderedDimensions = $derived($dimensionRankOrder.map((id: string) => dimensions.find((d) => d.id === id)!));

  let draggedIndex = $state<number | null>(null);
  let showInfoPanel = $state(false);
  let hoveredDimension = $state<string | null>(null);

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
    <div class="header-row">
      <h2>Priority Ranking</h2>
      <!-- Compact Round Theme Toggle -->
      <button
        class="theme-toggle-round"
        onclick={() => theme.toggle()}
        title={$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {#if $theme === 'light'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
      </button>
    </div>
    <p class="subtitle">Drag to reorder by importance</p>

    <button
      class="info-toggle"
      class:active={showInfoPanel}
      onclick={() => showInfoPanel = !showInfoPanel}
      title="View data sources and methodology"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      {showInfoPanel ? 'Hide Sources & Info' : 'Data Sources & Info'}
    </button>
  </div>

  {#if showInfoPanel}
    <div class="info-panel">
      <h3>Data Sources & Methodology</h3>
      <div class="info-content">
        {#each orderedDimensions as dimension}
          <div class="info-item">
            <div class="info-item-header">
              <strong>
                {#if dimension.icon}
                  <span class="dim-icon">{dimension.icon}</span>
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
                <span class="dim-icon-inline">{dimension.icon}</span>
              {/if}
              {dimension.name}
            </span>
            <span class="rank-weight">{(weight * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div class="drag-handle">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="4" r="1.5" fill="#999"/>
            <circle cx="10" cy="4" r="1.5" fill="#999"/>
            <circle cx="6" cy="8" r="1.5" fill="#999"/>
            <circle cx="10" cy="8" r="1.5" fill="#999"/>
            <circle cx="6" cy="12" r="1.5" fill="#999"/>
            <circle cx="10" cy="12" r="1.5" fill="#999"/>
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
      <span class="control-title">Priority Distribution</span>
      <span class="control-value">{$biasCurve.toFixed(1)}x</span>
    </div>
    <div class="slider-container">
      <span class="slider-icon" title="Even distribution">⚖️</span>
      <input
        type="range"
        min="1.0"
        max="3.0"
        step="0.1"
        value={$biasCurve}
        oninput={(e) => biasCurve.set(parseFloat(e.currentTarget.value))}
        class="bias-slider"
      />
      <span class="slider-icon" title="Extreme bias">🔥</span>
    </div>
  </div>

  <div class="weight-info">
    <p class="info-text">
      Top priority: ~{(($dimensionWeights[0]?.weight ?? 0) * 100).toFixed(0)}% ·
      Lowest: ~{(($dimensionWeights[$dimensionWeights.length - 1]?.weight ?? 0) * 100).toFixed(0)}%
    </p>
  </div>
</div>

<style>
  .control-panel {
    width: 380px;
    height: 100%;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-primary);
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .panel-header {
    flex-shrink: 0;
    position: relative;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    gap: 0.75rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }

  .subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  /* Compact Round Theme Toggle */
  .theme-toggle-round {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border-primary);
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .theme-toggle-round:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    transform: scale(1.05);
  }

  .theme-toggle-round:active {
    transform: scale(0.95);
  }

  .info-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-secondary);
    background: var(--bg-primary);
    border-radius: 6px;
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    justify-content: center;
  }

  .info-toggle:hover {
    background: var(--bg-secondary);
    border-color: var(--border-active);
    color: var(--accent-primary);
  }

  .info-toggle.active {
    background: var(--bg-tertiary);
    border-color: var(--border-active);
    color: var(--accent-primary);
  }

  .info-panel {
    background: var(--bg-primary);
    border: 2px solid var(--border-active);
    border-radius: 8px;
    padding: 1rem;
    margin-top: -0.5rem;
  }

  .info-panel h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rank-item {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: grab;
    transition: all 0.2s;
    position: relative;
  }

  .rank-item:hover {
    border-color: var(--border-active);
    box-shadow: var(--shadow-md);
  }

  .rank-item:active {
    cursor: grabbing;
  }

  .rank-item.dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }

  .rank-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
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
    margin-bottom: 0.25rem;
  }

  .rank-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dim-icon-inline {
    font-size: 1.2rem;
    line-height: 1;
  }

  .dim-icon {
    font-size: 1.1rem;
    margin-right: 0.35rem;
  }

  .rank-weight {
    font-size: 0.85rem;
    color: var(--accent-primary);
    font-weight: 600;
  }

  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
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
    padding: 1rem;
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
    padding: 1rem;
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

  .weight-info {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-active);
    border-radius: 6px;
    padding: 0.625rem;
    flex-shrink: 0;
    text-align: center;
  }

  .info-text {
    font-size: 0.8rem;
    color: var(--accent-primary);
    line-height: 1.6;
    margin: 0;
  }
</style>
