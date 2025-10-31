import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { theme } from '../theme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock document.documentElement
const mockSetAttribute = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true,
});

describe('theme store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockSetAttribute.mockClear();
  });

  it('should initialize with light theme by default', () => {
    expect(get(theme)).toBe('light');
  });

  it('should persist theme to localStorage when set', () => {
    theme.set('dark');
    expect(localStorageMock.getItem('theme')).toBe('dark');
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should toggle between light and dark', () => {
    theme.set('light');
    theme.toggle();
    expect(get(theme)).toBe('dark');

    theme.toggle();
    expect(get(theme)).toBe('light');
  });

  it('should set data-theme attribute on document element', () => {
    theme.set('dark');
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');

    theme.set('light');
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });
});
