import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

const storage = (() => {
  let store = {}

  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
})

if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => 'test-uuid',
  }
}

Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  configurable: true,
})

Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  configurable: true,
  writable: true,
})
