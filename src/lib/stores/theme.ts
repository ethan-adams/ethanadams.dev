import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Detect OS/browser preference
function getInitialTheme(): Theme {
  if (!isBrowser) return 'light';

  // Check if user has a saved preference
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;

  // Otherwise, use OS/browser preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  if (isBrowser) {
    // Listen for OS theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        set(e.matches ? 'dark' : 'light');
      }
    });
  }

  return {
    subscribe,
    set: (theme: Theme) => {
      if (isBrowser) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      set(theme);
    },
    toggle: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (isBrowser) {
          localStorage.setItem('theme', newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
        return newTheme;
      });
    }
  };
}

export const theme = createThemeStore();
