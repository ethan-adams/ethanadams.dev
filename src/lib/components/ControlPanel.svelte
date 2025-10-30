<script lang="ts">
  import { dimensions } from '../data/dimensions';
  import { dimensionRankOrder, dimensionWeights, setDimensionRankOrder } from '../stores/dimensions';

  $: rankOrder = $dimensionRankOrder;
  $: weights = $dimensionWeights;

  // Get ordered dimensions based on rank
  $: orderedDimensions = rankOrder.map((id: string) => dimensions.find((d) => d.id === id)!);

  let draggedIndex: number | null = null;

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
    const newOrder = [...rankOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setDimensionRankOrder(newOrder);
    draggedIndex = null;
  }

  function handleDragEnd() {
    draggedIndex = null;
  }

  function getWeightForDimension(dimensionId: string): number {
    return weights.find((w) => w.dimensionId === dimensionId)?.weight ?? 0;
  }
</script>

<div class="control-panel">
  <div class="panel-header">
    <h2>Priority Ranking</h2>
    <p class="subtitle">Drag to reorder by importance</p>
  </div>

  <div class="rank-list">
    {#each orderedDimensions as dimension, index (dimension.id)}
      {@const weight = getWeightForDimension(dimension.id)}
      <div
        class="rank-item"
        class:dragging={draggedIndex === index}
        draggable="true"
        role="button"
        tabindex="0"
        on:dragstart={(e) => handleDragStart(e, index)}
        on:dragover={handleDragOver}
        on:drop={(e) => handleDrop(e, index)}
        on:dragend={handleDragEnd}
      >
        <div class="rank-badge">#{index + 1}</div>
        <div class="rank-content">
          <div class="rank-header">
            <span class="rank-name">{dimension.name}</span>
            <span class="rank-weight">{(weight * 100).toFixed(0)}%</span>
          </div>
          <p class="rank-description">{dimension.description}</p>
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
      </div>
    {/each}
  </div>

  <div class="weight-info">
    <p class="info-text">
      <strong>Top priority</strong> gets ~{((weights[0]?.weight ?? 0) * 100).toFixed(0)}% weight<br/>
      <strong>Lowest priority</strong> gets ~{((weights[weights.length - 1]?.weight ?? 0) * 100).toFixed(0)}% weight
    </p>
  </div>
</div>

<style>
  .control-panel {
    width: 340px;
    height: 100%;
    background: #f9fafb;
    border-right: 1px solid #e5e7eb;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .panel-header {
    flex-shrink: 0;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111827;
  }

  .subtitle {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rank-item {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: grab;
    transition: all 0.2s;
  }

  .rank-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
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
    background: #3b82f6;
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
    color: #111827;
  }

  .rank-weight {
    font-size: 0.85rem;
    color: #3b82f6;
    font-weight: 600;
  }

  .rank-description {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.4;
  }

  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
  }

  .rank-item:active .drag-handle {
    cursor: grabbing;
  }

  .weight-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 0.75rem;
    flex-shrink: 0;
  }

  .info-text {
    font-size: 0.85rem;
    color: #1e40af;
    line-height: 1.6;
  }
</style>
