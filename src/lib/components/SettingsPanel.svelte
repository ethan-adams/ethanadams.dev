<script lang="ts">
  import { theme } from '../stores/theme';

  let isOpen = $state(false);
</script>

<!-- Settings Button -->
<button class="settings-button" onclick={() => isOpen = !isOpen} title="Settings">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M1 12h6m6 0h6m-13.2 5.2l4.2-4.2m0-6L5.8 2.8"></path>
  </svg>
</button>

<!-- Settings Panel -->
{#if isOpen}
  <div
    class="settings-overlay"
    onclick={() => isOpen = false}
    onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
    role="button"
    tabindex="-1"
    aria-label="Close settings"
  ></div>
  <div class="settings-panel">
    <div class="settings-header">
      <h3>Settings</h3>
      <button class="close-button" onclick={() => isOpen = false} title="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>

    <div class="settings-content">
      <!-- Theme Setting -->
      <div class="setting-group">
        <div class="setting-label">
          <span class="label-text">Theme</span>
          <span class="label-description">Choose your preferred color scheme</span>
        </div>
        <div class="theme-options">
          <button
            class="theme-option"
            class:active={$theme === 'light'}
            onclick={() => theme.set('light')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            Light
          </button>
          <button
            class="theme-option"
            class:active={$theme === 'dark'}
            onclick={() => theme.set('dark')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            Dark
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-button {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    box-shadow: var(--shadow-md);
    transition: all 0.2s;
  }

  .settings-button:hover {
    border-color: var(--border-active);
    color: var(--accent-primary);
    transform: rotate(45deg);
  }

  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1001;
    backdrop-filter: blur(2px);
  }

  .settings-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 1002;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-primary);
  }

  .settings-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .close-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .settings-content {
    padding: 1.5rem;
  }

  .setting-group {
    margin-bottom: 1.5rem;
  }

  .setting-group:last-child {
    margin-bottom: 0;
  }

  .setting-label {
    display: block;
    margin-bottom: 0.75rem;
  }

  .label-text {
    display: block;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .label-description {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .theme-options {
    display: flex;
    gap: 0.75rem;
  }

  .theme-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid var(--border-primary);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .theme-option:hover {
    border-color: var(--border-active);
    background: var(--bg-secondary);
  }

  .theme-option.active {
    border-color: var(--accent-primary);
    background: var(--bg-tertiary);
    color: var(--accent-primary);
  }
</style>
