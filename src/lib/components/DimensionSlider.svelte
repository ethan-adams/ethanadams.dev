<script lang="ts">
  import type { Dimension } from '../types';

  export let dimension: Dimension;
  export let weight: number;
  export let onWeightChange: (weight: number) => void;

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    onWeightChange(parseFloat(target.value));
  }
</script>

<div class="dimension-slider">
  <div class="slider-header">
    <label for={dimension.id}>{dimension.name}</label>
    <span class="weight-value">{(weight * 100).toFixed(0)}%</span>
  </div>
  <input
    type="range"
    id={dimension.id}
    min="0"
    max="1"
    step="0.01"
    value={weight}
    on:input={handleInput}
  />
  <p class="description">{dimension.description}</p>
</div>

<style>
  .dimension-slider {
    margin-bottom: 1.5rem;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .weight-value {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  input[type='range'] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-tertiary);
    outline: none;
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
  }

  input[type='range']::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
  }

  .description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
</style>
